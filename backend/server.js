const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// OpenRouter API config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_MODEL = 'google/gemini-3.1-flash-lite-preview';

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '25mb' }));
app.use(express.static('uploads'));

// Uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se aceptan JPG, PNG y PDF.'));
  }
});

// ── Mock Database ──────────────────────────────────────────────────────────────
const mockDatabase = {
  projects: {
    'ELT20250001': {
      code: 'ELT20250001',
      customerName: 'María García López',
      phone: '+34612345678',
      email: 'maria.garcia@email.com',
      productType: 'solar',
      assessor: 'Carlos Ruiz',
      assessorId: 'ASR001',
      formData: null,
      submissions: [],
      lastActivity: null,
      createdAt: '2025-03-15T10:00:00Z'
    },
    'ELT20250002': {
      code: 'ELT20250002',
      customerName: 'Juan Pérez Martínez',
      phone: '+34623456789',
      email: 'juan.perez@email.com',
      productType: 'aerothermal',
      assessor: 'Ana López',
      assessorId: 'ASR002',
      formData: null,
      submissions: [],
      lastActivity: null,
      createdAt: '2025-03-18T14:30:00Z'
    },
    'ELT20250003': {
      code: 'ELT20250003',
      customerName: 'Laura Fernández Ruiz',
      phone: '+34655443322',
      email: 'laura.fernandez@email.com',
      productType: 'solar',
      assessor: 'Pedro Sánchez',
      assessorId: 'ASR003',
      formData: null,
      submissions: [],
      lastActivity: null,
      createdAt: '2025-03-20T09:15:00Z'
    }
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function normalizePhone(p) {
  return p.replace(/[\s\-().]/g, '').replace(/^0034/, '+34').replace(/^(?=\d{9}$)/, '+34').replace(/^34(?=\d{9}$)/, '+34');
}

// ── Routes ─────────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running', timestamp: new Date().toISOString() });
});

// Get project by code
app.get('/api/project/:code', (req, res) => {
  const project = mockDatabase.projects[req.params.code];
  if (!project) return res.status(404).json({ success: false, error: 'PROJECT_NOT_FOUND', message: 'Este enlace no es válido. Contacta con tu asesor de Eltex.' });
  res.json({ success: true, project });
});

// Look up project by phone number
app.get('/api/lookup/phone/:phone', (req, res) => {
  const needle = normalizePhone(decodeURIComponent(req.params.phone));
  const project = Object.values(mockDatabase.projects).find(p => normalizePhone(p.phone) === needle);
  if (!project) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'No encontramos ningún proyecto con ese teléfono. Contacta con tu asesor.' });
  res.json({ success: true, project });
});

// Auto-save progress
app.post('/api/project/:code/save', (req, res) => {
  const project = mockDatabase.projects[req.params.code];
  if (!project) return res.status(404).json({ success: false, error: 'PROJECT_NOT_FOUND' });
  project.formData = req.body.formData;
  project.lastActivity = new Date().toISOString();
  res.json({ success: true, message: 'Progreso guardado.' });
});

// Final submit
app.post('/api/project/:code/submit', (req, res) => {
  const project = mockDatabase.projects[req.params.code];
  if (!project) return res.status(404).json({ success: false, error: 'PROJECT_NOT_FOUND' });
  const submission = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    source: req.body.source || 'customer',
    ipAddress: req.ip,
    formData: req.body.formData
  };
  project.submissions.push(submission);
  project.formData = req.body.formData;
  project.lastActivity = new Date().toISOString();
  res.json({ success: true, message: 'Documentación enviada correctamente.', submissionId: submission.id });
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió archivo.' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
});

// ── Dashboard endpoint ─────────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  const projects = Object.values(mockDatabase.projects).map(p => ({
    code: p.code,
    customerName: p.customerName,
    phone: p.phone,
    email: p.email,
    productType: p.productType,
    assessor: p.assessor,
    createdAt: p.createdAt,
    lastActivity: p.lastActivity,
    submissionCount: p.submissions.length,
    latestSubmission: p.submissions.length > 0 ? p.submissions[p.submissions.length - 1] : null,
    formData: p.formData,
  }));
  res.json({ success: true, projects });
});

// ── AI Document Extraction ─────────────────────────────────────────────────────
const PROMPTS = {
  ibi: `You are analyzing a Spanish IBI (Impuesto sobre Bienes Inmuebles) receipt or Escritura document.
Extract:
1. Referencia Catastral (cadastral reference) — 20-char alphanumeric code
2. Titular (property owner name)
3. Dirección del inmueble (full property address)
Respond ONLY in this exact JSON (no markdown):
{"isCorrectDocument":true,"documentTypeDetected":"IBI receipt","isReadable":true,"extractedData":{"referenciaCatastral":"string or null","titular":"string or null","direccion":"string or null"},"confidence":0.85,"notes":"string"}`,

  electricity: `You are analyzing a Spanish electricity bill (factura de electricidad).
Extract:
1. CUPS number (starts with "ES", 20-22 chars)
2. Potencia contratada (contracted power in kW, as a number)
3. Tipo de fase: "monofasica" or "trifasica"
4. Supply address (dirección del suministro)
Respond ONLY in this exact JSON (no markdown):
{"isCorrectDocument":true,"documentTypeDetected":"electricity bill","isReadable":true,"extractedData":{"cups":"string or null","potenciaContratada":null,"tipoFase":"monofasica or trifasica or null","direccionSuministro":"string or null"},"confidence":0.85,"notes":"string"}`,

  dniFront: `You are analyzing the FRONT of a Spanish DNI (Documento Nacional de Identidad) or NIE card.
Extract:
1. Full name — apellidos followed by nombre as shown on card
2. DNI/NIE number (the alphanumeric ID number, e.g. 12345678A or X1234567A)
3. Date of birth (fecha de nacimiento) — format YYYY-MM-DD
4. Date of expiry (válido hasta) — format YYYY-MM-DD
5. Sex (M or F)
Respond ONLY in this exact JSON (no markdown):
{"isCorrectDocument":true,"documentTypeDetected":"DNI front","isReadable":true,"extractedData":{"fullName":"string or null","dniNumber":"string or null","dateOfBirth":"string or null","expiryDate":"string or null","sex":"M or F or null"},"confidence":0.85,"notes":"string"}`,

  dniBack: `You are analyzing the BACK of a Spanish DNI (Documento Nacional de Identidad) card.
Extract:
1. Full address (domicilio) — street, number, floor, door
2. Municipality (municipio/localidad)
3. Province (provincia)
4. Place of birth (lugar de nacimiento)
Respond ONLY in this exact JSON (no markdown):
{"isCorrectDocument":true,"documentTypeDetected":"DNI back","isReadable":true,"extractedData":{"address":"string or null","municipality":"string or null","province":"string or null","placeOfBirth":"string or null"},"confidence":0.85,"notes":"string"}`
};

app.post('/api/extract', async (req, res) => {
  const { imageBase64, documentType } = req.body;
  if (!imageBase64 || !documentType) return res.status(400).json({ success: false, message: 'Faltan imageBase64 o documentType.' });

  const prompt = PROMPTS[documentType];
  if (!prompt) return res.status(400).json({ success: false, message: `Tipo de documento no soportado: ${documentType}` });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }],
        max_tokens: 800,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      return res.json({ success: true, extraction: null, needsManualReview: true, message: 'No se pudo analizar automáticamente.' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log(`[extract:${documentType}] AI response:`, content.slice(0, 300));

    let extraction;
    try {
      const m = content.match(/\{[\s\S]*\}/);
      extraction = m ? JSON.parse(m[0]) : null;
    } catch (e) {
      console.error('JSON parse error:', e.message);
      extraction = null;
    }

    if (!extraction) return res.json({ success: true, extraction: null, needsManualReview: true, message: 'No se pudieron extraer los datos.' });

    if (!extraction.isCorrectDocument) {
      return res.json({
        success: true, extraction, isWrongDocument: true,
        message: `Esto parece ser ${extraction.documentTypeDetected || 'otro documento'}. Por favor sube el documento correcto.`
      });
    }

    // CUPS validation
    if (documentType === 'electricity' && extraction.extractedData?.cups) {
      const cups = extraction.extractedData.cups;
      if (!cups.startsWith('ES') || cups.length < 20 || cups.length > 22)
        extraction.extractedData.cupsWarning = 'El CUPS no tiene el formato esperado.';
    }

    res.json({
      success: true, extraction,
      needsManualReview: extraction.confidence < 0.6,
      message: extraction.confidence >= 0.6 ? 'Datos extraídos correctamente.' : 'Confianza baja — verifica manualmente.'
    });

  } catch (err) {
    console.error('AI extraction error:', err);
    res.json({ success: true, extraction: null, needsManualReview: true, message: 'Error en el análisis. Se revisará manualmente.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Test codes: ELT20250001 (solar) | ELT20250002 (aerothermal) | ELT20250003 (solar)');
  console.log('Test phones: +34612345678 | +34623456789 | +34655443322');
});
