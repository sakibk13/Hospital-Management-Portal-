import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from '@langchain/core/tools';
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getBackendOrigin = () => {
  const envUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return 'http://localhost:5000';
  return envUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

const getGeminiApiKey = () => {
  let key = process.env.GEMINI_API_KEY;
  if (!key) {
    try {
      const rootEnv = path.join(process.cwd(), '..', '.env');
      if (fs.existsSync(rootEnv)) {
        const lines = fs.readFileSync(rootEnv, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('GEMINI_API_KEY=')) {
            key = trimmed.replace('GEMINI_API_KEY=', '').trim();
            break;
          }
        }
      }
    } catch { /* ignore */ }
  }
  return key || '';
};

// Cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function extractTextContent(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && part.text) return part.text;
        return '';
      })
      .join('');
  }
  if (content && typeof content === 'object' && content.text) return content.text;
  return String(content || '');
}

// In-memory cache for documentation vectors
interface EmbeddedChunk {
  content: string;
  vector: number[];
}

let cachedChunks: EmbeddedChunk[] | null = null;

function loadEmbeddedChunks(apiKey: string): EmbeddedChunk[] {
  if (cachedChunks) return cachedChunks;

  const candidatePaths = [
    path.join(process.cwd(), 'public', 'chatbot_embeddings.json'),
    path.join(process.cwd(), 'chatbot_embeddings.json'),
    path.join(process.cwd(), '..', 'public', 'chatbot_embeddings.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        cachedChunks = JSON.parse(raw);
        return cachedChunks!;
      } catch (err) {
        console.error('Failed to parse cached embeddings:', err);
      }
    }
  }

  return [];
}

const queryEmbeddingCache = new Map<string, number[]>();

// Retrieve relevant documentation chunks using LangChain embeddings (with in-memory query caching)
async function retrieveRelevantDocumentation(query: string, apiKey: string, topK = 3): Promise<string> {
  const chunks = loadEmbeddedChunks(apiKey);
  if (!chunks || chunks.length === 0) {
    // Fallback: Read raw documentation directly if embeddings not available
    const docPaths = [
      path.join(process.cwd(), 'public', 'chatbot_documentation.txt'),
      path.join(process.cwd(), 'chatbot_documentation.txt'),
      path.join(process.cwd(), '..', 'chatbot_documentation.txt'),
    ];
    for (const dp of docPaths) {
      if (fs.existsSync(dp)) {
        return fs.readFileSync(dp, 'utf8').substring(0, 3000);
      }
    }
    return '';
  }

  try {
    const cacheKey = query.trim().toLowerCase();
    let queryVec = queryEmbeddingCache.get(cacheKey);

    if (!queryVec) {
      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey,
        model: 'gemini-embedding-001',
        maxRetries: 0,
      });
      queryVec = await embeddings.embedQuery(query);
      if (queryEmbeddingCache.size > 200) queryEmbeddingCache.clear();
      queryEmbeddingCache.set(cacheKey, queryVec);
    }

    const scored = chunks.map((c) => ({
      content: c.content,
      score: cosineSimilarity(queryVec!, c.vector),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.content).join('\n---\n');
  } catch (err) {
    console.warn('[RAG Retrieval] Quick fallback without embedding call:', err);
    return chunks.slice(0, topK).map((c) => c.content).join('\n---\n');
  }
}

// -----------------------------------------------------------------------------
// Existing Application API Tools (Structured Function Calling)
// -----------------------------------------------------------------------------
const backendOrigin = getBackendOrigin();

const bloodAvailabilityTool = tool(
  async ({ bloodGroup }) => {
    try {
      const res = await fetch(`${backendOrigin}/api/BloodAvailability`, { cache: 'no-store' });
      if (!res.ok) return JSON.stringify({ error: 'Failed to fetch blood stock' });
      const data = await res.json();
      if (bloodGroup && Array.isArray(data)) {
        const normalized = bloodGroup.trim().toUpperCase();
        const item = data.find((d: any) => d.bloodGroup?.toUpperCase() === normalized);
        return JSON.stringify(item || { bloodGroup, count: 0, note: 'No stock recorded for this blood group' });
      }
      return JSON.stringify(data);
    } catch {
      return JSON.stringify({ error: 'Blood bank service temporarily unavailable' });
    }
  },
  {
    name: 'get_blood_availability',
    description: 'Check live blood units available in the Blood Bank per blood group (e.g. A+, A-, B+, B-, AB+, AB-, O+, O-)',
    schema: z.object({
      bloodGroup: z.string().optional().describe('Blood group identifier like A+, O-, B+, etc.'),
    }),
  }
);

const searchDoctorsTool = tool(
  async ({ specialty, department, doctorName }) => {
    try {
      const res = await fetch(`${backendOrigin}/api/Doctors/all`, { cache: 'no-store' });
      if (!res.ok) return JSON.stringify({ error: 'Failed to fetch doctors list' });
      let doctors: any[] = await res.json();

      if (specialty) {
        const spec = specialty.toLowerCase();
        doctors = doctors.filter((d) =>
          d.specialty?.toLowerCase().includes(spec) ||
          d.department?.toLowerCase().includes(spec)
        );
      } else if (department) {
        const dept = department.toLowerCase();
        doctors = doctors.filter((d) => d.department?.toLowerCase().includes(dept));
      }

      if (doctorName) {
        const name = doctorName.toLowerCase();
        doctors = doctors.filter((d) =>
          `${d.firstName} ${d.lastName}`.toLowerCase().includes(name)
        );
      }

      const summary = doctors.map((d) => ({
        name: `Dr. ${d.firstName} ${d.lastName}`,
        specialty: d.specialty,
        department: d.department,
        degrees: d.degrees,
        institute: d.institute,
        availability: d.availability,
        email: d.email,
      }));

      return JSON.stringify(summary.slice(0, 8));
    } catch {
      return JSON.stringify({ error: 'Doctor service temporarily unreachable' });
    }
  },
  {
    name: 'search_doctors',
    description: 'Search for specialist doctors by medical specialty, condition (e.g., heart specialist, brain specialist, pediatrician, dermatology), department, or name',
    schema: z.object({
      specialty: z.string().optional().describe('Medical specialty, condition, or health issue (e.g. Cardiology, Heart, Neurology, Pediatrics, Skin, Orthopedics)'),
      department: z.string().optional().describe('Department name in the hospital'),
      doctorName: z.string().optional().describe('Doctor name to look up'),
    }),
  }
);

const getDepartmentsTool = tool(
  async () => {
    try {
      const res = await fetch(`${backendOrigin}/api/Appointments/departments`, { cache: 'no-store' });
      if (!res.ok) return JSON.stringify({ departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'General Medicine'] });
      return JSON.stringify(await res.json());
    } catch {
      return JSON.stringify({ departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'General Medicine'] });
    }
  },
  {
    name: 'get_departments',
    description: 'Retrieve the list of all medical departments in HealingWave Hospital',
    schema: z.object({}),
  }
);

const getPatientDetailsTool = tool(
  async ({ email, searchQuery }) => {
    try {
      if (email) {
        const res = await fetch(`${backendOrigin}/api/Patients/pdetails/email/${encodeURIComponent(email.trim())}`, { cache: 'no-store' });
        if (res.ok) {
          const p = await res.json();
          return JSON.stringify({
            name: p.name,
            email: p.email,
            bloodGroup: p.bloodGroup,
            mobileNumber: p.mobileNumber,
            address: p.address,
            emergencyContact: p.emergencyContact,
          });
        }
      }
      if (searchQuery) {
        const res = await fetch(`${backendOrigin}/api/Patients/pdetails/search?searchQuery=${encodeURIComponent(searchQuery.trim())}`, { cache: 'no-store' });
        if (res.ok) {
          const list: any[] = await res.json();
          return JSON.stringify(list.slice(0, 3).map((p) => ({
            name: p.name,
            email: p.email,
            bloodGroup: p.bloodGroup,
            mobileNumber: p.mobileNumber,
          })));
        }
      }
      return JSON.stringify({ message: 'Patient not found' });
    } catch {
      return JSON.stringify({ error: 'Patient lookup service unreachable' });
    }
  },
  {
    name: 'get_patient_details',
    description: 'Retrieve patient profile, blood group, contact info, and emergency details by patient email or search query',
    schema: z.object({
      email: z.string().optional().describe('Patient email address'),
      searchQuery: z.string().optional().describe('Patient name or phone query'),
    }),
  }
);

const getPatientAppointmentsTool = tool(
  async ({ patientEmail }) => {
    try {
      const res = await fetch(`${backendOrigin}/api/Appointments/patient/email/${encodeURIComponent(patientEmail.trim())}`, { cache: 'no-store' });
      if (!res.ok) return JSON.stringify({ message: 'No appointments found' });
      const appointments = await res.json();
      return JSON.stringify(appointments);
    } catch {
      return JSON.stringify({ error: 'Appointments service unreachable' });
    }
  },
  {
    name: 'get_patient_appointments',
    description: 'Retrieve scheduled and past hospital appointments for a patient using their email address',
    schema: z.object({
      patientEmail: z.string().describe('Email address of the patient'),
    }),
  }
);

const searchMedicinesTool = tool(
  async ({ query }) => {
    try {
      const res = await fetch(`${backendOrigin}/api/Medicines`, { cache: 'no-store' });
      if (!res.ok) return JSON.stringify({ error: 'Failed to fetch medicines' });
      let meds: any[] = await res.json();
      if (query) {
        const q = query.toLowerCase();
        meds = meds.filter((m) =>
          m.name?.toLowerCase().includes(q) ||
          m.genericName?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q)
        );
      }
      const summary = meds.slice(0, 6).map((m) => ({
        name: m.name,
        genericName: m.genericName,
        dosageForm: m.dosageForm,
        strength: m.strength,
        price: `${m.price} BDT`,
        inStock: m.strip > 0 ? `${m.strip} strips` : 'Out of stock',
        manufacturer: m.manufacturer,
      }));
      return JSON.stringify(summary);
    } catch {
      return JSON.stringify({ error: 'Pharmacy service unreachable' });
    }
  },
  {
    name: 'search_medicines',
    description: 'Search for prescription and OTC medicines in the hospital pharmacy catalog by brand or generic name',
    schema: z.object({
      query: z.string().optional().describe('Medicine brand name, generic name, or therapeutic category (e.g. Napa, Paracetamol, Seclo, Ciprocin)'),
    }),
  }
);

const getPatientPrescriptionsTool = tool(
  async ({ patientEmail }) => {
    try {
      const res = await fetch(`${backendOrigin}/api/Prescriptions/patient/email/${encodeURIComponent(patientEmail.trim())}`, { cache: 'no-store' });
      if (!res.ok) return JSON.stringify({ message: 'No medical records found' });
      const records = await res.json();
      return JSON.stringify(records);
    } catch {
      return JSON.stringify({ error: 'Medical records service unreachable' });
    }
  },
  {
    name: 'get_patient_prescriptions',
    description: 'Retrieve patient medical records, doctor prescriptions, diagnosis, and prescription advice by patient email',
    schema: z.object({
      patientEmail: z.string().describe('Patient email address to retrieve prescriptions for'),
    }),
  }
);

const getHealthCardTool = tool(
  async ({ email }) => {
    try {
      const res = await fetch(`${backendOrigin}/api/HealthCards/${encodeURIComponent(email.trim())}`, { cache: 'no-store' });
      if (!res.ok) return JSON.stringify({ message: 'Health card not found for this email' });
      const card = await res.json();
      return JSON.stringify({
        patientName: card.patientName,
        cardNumber: card.cardNumber,
        balance: card.balance,
        points: card.points,
        status: card.status || 'Active',
      });
    } catch {
      return JSON.stringify({ error: 'Health card service unreachable' });
    }
  },
  {
    name: 'get_health_card',
    description: 'Look up a patient Health Card details, card number, balance, and points by email address',
    schema: z.object({
      email: z.string().describe('Patient email address'),
    }),
  }
);

const getBedCabinAvailabilityTool = tool(
  async () => {
    try {
      const [cabinRes, wardRes] = await Promise.allSettled([
        fetch(`${backendOrigin}/api/cabinBooking/cavailable`, { cache: 'no-store' }),
        fetch(`${backendOrigin}/api/wardBooking/wavailable`, { cache: 'no-store' }),
      ]);
      const availableCabins = cabinRes.status === 'fulfilled' && cabinRes.value.ok ? await cabinRes.value.json() : [];
      const availableWards = wardRes.status === 'fulfilled' && wardRes.value.ok ? await wardRes.value.json() : [];
      return JSON.stringify({ availableCabinsCount: availableCabins.length, availableWardsCount: availableWards.length });
    } catch {
      return JSON.stringify({ error: 'Bed and cabin booking service unreachable' });
    }
  },
  {
    name: 'get_bed_cabin_availability',
    description: 'Check availability of patient hospital cabins and general ward beds',
    schema: z.object({}),
  }
);

const bookAppointmentTool = tool(
  async ({ patientName, patientEmail, patientPhone, doctorName, department, date, timeSlot }) => {
    try {
      let resolvedDoctorName = doctorName || '';
      let resolvedDoctorEmail = '';
      let resolvedDept = department || '';

      if (doctorName || department) {
        try {
          const docRes = await fetch(`${backendOrigin}/api/Doctors/all`, { cache: 'no-store' });
          if (docRes.ok) {
            const doctors: any[] = await docRes.json();
            const found = doctors.find((d: any) =>
              (doctorName && `${d.firstName} ${d.lastName}`.toLowerCase().includes(doctorName.toLowerCase())) ||
              (department && d.department?.toLowerCase() === department.toLowerCase())
            );
            if (found) {
              resolvedDoctorName = `Dr. ${found.firstName} ${found.lastName}`;
              resolvedDoctorEmail = found.email;
              resolvedDept = found.department || resolvedDept;
            }
          }
        } catch { /* proceed */ }
      }

      let appointmentDate = new Date();
      if (date) {
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) appointmentDate = parsed;
      } else {
        appointmentDate.setDate(appointmentDate.getDate() + 1);
      }

      const payload = {
        patientName,
        patientEmail,
        patientPhone: patientPhone || '',
        doctorName: resolvedDoctorName || 'Assigned Specialist',
        doctorEmail: resolvedDoctorEmail,
        department: resolvedDept || 'General Medicine',
        date: appointmentDate.toISOString(),
        timeSlot: timeSlot || 'Morning (10:00 AM)',
        status: 'pending',
        paidStatus: 'unpaid',
      };

      const res = await fetch(`${backendOrigin}/api/Appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return JSON.stringify({ error: 'Failed to create appointment in database' });
      }

      const created = await res.json();
      return JSON.stringify({
        success: true,
        message: 'Appointment booked successfully!',
        appointmentId: created.id || created._id,
        doctor: resolvedDoctorName || 'Assigned Specialist',
        department: resolvedDept || 'General Medicine',
        patient: patientName,
        date: appointmentDate.toDateString(),
        timeSlot: timeSlot || 'Morning (10:00 AM)',
        status: 'pending',
      });
    } catch (err: any) {
      return JSON.stringify({ error: 'Failed to connect to appointments service: ' + err.message });
    }
  },
  {
    name: 'book_appointment',
    description: 'Book an appointment with a doctor for a patient. Performs direct creation via Appointments API. Requires patientName and patientEmail; accepts patientPhone, doctorName, department, date, and timeSlot. If patient name or email is missing, ask the user first.',
    schema: z.object({
      patientName: z.string().describe('Full name of the patient'),
      patientEmail: z.string().describe('Email address of the patient'),
      patientPhone: z.string().optional().describe('Phone number of the patient'),
      doctorName: z.string().optional().describe('Doctor name to book with (e.g., Dr. Mahmudul Hasan, Dr. Thomas Shelby)'),
      department: z.string().optional().describe('Department name (e.g. Cardiology, Neurology)'),
      date: z.string().optional().describe('Preferred appointment date (YYYY-MM-DD or readable date)'),
      timeSlot: z.string().optional().describe('Preferred time slot, e.g. 10:00 AM, Evening, 4:00 PM'),
    }),
  }
);

const cancelAppointmentTool = tool(
  async ({ appointmentId }) => {
    try {
      const res = await fetch(`${backendOrigin}/api/Appointments/${encodeURIComponent(appointmentId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) return JSON.stringify({ error: 'Failed to cancel appointment' });
      return JSON.stringify({ success: true, message: 'Appointment cancelled successfully' });
    } catch {
      return JSON.stringify({ error: 'Appointments service unreachable' });
    }
  },
  {
    name: 'cancel_appointment',
    description: 'Cancel a booked appointment using the appointment ID',
    schema: z.object({
      appointmentId: z.string().describe('The ID of the appointment to cancel'),
    }),
  }
);

const tools = [
  bloodAvailabilityTool,
  searchDoctorsTool,
  getDepartmentsTool,
  getPatientDetailsTool,
  getPatientAppointmentsTool,
  bookAppointmentTool,
  cancelAppointmentTool,
  searchMedicinesTool,
  getPatientPrescriptionsTool,
  getHealthCardTool,
  getBedCabinAvailabilityTool,
];

const toolMap: Record<string, any> = {
  get_blood_availability: bloodAvailabilityTool,
  search_doctors: searchDoctorsTool,
  get_departments: getDepartmentsTool,
  get_patient_details: getPatientDetailsTool,
  get_patient_appointments: getPatientAppointmentsTool,
  book_appointment: bookAppointmentTool,
  cancel_appointment: cancelAppointmentTool,
  search_medicines: searchMedicinesTool,
  get_patient_prescriptions: getPatientPrescriptionsTool,
  get_health_card: getHealthCardTool,
  get_bed_cabin_availability: getBedCabinAvailabilityTool,
};

// -----------------------------------------------------------------------------
// POST /api/chatbot/chat Route Handler
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message?.trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ response: 'Please enter a valid message.' }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json({
        response: 'The chatbot service is currently being configured (missing server-side API key). Please visit [Support](/support) for immediate assistance.',
        source: 'config-error',
      });
    }

    // 1. LangChain RAG: Semantic retrieval from documentation
    const retrievedDocs = await retrieveRelevantDocumentation(message, apiKey, 3);

    // 2. Build system prompt with strictly grounded instructions
    const systemPrompt = `You are HealingWave Assistant, the official AI assistant and proactive agent for HealingWave Hospital Web Portal.
Answer concisely (2-4 sentences) using the retrieved documentation and structured tools.

CRITICAL BEHAVIOR RULES:
1. GENERAL INQUIRIES: When the user asks generally what you or the chatbot can do or what features exist (e.g. "What can you do?", "Help me", "What features do you have?", "Hello"), you must invite them to choose and list ONLY these feature names:
What feature would you like to know about?
- Blood Bank
- Doctor Details
- Patient Details
- Appointments
- Departments
- Medicines
- Medical Records
- Health Card
- Bed & Cabin Booking

2. AGENTIC ACTIONS (APPOINTMENT BOOKING):
- You are an active AGENT capable of executing actions on behalf of the user, NOT merely a passive info bot.
- When a user asks to book an appointment (e.g. "I want to book an appointment with Dr. Mahmudul Hasan", "Book an appointment for me with a cardiologist"):
  a) Check if you already know their patient name, email, preferred date, and doctor/specialty.
  b) If their name or email is missing, ask the user for their name and email (and preferred date/time slot).
  c) Once you have their name and email (either from the current message or previous conversation history), IMMEDIATELY call the book_appointment tool to create the appointment in the hospital database!
  d) After booking, give them a warm confirmation with the Doctor's name, Date, Time, and a link to view it on [Appointments](/appointments).

3. SEMANTIC UNDERSTANDING & INTENT ROUTING:
- Inquiries like "heart specialist", "cardiology", "chest pain", or "heart doctor" must all be recognized as Cardiology and route to the doctor search tool.
- Inquiries for live blood stock (e.g., "Do you have O- blood?", "Blood availability") must call the get_blood_availability tool.
- Inquiries about blood compatibility rules (e.g. "Who can donate to O-?", "universal donor") must be answered directly from the documentation without calling an API.
- Inquiries about patient details, appointments, or prescriptions should ask for the patient email if not already provided in conversation context.
- For static/general questions (about hospital, contact, support), answer directly from retrieved documentation.
- For queries completely outside hospital services (e.g. sports, coding, politics), politely decline and state that you assist with HealingWave Hospital services only.

4. LINKS: Always use markdown links in the format [Page Name](/route), e.g. [Doctors](/doctors), [Blood Bank](/blood-bank), [Pharmacy](/pharmacy), [Support](/support), [Appointments](/appointments).
5. SAFETY: You are not a medical practitioner. Never give definitive clinical diagnoses or prescribe drugs. Always advise seeing a specialist.

RETRIEVED DOCUMENTATION CONTEXT:
${retrievedDocs}`;

    // 3. Multi-Model Failover Candidate Pool (Lite models are ultra-fast ~1s and have generous quotas)
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
      'gemini-3-flash-preview',
    ];

    // 4. Construct conversation memory from multi-turn history
    const conversationMessages: (SystemMessage | HumanMessage | AIMessage | ToolMessage)[] = [
      new SystemMessage(systemPrompt),
    ];

    const sanitizedHistory = history.filter((h: any, idx: number) => {
      // Avoid duplicating the current message if it was passed as the last history item
      if (idx === history.length - 1 && h.role === 'user' && h.content?.trim() === message) {
        return false;
      }
      return true;
    });

    for (const h of sanitizedHistory.slice(-8)) {
      if (h.role === 'user' && h.content) {
        conversationMessages.push(new HumanMessage(h.content));
      } else if ((h.role === 'assistant' || h.role === 'bot') && h.content) {
        conversationMessages.push(new AIMessage(h.content));
      }
    }

    conversationMessages.push(new HumanMessage(message));

    // 5. Invoke Gemini with automatic multi-model failover (zero retry delay)
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = new ChatGoogleGenerativeAI({
          apiKey,
          model: modelName,
          temperature: 0.2,
          maxRetries: 0,
        });
        const modelWithTools = model.bindTools(tools);

        const aiResponse = await modelWithTools.invoke(conversationMessages);

        // If model requested tool calls, execute them and obtain final synthesized response
        if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
          const toolMessages: ToolMessage[] = [];
          for (const call of aiResponse.tool_calls) {
            const targetTool = toolMap[call.name];
            if (targetTool) {
              try {
                const toolResult = await targetTool.invoke(call.args);
                toolMessages.push(
                  new ToolMessage({
                    content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
                    tool_call_id: call.id || call.name,
                  })
                );
              } catch (err: any) {
                toolMessages.push(
                  new ToolMessage({
                    content: JSON.stringify({ error: err.message || 'Tool execution failed' }),
                    tool_call_id: call.id || call.name,
                  })
                );
              }
            }
          }

          const finalResponse = await model.invoke([
            ...conversationMessages,
            aiResponse,
            ...toolMessages,
          ]);

          const finalContent = extractTextContent(finalResponse.content);

          return NextResponse.json({
            response: finalContent.trim(),
            source: 'gemini-langchain-rag',
            model: modelName,
          });
        }

        const outputText = extractTextContent(aiResponse.content);

        return NextResponse.json({
          response: outputText.trim(),
          source: 'gemini-langchain-rag',
          model: modelName,
        });
      } catch (err: any) {
        lastError = err;
        console.warn(`[Chatbot RAG] Model ${modelName} returned error (${err.message}). Failing over to next model...`);
      }
    }

    throw lastError || new Error('All candidate models exhausted');
  } catch (error: any) {
    console.error('Chatbot RAG API error:', error);
    return NextResponse.json(
      {
        response: 'I am here to assist you with HealingWave services. You can explore [Doctors](/doctors), check [Blood Bank](/blood-bank), or visit [Support](/support) for immediate assistance.',
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}
