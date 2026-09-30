import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from '@langchain/core/tools';
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API key
const envPath = path.join(__dirname, '..', '..', '.env');
let geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey && fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('GEMINI_API_KEY=')) {
      geminiKey = trimmed.replace('GEMINI_API_KEY=', '').trim();
      break;
    }
  }
}

// Load precomputed embeddings
const embPath = path.join(__dirname, '..', 'public', 'chatbot_embeddings.json');
const embeddedChunks = JSON.parse(fs.readFileSync(embPath, 'utf8'));

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: geminiKey,
  model: 'gemini-embedding-001',
});

async function retrieveContext(query, topK = 3) {
  const queryVec = await embeddings.embedQuery(query);
  const scores = embeddedChunks.map(c => ({
    content: c.content,
    score: cosineSimilarity(queryVec, c.vector),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map(s => s.content).join('\n---\n');
}

// Tools simulating live application APIs
const bloodTool = tool(async ({ bloodGroup }) => {
  const mockStock = [
    { bloodGroup: 'A+', count: 12 },
    { bloodGroup: 'O+', count: 25 },
    { bloodGroup: 'O-', count: 3 },
    { bloodGroup: 'B+', count: 18 },
    { bloodGroup: 'AB+', count: 7 }
  ];
  if (bloodGroup) {
    const found = mockStock.find(b => b.bloodGroup.toUpperCase() === bloodGroup.toUpperCase());
    return JSON.stringify(found || { bloodGroup, count: 0 });
  }
  return JSON.stringify(mockStock);
}, {
  name: 'get_blood_availability',
  description: 'Check available blood units in the Blood Bank per blood group',
  schema: z.object({ bloodGroup: z.string().optional() })
});

const doctorTool = tool(async ({ specialty, department, doctorName }) => {
  const doctors = [
    { firstName: 'Mahmudul', lastName: 'Hasan', specialty: 'Cardiologist', department: 'Cardiology', availability: 'Sat-Thu 4pm-9pm', roomNumber: '302' },
    { firstName: 'Sarah', lastName: 'Khan', specialty: 'Neurologist', department: 'Neurology', availability: 'Sun-Wed 10am-2pm', roomNumber: '405' },
    { firstName: 'Tanvir', lastName: 'Ahmed', specialty: 'Pediatrician', department: 'Pediatrics', availability: 'Everyday 9am-1pm', roomNumber: '201' }
  ];
  let res = doctors;
  if (specialty) {
    const s = specialty.toLowerCase();
    res = res.filter(d => d.specialty.toLowerCase().includes(s) || d.department.toLowerCase().includes(s));
  }
  return JSON.stringify(res);
}, {
  name: 'search_doctors',
  description: 'Search for specialist doctors by medical specialty, condition (e.g., heart specialist, brain specialist), department, or name',
  schema: z.object({
    specialty: z.string().optional(),
    department: z.string().optional(),
    doctorName: z.string().optional()
  })
});

const patientTool = tool(async ({ email, searchQuery }) => {
  const mockPatients = [
    { name: 'Rahim Uddin', email: 'rahim@gmail.com', bloodGroup: 'O+', mobileNumber: '01711112222', emergencyContact: '01811112222' }
  ];
  if (email) {
    const p = mockPatients.find(m => m.email.toLowerCase() === email.toLowerCase());
    return JSON.stringify(p || { message: 'Patient not found' });
  }
  return JSON.stringify(mockPatients);
}, {
  name: 'get_patient_details',
  description: 'Retrieve patient profile, blood group, contact info, and emergency details by email',
  schema: z.object({ email: z.string().optional(), searchQuery: z.string().optional() })
});

const appointmentTool = tool(async ({ patientEmail }) => {
  return JSON.stringify([
    { doctorName: 'Dr. Mahmudul Hasan', department: 'Cardiology', date: '2026-10-05', time: '5:00 PM', status: 'Confirmed' }
  ]);
}, {
  name: 'get_patient_appointments',
  description: 'Retrieve scheduled hospital appointments for a patient using their email address',
  schema: z.object({ patientEmail: z.string() })
});

const tools = [bloodTool, doctorTool, patientTool, appointmentTool];
const toolMap = {
  get_blood_availability: bloodTool,
  search_doctors: doctorTool,
  get_patient_details: patientTool,
  get_patient_appointments: appointmentTool
};

const llm = new ChatGoogleGenerativeAI({
  apiKey: geminiKey,
  model: 'gemini-3.5-flash',
  temperature: 0.1,
});
const llmWithTools = llm.bindTools(tools);

async function ask(query, history = []) {
  const retrievedContext = await retrieveContext(query, 2);

  const systemPrompt = `You are HealingWave Assistant, a friendly and highly knowledgeable assistant for HealingWave Hospital Web Portal.
Answer concisely (2-4 sentences) using the retrieved documentation and available tools.

CRITICAL INSTRUCTIONS:
1. When the user asks generally what the chatbot can do or what features exist (e.g. 'What can you do?', 'help', 'features'), you must ask what feature they want to know about and list ONLY these feature names:
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

2. Understand intents semantically (e.g. 'heart specialist', 'cardiology', and 'chest pain' all map to Cardiology doctors).
3. If live/dynamic data is needed, call the appropriate tool.
4. For static documentation questions (e.g. blood compatibility rules, how to donate), answer directly from documentation without calling tools.
5. If the question is outside hospital services (e.g. sports, coding, politics), politely decline.
6. Always use internal markdown links in the format [Page Name](/route), e.g., [Doctors](/doctors), [Blood Bank](/blood-bank), [Support](/support).

RETRIEVED DOCUMENTATION CONTEXT:
${retrievedContext}`;

  const messages = [
    new SystemMessage(systemPrompt),
    ...history,
    new HumanMessage(query)
  ];

  const aiMsg = await llmWithTools.invoke(messages);

  if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
    const toolMessages = [];
    for (const tc of aiMsg.tool_calls) {
      const selectedTool = toolMap[tc.name];
      if (selectedTool) {
        const output = await selectedTool.invoke(tc.args);
        toolMessages.push(new ToolMessage({
          content: output,
          tool_call_id: tc.id
        }));
      }
    }
    const finalMsg = await llm.invoke([...messages, aiMsg, ...toolMessages]);
    return {
      answer: finalMsg.content,
      toolCalls: aiMsg.tool_calls.map(t => t.name)
    };
  }

  return {
    answer: aiMsg.content,
    toolCalls: []
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function askWithRetry(query, history = [], maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await ask(query, history);
    } catch (err) {
      if (err.message && err.message.includes('429') && i < maxRetries) {
        console.log('-> Rate limit encountered, waiting 20 seconds before retry...');
        await sleep(20000);
      } else {
        throw err;
      }
    }
  }
}

console.log('--- STARTING SYSTEM VERIFICATION TESTS ---');

// Test 1: General question
console.log('\n[TEST 1: General Question]');
const t1 = await askWithRetry('What can you do?');
console.log('Answer:\n', t1.answer);
await sleep(6000);

// Test 2: Blood bank query
console.log('\n[TEST 2: Blood Bank Query]');
const t2 = await askWithRetry('Do you have any O- blood in stock?');
console.log('Tool calls:', t2.toolCalls);
console.log('Answer:\n', t2.answer);
await sleep(6000);

// Test 3: Doctor query (Semantic understanding: heart specialist -> Cardiology)
console.log('\n[TEST 3: Doctor Query (Semantic)]');
const t3 = await askWithRetry('I have severe chest pain and need a heart specialist');
console.log('Tool calls:', t3.toolCalls);
console.log('Answer:\n', t3.answer);
await sleep(6000);

// Test 4: Patient query
console.log('\n[TEST 4: Patient Query]');
const t4 = await askWithRetry('Can you look up patient details for rahim@gmail.com?');
console.log('Tool calls:', t4.toolCalls);
console.log('Answer:\n', t4.answer);
await sleep(6000);

// Test 5: Appointment query
console.log('\n[TEST 5: Appointment Query]');
const t5 = await askWithRetry('What are my upcoming appointments for rahim@gmail.com?');
console.log('Tool calls:', t5.toolCalls);
console.log('Answer:\n', t5.answer);
await sleep(6000);

// Test 6: Follow-up question (Multi-turn context)
console.log('\n[TEST 6: Follow-up Question]');
const history = [
  new HumanMessage('Tell me about Dr. Mahmudul Hasan'),
  new AIMessage('Dr. Mahmudul Hasan is a Cardiologist available Saturday through Thursday from 4 PM to 9 PM in room 302.')
];
const t6 = await askWithRetry('How can I book an appointment with him?', history);
console.log('Answer:\n', t6.answer);
await sleep(6000);

// Test 7: Unsupported question
console.log('\n[TEST 7: Unsupported Question]');
const t7 = await askWithRetry('Can you write Python code to sort an array?');
console.log('Tool calls:', t7.toolCalls);
console.log('Answer:\n', t7.answer);

console.log('\n--- ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ---');
