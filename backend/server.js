const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running', timestamp: new Date().toISOString() });
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { projectCode, docType } = req.body;
    const ext = path.extname(file.originalname);
    cb(null, `${projectCode}_${docType}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan JPG, PNG y PDF.'));
    }
  }
});

// Mock database for projects and submissions
const mockDatabase = {
  projects: {
    'ELT20250001': {
      code: 'ELT20250001',
      customerName: 'María García',
      address: 'Calle Gran Via 45',
      phone: '+34 612 345 678',
      region: 'Madrid',
      productType: 'Solar',
      assessor: 'Carlos Ruiz',
      documents: {
        dniFront: null,
        dniBack: null,
        electricityBill: null,
        ibi: null,
        iban: null
      },
      ownerMatch: null,
      ownerDetails: null,
      submissions: []
    },
    'ELT20250002': {
      code: 'ELT20250002',
      customerName: 'Juan Pérez',
      address: 'Avenida de la Castellana 100',
      phone: '+34 623 456 789',
      region: 'Barcelona',
      productType: 'Solar',
      assessor: 'Ana López',
      documents: {
        dniFront: null,
        dniBack: null,
        electricityBill: null,
        ibi: null,
        iban: null
      },
      ownerMatch: null,
      ownerDetails: null,
      submissions: []
    }
  }
};

// API Routes

// Get project data
app.get('/api/project/:code', (req, res) => {
  const { code } = req.params;
  const project = mockDatabase.projects[code];

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Este enlace no es válido. Contacta con tu asesor de Eltex.'
    });
  }

  res.json({ success: true, project });
});

// Upload document
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const { projectCode, docType } = req.body;

    if (!projectCode || !docType) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha recibido ningún archivo.'
      });
    }

    const project = mockDatabase.projects[projectCode];
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado.'
      });
    }

    // Map docType to document field
    const docMap = {
      'dniFront': 'dniFront',
      'dniBack': 'dniBack',
      'electricityBill': 'electricityBill',
      'ibi': 'ibi'
    };

    const docField = docMap[docType];
    if (!docField) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento no válido.'
      });
    }

    // Archive old file if exists
    if (project.documents[docField]) {
      const oldPath = path.join(uploadDir, path.basename(project.documents[docField]));
      if (fs.existsSync(oldPath)) {
        const archivePath = oldPath.replace('.jpg', '_archived.jpg').replace('.png', '_archived.png').replace('.pdf', '_archived.pdf');
        fs.renameSync(oldPath, archivePath);
      }
    }

    // Update project with new file
    const fileUrl = `/uploads/${req.file.filename}`;
    project.documents[docField] = fileUrl;

    res.json({
      success: true,
      message: 'Archivo subido correctamente.',
      fileUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir el archivo. Por favor, inténtalo de nuevo.'
    });
  }
});

// Submit form data
app.post('/api/submit', (req, res) => {
  try {
    const { projectCode, source, ipAddress } = req.body;

    const project = mockDatabase.projects[projectCode];
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado.'
      });
    }

    // Record submission
    const submission = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      source: source || 'customer',
      ipAddress: ipAddress || req.ip,
      documents: { ...project.documents },
      ownerMatch: project.ownerMatch,
      ownerDetails: project.ownerDetails,
      iban: project.documents.iban
    };

    project.submissions.push(submission);

    // Calculate what's still needed
    const missingRequired = [];
    if (!project.documents.dniFront) missingRequired.push('DNI frontal');
    if (!project.documents.dniBack) missingRequired.push('DNI trasero');
    if (!project.documents.electricityBill) missingRequired.push('Factura de luz');
    if (!project.documents.iban) missingRequired.push('IBAN');

    res.json({
      success: true,
      message: 'Documentos recibidos correctamente.',
      submission,
      missingRequired,
      missingOptional: !project.documents.ibi ? ['IBI'] : []
    });

  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Hubo un problema al enviar tus documentos. Por favor, inténtalo de nuevo.'
    });
  }
});

// Update owner information
app.post('/api/owner', (req, res) => {
  try {
    const { projectCode, isOwner, ownerDetails } = req.body;

    const project = mockDatabase.projects[projectCode];
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado.'
      });
    }

    project.ownerMatch = isOwner;
    if (!isOwner && ownerDetails) {
      project.ownerDetails = ownerDetails;
    } else {
      project.ownerDetails = null;
    }

    res.json({
      success: true,
      message: 'Información del propietario actualizada.'
    });

  } catch (error) {
    console.error('Owner update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la información.'
    });
  }
});

// Update IBAN
app.post('/api/iban', (req, res) => {
  try {
    const { projectCode, iban } = req.body;

    const project = mockDatabase.projects[projectCode];
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado.'
      });
    }

    project.documents.iban = iban;

    res.json({
      success: true,
      message: 'IBAN actualizado correctamente.'
    });

  } catch (error) {
    console.error('IBAN update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el IBAN.'
    });
  }
});

// Send confirmation (mock)
app.post('/api/send-confirmation', (req, res) => {
  const { projectCode, phoneNumber, message } = req.body;

  console.log('=== MOCK: WhatsApp Confirmation ===');
  console.log('To:', phoneNumber);
  console.log('Message:', message);
  console.log('===================================');

  res.json({
    success: true,
    message: 'Confirmación enviada correctamente.'
  });
});

// Get project status (for debugging)
app.get('/api/status/:code', (req, res) => {
  const { code } = req.params;
  const project = mockDatabase.projects[code];

  if (!project) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true, project });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test project codes: ELT20250001, ELT20250002`);
});
