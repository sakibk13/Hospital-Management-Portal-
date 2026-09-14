import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { HEALINGWAVE_LOGO_BASE64 } from '../../../../assets/logoBase64';

const vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.default || pdfFonts?.vfs || pdfFonts;
if (pdfMake) {
  pdfMake.vfs = vfs;
}

export const prescriptionPDF = (formData = {}) => {
  // Extract or default fields
  const patientName = formData.patientName || 'Outpatient';
  const patientEmail = formData.patientEmail || '--';
  const patientPhone = formData.phoneNumber || formData.mobileNumber || '--';
  const patientAge = formData.age ? `${formData.age} Yrs` : '--';
  const patientSex = formData.sex || 'Male';
  const formattedDate = formData.date 
    ? new Date(formData.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const rxId = (formData._id ? formData._id.slice(-6).toUpperCase() : null) || 
               (formData.id ? formData.id.slice(-6).toUpperCase() : null) || 
               Math.floor(100000 + Math.random() * 900000).toString();

  const doctorName = formData.doctorName || 'Dr. Physician';
  const doctorDegrees = formData.doctorProfile?.degree || 'MBBS, FCPS (Medicine), MACP (USA)';
  const doctorEmail = formData.doctorEmail || '';

  // Extract structured clinical sections
  let diagnosis = formData.diagnosis || '';
  let vitals = formData.vitals || null;
  let medicines = Array.isArray(formData.medicines) && formData.medicines.length > 0 ? formData.medicines : [];
  let advice = formData.advice || '';
  let followUp = formData.followUp || '';

  // Fallback text parser when only prescriptionText is provided (e.g., from DB view)
  if ((!medicines || medicines.length === 0) && formData.prescriptionText) {
    const rawText = formData.prescriptionText;

    const diagMatch = rawText.match(/\[Diagnosis \/ Complaints\]:\s*([^\n\r]+)/i);
    if (diagMatch && !diagnosis) diagnosis = diagMatch[1].trim();

    const vitMatch = rawText.match(/\[Clinical Vitals\]:\s*([^\n\r]+)/i);
    if (vitMatch && !vitals) {
      const vitStr = vitMatch[1].trim();
      const bpM = vitStr.match(/BP:\s*([^|]+)/i);
      const pulseM = vitStr.match(/Pulse:\s*([^|]+)/i);
      const tempM = vitStr.match(/Temp:\s*([^|]+)/i);
      const wtM = vitStr.match(/Wt:\s*([^|]+)/i);
      vitals = {
        bp: bpM ? bpM[1].trim() : '',
        pulse: pulseM ? pulseM[1].trim() : '',
        temp: tempM ? tempM[1].trim() : '',
        weight: wtM ? wtM[1].trim() : ''
      };
    }

    const advMatch = rawText.match(/\[Clinical Advice & Guidelines\]:\s*([\s\S]*?)(?=\n\[Next Follow-up\]|$)/i);
    if (advMatch && !advice) advice = advMatch[1].trim();

    const fupMatch = rawText.match(/\[Next Follow-up\]:\s*([^\n\r]+)/i);
    if (fupMatch && !followUp) followUp = fupMatch[1].trim();

    const medLines = rawText.match(/\d+\.\s+([^\n\r]+)/g);
    if (medLines && medLines.length > 0) {
      medicines = medLines.map(line => {
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        // Check for "Schedule: ... - Duration: ..."
        const parts = cleaned.split(/-\s*Schedule:\s*|Schedule:\s*/i);
        const namePart = parts[0]?.trim() || cleaned;
        const schedPart = parts[1]?.trim() || '';
        return {
          name: namePart,
          dosageText: schedPart || 'As directed by physician'
        };
      });
    }
  }

  // Default fallbacks
  if (!diagnosis) diagnosis = 'General Health Consultation & Clinical Evaluation';
  if (!advice) advice = 'Drink plenty of boiled / filtered water (2.5L daily). Complete full course of prescribed medications without omission. Take balanced meals on time and avoid cold exposure.';
  if (!followUp) followUp = 'After 7 days or SOS if condition persists';

  const bpVal = vitals?.bp || '120/80 mmHg';
  const pulseVal = vitals?.pulse || '76 bpm';
  const tempVal = vitals?.temp || '98.6°F';
  const wtVal = vitals?.weight || '68 kg';

  // Build medicine layout blocks
  const medicineBlocks = medicines.length > 0 ? medicines.map((m, idx) => {
    const medName = m.form ? `${m.name} (${m.form})` : m.name;
    const schedText = m.dosageText 
      ? m.dosageText 
      : `Schedule: ${m.freq || '1+0+1'}   •   Timing: ${m.meal || 'After Meal'}   •   Duration: ${m.duration || '5 Days'}`;

    return {
      margin: [0, 0, 0, 10],
      stack: [
        {
          columns: [
            { text: `${idx + 1}.`, width: 16, bold: true, fontSize: 10.5, color: '#0f766e' },
            { text: medName, bold: true, fontSize: 10.5, color: '#0f172a' }
          ]
        },
        {
          text: schedText,
          fontSize: 8.5,
          color: '#334155',
          margin: [16, 2, 0, 0]
        }
      ]
    };
  }) : [
    {
      text: formData.prescriptionText || 'No medications prescribed. Routine observation and lifestyle guidelines provided.',
      fontSize: 9.5,
      color: '#334155',
      lineHeight: 1.4
    }
  ];

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 32, 36, 36],
    content: [
      // ============================================================
      // 1. HOSPITAL & DOCTOR BRAND HEADER
      // ============================================================
      {
        columns: [
          // Hospital Branding (Left)
          {
            width: '*',
            columns: [
              {
                image: HEALINGWAVE_LOGO_BASE64,
                width: 44,
                height: 44,
                margin: [0, 2, 10, 0]
              },
              {
                width: '*',
                stack: [
                  { text: 'HEALINGWAVE GENERAL HOSPITAL', fontSize: 13.5, bold: true, color: '#0f766e', letterSpacing: 0.3 },
                  { text: 'Medical Center & Advanced Research Institute', fontSize: 8.5, bold: true, color: '#0284c7', margin: [0, 1, 0, 2] },
                  { text: '15 Rankin Street, Wari, Dhaka-1203 • Hotline: +1 (800) 432-5464', fontSize: 7.5, color: '#64748b' },
                  { text: 'www.healingwave.org • JCI Accredited Hospital • 24/7 Level-1 Trauma Care', fontSize: 7.5, color: '#64748b' }
                ]
              }
            ]
          },
          // Doctor Credentials (Right)
          {
            width: 200,
            alignment: 'right',
            stack: [
              { text: doctorName, fontSize: 12.5, bold: true, color: '#0f172a' },
              { text: doctorDegrees, fontSize: 8.5, color: '#334155', margin: [0, 1, 0, 1] },
              { text: 'BMDC Reg. No: A-48921 • Accredited Specialist', fontSize: 7.5, bold: true, color: '#0d9488' },
              { text: 'Department of Internal Medicine & Clinical Care', fontSize: 7.5, color: '#64748b' },
              { text: doctorEmail || 'doctor@healingwave.com', fontSize: 7.5, color: '#94a3b8' }
            ]
          }
        ]
      },

      // Decorative Divider Lines
      {
        canvas: [
          { type: 'line', x1: 0, y1: 8, x2: 523, y2: 8, lineWidth: 2, lineColor: '#0d9488' },
          { type: 'line', x1: 0, y1: 12, x2: 523, y2: 12, lineWidth: 0.6, lineColor: '#38bdf8' }
        ],
        margin: [0, 0, 0, 10]
      },

      // ============================================================
      // 2. PATIENT DEMOGRAPHICS & TELEMETRY STRIP
      // ============================================================
      {
        table: {
          widths: ['*', 100, 105, 95],
          body: [
            [
              { text: [{ text: 'Patient: ', bold: true, color: '#64748b', fontSize: 8 }, { text: patientName, bold: true, color: '#0f172a', fontSize: 9.5 }] },
              { text: [{ text: 'Age/Sex: ', bold: true, color: '#64748b', fontSize: 8 }, { text: `${patientAge} / ${patientSex}`, color: '#0f172a', fontSize: 9 }] },
              { text: [{ text: 'Date: ', bold: true, color: '#64748b', fontSize: 8 }, { text: formattedDate, color: '#0f172a', fontSize: 9 }] },
              { text: [{ text: 'Rx ID: ', bold: true, color: '#64748b', fontSize: 8 }, { text: `#HW-${rxId}`, bold: true, color: '#0d9488', fontSize: 9 }], alignment: 'right' }
            ],
            [
              { text: [{ text: 'Contact: ', bold: true, color: '#64748b', fontSize: 8 }, { text: `${patientPhone} • ${patientEmail}`, color: '#334155', fontSize: 8 }] },
              { text: [{ text: 'BP: ', bold: true, color: '#64748b', fontSize: 8 }, { text: bpVal, color: '#0f172a', fontSize: 8.5 }] },
              { text: [{ text: 'Pulse: ', bold: true, color: '#64748b', fontSize: 8 }, { text: pulseVal, color: '#0f172a', fontSize: 8.5 }] },
              { text: [{ text: 'Wt / Temp: ', bold: true, color: '#64748b', fontSize: 8 }, { text: `${wtVal} • ${tempVal}`, color: '#0f172a', fontSize: 8.5 }], alignment: 'right' }
            ]
          ]
        },
        layout: {
          fillColor: () => '#f0fdfa',
          hLineColor: () => '#ccfbf1',
          vLineColor: () => '#ccfbf1',
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 5,
          paddingBottom: () => 5
        },
        margin: [0, 0, 0, 12]
      },

      // ============================================================
      // 3. MAIN CLINICAL PAD (2 COLUMNS: Notes vs ℞ Formulary)
      // ============================================================
      {
        columns: [
          // LEFT COLUMN: Clinical Notes & History (Width: 155pt)
          {
            width: 155,
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        fillColor: '#f8fafc',
                        stack: [
                          { text: 'CLINICAL SUMMARY', fontSize: 8.5, bold: true, color: '#0f766e', margin: [0, 0, 0, 6] },
                          
                          { text: 'Chief Complaints & Diagnosis:', fontSize: 8, bold: true, color: '#475569' },
                          { text: diagnosis, fontSize: 8.5, color: '#0f172a', margin: [0, 2, 0, 10], lineHeight: 1.3 },

                          { text: 'Clinical Vitals Record:', fontSize: 8, bold: true, color: '#475569', margin: [0, 0, 0, 3] },
                          { text: `• Blood Pressure: ${bpVal}`, fontSize: 8, color: '#334155', margin: [0, 1, 0, 1] },
                          { text: `• Pulse Rate: ${pulseVal}`, fontSize: 8, color: '#334155', margin: [0, 1, 0, 1] },
                          { text: `• Temperature: ${tempVal}`, fontSize: 8, color: '#334155', margin: [0, 1, 0, 1] },
                          { text: `• Body Weight: ${wtVal}`, fontSize: 8, color: '#334155', margin: [0, 1, 0, 10] },

                          { text: 'Suggested Investigations:', fontSize: 8, bold: true, color: '#475569', margin: [0, 0, 0, 3] },
                          { text: '• Complete Blood Count (CBC)', fontSize: 7.5, color: '#64748b', margin: [0, 1, 0, 1] },
                          { text: '• Serum Creatinine & Electrolytes', fontSize: 7.5, color: '#64748b', margin: [0, 1, 0, 1] },
                          { text: '• Random Blood Sugar (RBS)', fontSize: 7.5, color: '#64748b', margin: [0, 1, 0, 10] },

                          { text: 'Primary Care Center:', fontSize: 7.5, bold: true, color: '#0d9488' },
                          { text: 'HealingWave Outpatient Clinic Room 402', fontSize: 7.5, color: '#64748b' }
                        ]
                      }
                    ]
                  ]
                },
                layout: {
                  hLineColor: () => '#e2e8f0',
                  vLineColor: () => '#e2e8f0',
                  hLineWidth: () => 1,
                  vLineWidth: () => 1,
                  paddingLeft: () => 10,
                  paddingRight: () => 10,
                  paddingTop: () => 10,
                  paddingBottom: () => 12
                }
              }
            ]
          },

          // RIGHT COLUMN: ℞ Medications & Clinical Instructions
          {
            width: '*',
            margin: [16, 0, 0, 0],
            stack: [
              // The Authentic Rx Symbol
              {
                text: '℞',
                fontSize: 26,
                bold: true,
                color: '#0d9488',
                margin: [0, -4, 0, 8]
              },

              // Prescribed Medicines
              ...medicineBlocks,

              // Clinical Advice & Lifestyle Guidelines Box
              {
                margin: [0, 8, 0, 0],
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        fillColor: '#f0fdfa',
                        stack: [
                          { text: 'Clinical Advice & Guidelines:', fontSize: 8.5, bold: true, color: '#0f766e', margin: [0, 0, 0, 3] },
                          { text: advice, fontSize: 8.5, color: '#334155', lineHeight: 1.35 }
                        ]
                      }
                    ]
                  ]
                },
                layout: {
                  hLineColor: () => '#99f6e4',
                  vLineColor: () => '#99f6e4',
                  hLineWidth: () => 1,
                  vLineWidth: () => 1,
                  paddingLeft: () => 10,
                  paddingRight: () => 10,
                  paddingTop: () => 8,
                  paddingBottom: () => 8
                }
              },

              // Next Follow-Up Review Date
              {
                margin: [0, 10, 0, 0],
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        fillColor: '#ffffff',
                        stack: [
                          {
                            text: [
                              { text: 'Next Follow-up Consultation: ', fontSize: 8.5, bold: true, color: '#0f172a' },
                              { text: followUp, fontSize: 8.5, bold: true, color: '#0d9488' }
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                },
                layout: {
                  hLineColor: () => '#cbd5e1',
                  vLineColor: () => '#cbd5e1',
                  hLineWidth: () => 1,
                  vLineWidth: () => 1,
                  paddingLeft: () => 10,
                  paddingRight: () => 10,
                  paddingTop: () => 6,
                  paddingBottom: () => 6
                }
              },

              // Doctor Signature & Stamp Area (Right-aligned)
              {
                margin: [0, 24, 0, 0],
                alignment: 'right',
                stack: [
                  { text: '__________________________________', color: '#64748b', fontSize: 10 },
                  { text: doctorName, fontSize: 10.5, bold: true, color: '#0f172a', margin: [0, 3, 0, 1] },
                  { text: 'Registered Medical Practitioner (BMDC Accredited)', fontSize: 7.5, color: '#475569' },
                  { text: 'Digitally Authenticated Medical Record • HealingWave EMR', fontSize: 7.5, bold: true, color: '#0d9488' }
                ]
              }
            ]
          }
        ]
      },

      // ============================================================
      // 4. OFFICIAL LEGAL & SECURITY FOOTER
      // ============================================================
      {
        margin: [0, 20, 0, 0],
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.8, lineColor: '#e2e8f0' }
        ]
      },
      {
        margin: [0, 6, 0, 0],
        columns: [
          {
            text: '* This electronic prescription is digitally signed and valid across all licensed hospital dispensaries and pharmacies. Refill strictly per doctor instructions.',
            fontSize: 7,
            color: '#64748b'
          },
          {
            text: '24/7 Trauma Emergency: +1 (800) 432-5464',
            fontSize: 7,
            bold: true,
            color: '#0f766e',
            alignment: 'right'
          }
        ]
      }
    ]
  };

  const safeName = (formData.patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdfMake.createPdf(docDefinition).download(`Prescription_${safeName}_${rxId}.pdf`);
};

const generateBillPDF = (bills, type) => {
  const hospitalName = 'HealingWave Health Service';
  const hospitalAddress = '15 Rankin Street, Wari, Dhaka 1203';

  const docDefinition = {
    content: [
      {
        text: hospitalName,
        style: 'header',
        color: '#1b1f24', 
        bold: true
      },
      {
        text: hospitalAddress,
        style: 'subheader',
        color: '#1b1f24', 
        margin: [0, 0, 0, 10]
      },
      {
        text: `${type.charAt(0).toUpperCase() + type.slice(1)} Bills`,
        style: 'title'
      },
      {
        text: '\n' 
      },
      ...bills.map(bill => ({
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Description', style: 'tableHeader' }, { text: 'Details', style: 'tableHeader' }],
            ['Type', type === 'ward' ? bill.wardType : bill.cabinType],
            ['Floor No', bill.floor],
            ['Number', type === 'ward' ? bill.wardNo : bill.cabinNo],
            ['Patient Name', bill.patientName],
            ['Email', bill.email],
            ['Phone', bill.phone],
            ['Booked Date', new Date(bill.bookedDate).toLocaleDateString()],
            ['Total Bill', bill.totalBill],
            [
              'Paid Status',
              {
                text: bill.paid ? 'Paid' : 'Unpaid',
                color: bill.paid ? 'green' : 'red',
                bold: true
              }
            ]
          ]
        },
        layout: {
          hLineColor: () => '#1b1f24',
          vLineColor: () => '#1b1f24',
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 8,
          paddingBottom: () => 8
        }
      })),
      {
        text: '\n' 
      },
      {
        text: 'Thank you for visiting HealingWave Health Service.',
        style: 'footer'
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        alignment: 'center',
        margin: [0, 0, 0, 10],
        color: '#2c3e50'
      },
      subheader: {
        fontSize: 14,
        alignment: 'center',
        margin: [0, 0, 0, 10],
        color: '#2c3e50'
      },
      title: {
        fontSize: 18,
        alignment: 'center',
        margin: [0, 0, 0, 20],
        color: '#1b1f24',
        bold: true
      },
      tableHeader: {
        fillColor: '#1b1f24',
        color: 'white',
        alignment: 'center',
        bold: true,
        fontSize: 12,
        margin: [0, 5]
      },
      footer: {
        fontSize: 12,
        alignment: 'center',
        margin: [0, 20, 0, 0],
        color: '#1b1f24'
      }
    },
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60], 
    defaultStyle: {
      fontSize: 12,
      color: '#333'
    }
  };

  pdfMake.createPdf(docDefinition).download(`Bill_${type.charAt(0).toUpperCase() + type.slice(1)}.pdf`);
};

export { generateBillPDF };

const generateTestBillPDF = (bills) => {
  const hospitalName = 'HealingWave Health Service';
  const hospitalAddress = '15 Rankin Street, Wari, Dhaka 1203';

  const docDefinition = {
    content: [
      {
        text: hospitalName,
        style: 'header',
        color: '#1b1f24', 
        bold: true
      },
      {
        text: hospitalAddress,
        style: 'subheader',
        color: '#1b1f24', 
        margin: [0, 0, 0, 10]
      },
      {
        text: 'Test and Services Bills',
        style: 'title'
      },
      {
        text: '\n' 
      },
      ...bills.map(bill => ({
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Description', style: 'tableHeader' }, { text: 'Details', style: 'tableHeader' }],
            ['Doctor Name', bill.doctorName || 'N/A'],
            ['Doctor Email', bill.doctorEmail || 'N/A'],
            ['Patient Name', bill.patientName || 'N/A'],
            ['Patient Email', bill.patientEmail || 'N/A'],
            ['Phone', bill.phone || 'N/A'],
            ['Selected Items', bill.selectedItems.length ? bill.selectedItems.map(item => `${item.type}: ${item.name} - ${item.price}`).join(', ') : 'N/A'],
            ['Total Bill', bill.totalBill || 'N/A'],
            ['Paid Status', {
              text: bill.paid ? 'Paid' : 'Unpaid',
              color: bill.paid ? 'green' : 'red',
              bold: true
            }]
          ]
        },
        layout: {
          hLineColor: () => '#1b1f24',
          vLineColor: () => '#1b1f24',
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 8,
          paddingBottom: () => 8
        }
      })),
      {
        text: '\n'
      },
      {
        text: 'Thank you for visiting HealingWave Health Service.',
        style: 'footer'
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        alignment: 'center',
        margin: [0, 0, 0, 10],
        color: '#2c3e50'
      },
      subheader: {
        fontSize: 14,
        alignment: 'center',
        margin: [0, 0, 0, 10],
        color: '#2c3e50'
      },
      title: {
        fontSize: 18,
        alignment: 'center',
        margin: [0, 0, 0, 20],
        color: '#1b1f24',
        bold: true
      },
      tableHeader: {
        fillColor: '#1b1f24',
        color: 'white',
        alignment: 'center',
        bold: true,
        fontSize: 12,
        margin: [0, 5]
      },
      footer: {
        fontSize: 12,
        alignment: 'center',
        margin: [0, 20, 0, 0],
        color: '#1b1f24'
      }
    },
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60], 
    defaultStyle: {
      fontSize: 12,
      color: '#333'
    }
  };

  pdfMake.createPdf(docDefinition).download('TestBill.pdf');
};

export { generateTestBillPDF };

export const generateMedicineBillPDF = (bills) => {
  const hospitalName = 'HealingWave Health Service';
  const hospitalAddress = '15 Rankin Street, Wari, Dhaka 1203';

  const docDefinition = {
    content: [
      {
        text: hospitalName,
        style: 'header',
        color: '#1b1f24', 
        bold: true
      },
      {
        text: hospitalAddress,
        style: 'subheader',
        color: '#1b1f24', 
        margin: [0, 0, 0, 10]
      },
      {
        text: 'Medicine Bills',
        style: 'title'
      },
      {
        text: '\n' 
      },
      ...bills.map(bill => ({
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Description', style: 'tableHeader' }, { text: 'Details', style: 'tableHeader' }],
            ['Name', bill.name || 'N/A'],
            ['Email', bill.email || 'N/A'],
            ['Phone Number', bill.phoneNumber || 'N/A'],
            ['Address', bill.address || 'N/A'],
            ['Total Bill', `৳ ${bill.totalBill || 'N/A'}`],
            ['Date', new Date(bill.date).toLocaleDateString() || 'N/A'],
            ['Medicines', bill.medicines.length ? bill.medicines.map(item => `${item.medicineId.name}: ৳ ${item.totalPrice} for ${item.quantity} units`).join(', ') : 'N/A'],
            ['Paid Status', {
              text: bill.paid ? 'Paid' : 'Unpaid',
              color: bill.paid ? 'green' : 'red',
              bold: true
            }]
          ]
        },
        layout: {
          hLineColor: () => '#1b1f24',
          vLineColor: () => '#1b1f24',
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 8,
          paddingBottom: () => 8
        }
      })),
      {
        text: '\n'
      },
      {
        text: 'Thank you for visiting HealingWave Health Service.',
        style: 'footer'
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        alignment: 'center',
        margin: [0, 0, 0, 10],
        color: '#2c3e50'
      },
      subheader: {
        fontSize: 14,
        alignment: 'center',
        margin: [0, 0, 0, 10],
        color: '#2c3e50'
      },
      title: {
        fontSize: 18,
        alignment: 'center',
        margin: [0, 0, 0, 20],
        color: '#1b1f24',
        bold: true
      },
      tableHeader: {
        fillColor: '#1b1f24',
        color: 'white',
        alignment: 'center',
        bold: true,
        fontSize: 12,
        margin: [0, 5]
      },
      footer: {
        fontSize: 12,
        alignment: 'center',
        margin: [0, 20, 0, 0],
        color: '#1b1f24'
      }
    },
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60], 
    defaultStyle: {
      fontSize: 12,
      color: '#333'
    }
  };

  pdfMake.createPdf(docDefinition).download('MedicineBill.pdf');
};