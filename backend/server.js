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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running', timestamp: new Date().toISOString() });
});

// Uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${uuidv4().slice(0,8)}${ext}`);
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

// Mock database
const mockDatabase = {
  projects: {
    'ELT20250001': {
      code: 'ELT20250001',
      customerName: 'María García López',
      phone: '+34 612 345 678',
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
      phone: '+34 623 456 789',
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
      phone: '+34 655 443 322',
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

// ======== API ROUTES ========

// Get project
app.get('/api/project/:code', (req, res) => {
  const project = mockDatabase.projects[req.params.code];
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'PROJECT_NOT_FOUND',
      message: 'Este enlace no es válido. Contacta con tu asesor de Eltex.'
    });
  }
  res.json({ success: true, project });
});

// Save partial form data (auto-save)
app.post('/api/project/:code/save', (req, res) => {
  const project = mockDatabase.projects[req.params.code];
  if (!project) {
    return res.status(404).json({ success: false, error: 'PROJECT_NOT_FOUND' });
  }

  project.formData = req.body.formData;
  project.lastActivity = new Date().toISOString();

  res.json({ success: true, message: 'Progreso guardado.' });
});

// Final submit
app.post('/api/project/:code/submit', (req, res) => {
  const project = mockDatabase.projects[req.params.code];
  if (!project) {
    return res.status(404).json({ success: false, error: 'PROJECT_NOT_FOUND' });
  }

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

  res.json({
    success: true,
    message: 'Documentación enviada correctamente.',
    submissionId: submission.id
  });
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se recibió archivo.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// AI Document Extraction endpoint
app.post('/api/extract', async (req, res) => {
  const { imageBase64, documentType } = req.body;

  if (!imageBase64 || !documentType) {
    return res.status(400).json({ success: false, message: 'Faltan imageBase64 o documentType.' });
  }

  const prompts = {
    ibi: `You are analyzing a Spanish IBI (Impuesto sobre Bienes Inmuebles) receipt or Escritura document.
Extract the following data from this document image:
1. Referencia Catastral (cadastral reference) - a long alphanumeric code, usually 20 characters
2. Titular (property owner name)
3. Dirección del inmueble (property address)

Also determine:
- Is this actually an IBI receipt or Escritura? If it appears to be a different document type, say so.
- Is the image clear enough to read?

Respond ONLY in this exact JSON format, no markdown:
{"isCorrectDocument": true, "documentTypeDetected": "IBI receipt", "isReadable": true, "extractedData": {"referenciaCatastral": "string or null", "titular": "string or null", "direccion": "string or null"}, "confidence": 0.0-1.0, "notes": "string"}`,

    electricity: `You are analyzing a Spanish electricity bill (factura de electricidad).
Extract the following data from this document image:
1. CUPS number (starts with "ES", 20-22 characters)
2. Potencia contratada (contracted power in kW)
3. Tipo de instalación: Monofásica or Trifásica (phase type)

Also determine:
- Is this actually an electricity bill? If it looks like a gas bill or other utility bill, say so.
- Is the image clear enough to read?

Respond ONLY in this exact JSON format, no markdown:
{"isCorrectDocument": true, "documentTypeDetected": "electricity bill", "isReadable": true, "extractedData": {"cups": "string or null", "potenciaContratada": null, "tipoFase": "monofasica or trifasica or null"}, "confidence": 0.0-1.0, "notes": "string"}`
  };

  const prompt = prompts[documentType];
  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Tipo de documento no soportado.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return res.json({
        success: true,
        extraction: null,
        needsManualReview: true,
        message: 'No se pudo analizar el documento automáticamente. Se marcará para revisión manual.'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let extraction;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      extraction = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      extraction = null;
    }

    if (!extraction) {
      return res.json({
        success: true,
        extraction: null,
        needsManualReview: true,
        message: 'No se pudo extraer los datos. Se marcará para revisión manual.'
      });
    }

    if (!extraction.isCorrectDocument) {
      return res.json({
        success: true,
        extraction,
        isWrongDocument: true,
        message: documentType === 'electricity'
          ? `Esto parece ser un/a ${extraction.documentTypeDetected || 'otro documento'}. Por favor, sube tu factura de electricidad.`
          : `Esto parece ser un/a ${extraction.documentTypeDetected || 'otro documento'}. Por favor, sube tu recibo de IBI o escritura.`
      });
    }

    if (documentType === 'electricity' && extraction.extractedData?.cups) {
      const cups = extraction.extractedData.cups;
      if (!cups.startsWith('ES') || cups.length < 20 || cups.length > 22) {
        extraction.extractedData.cupsWarning = 'El CUPS no tiene el formato esperado (ES + 20-22 caracteres).';
      }
      const power = extraction.extractedData?.potenciaContratada;
      if (power && (power < 1 || power > 50)) {
        extraction.extractedData.powerWarning = 'La potencia contratada parece inusual.';
      }
    }

    res.json({
      success: true,
      extraction,
      needsManualReview: extraction.confidence < 0.6,
      message: extraction.confidence >= 0.6
        ? 'Datos extraídos correctamente.'
        : 'Los datos extraídos tienen baja confianza. Por favor, verifica manualmente.'
    });

  } catch (err) {
    console.error('AI extraction error:', err);
    res.json({
      success: true,
      extraction: null,
      needsManualReview: true,
      message: 'Error en el análisis. Se marcará para revisión manual.'
    });
  }
});

// Get project status
app.get('/api/status/:code', (req, res) => {
  const project = mockDatabase.projects[req.params.code];
  if (!project) return res.status(404).json({ success: false });
  res.json({ success: true, project });
});

// Send confirmation (mock)
app.post('/api/send-confirmation', (req, res) => {
  console.log('=== MOCK: Confirmation sent ===', req.body);
  res.json({ success: true, message: 'Confirmación enviada.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Project codes: ELT20250001 (solar), ELT20250002 (aerothermal), ELT20250003 (solar)`);
});
