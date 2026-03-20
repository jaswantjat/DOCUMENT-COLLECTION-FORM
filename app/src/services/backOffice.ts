// Mock Back Office API Service
import type { ProjectData, BackOfficeResponse, SubmissionData, DocumentStatus } from '@/types';

// Mock database of projects
const mockProjects: Record<string, ProjectData> = {
  'ELX2024001': {
    projectCode: 'ELX2024001',
    customerName: 'María García López',
    address: 'Calle Gran Vía 45, 28013 Madrid',
    phone: '+34612345678',
    region: 'Madrid',
    productType: 'Solar Fotovoltaica',
    assessor: 'Carlos Ruiz'
  },
  'ELX2024002': {
    projectCode: 'ELX2024002',
    customerName: 'Juan Martínez Sánchez',
    address: 'Avenida Diagonal 234, 08018 Barcelona',
    phone: '+34698765432',
    region: 'Cataluña',
    productType: 'Solar Fotovoltaica',
    assessor: 'Ana López'
  },
  'ELX2024003': {
    projectCode: 'ELX2024003',
    customerName: 'Laura Fernández Ruiz',
    address: 'Calle Sierpes 12, 41004 Sevilla',
    phone: '+34655443322',
    region: 'Andalucía',
    productType: 'Solar Térmica',
    assessor: 'Pedro Sánchez'
  }
};

// Mock document status storage
const documentStatuses: Record<string, DocumentStatus> = {};

// Initialize status for a project
const initializeStatus = (projectCode: string): DocumentStatus => {
  if (!documentStatuses[projectCode]) {
    documentStatuses[projectCode] = {
      dniFront: 'missing',
      dniBack: 'missing',
      bill: 'missing',
      ibi: 'pending',
      iban: 'missing',
      auth: 'pending'
    };
  }
  return documentStatuses[projectCode];
};

// Get project data by code
export const getProjectData = async (projectCode: string): Promise<BackOfficeResponse> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const project = mockProjects[projectCode];
  
  if (!project) {
    return {
      success: false,
      error: 'PROJECT_NOT_FOUND'
    };
  }
  
  const status = initializeStatus(projectCode);
  
  return {
    success: true,
    project,
    documentStatus: status
  };
};

// Submit form data to Back Office
export const submitFormData = async (
  submissionData: SubmissionData
): Promise<{ success: boolean; error?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate occasional failures (3% chance)
  if (Math.random() < 0.03) {
    return {
      success: false,
      error: 'API_TIMEOUT'
    };
  }
  
  const { projectCode, formData } = submissionData;
  
  // Update document status
  const updates: Partial<DocumentStatus> = {};
  
  if (formData.dniFront) updates.dniFront = 'received';
  if (formData.dniBack) updates.dniBack = 'received';
  if (formData.bill) updates.bill = 'received';
  if (formData.ibi) updates.ibi = 'received';
  if (formData.iban && validateIBAN(formData.iban)) updates.iban = 'received';
  if (formData.authSignature) updates.auth = 'signed';
  
  documentStatuses[projectCode] = {
    ...documentStatuses[projectCode],
    ...updates
  };
  
  console.log('Submission received:', {
    ...submissionData,
    timestamp: new Date(submissionData.timestamp).toISOString()
  });
  
  return { success: true };
};

// Validate Spanish IBAN
export const validateIBAN = (iban: string): boolean => {
  const cleanIBAN = iban.replace(/\s/g, '');
  const ibanRegex = /^ES\d{22}$/;
  return ibanRegex.test(cleanIBAN);
};

// Format IBAN with spaces
export const formatIBAN = (iban: string): string => {
  const clean = iban.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (!clean.startsWith('ES')) return clean;
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
};

// Get client IP
export const getClientIP = async (): Promise<string> => {
  return '192.168.1.XXX';
};

// Get current date in Spanish format
export const getCurrentDate = (): { dia: string; mes: string; ano: string } => {
  const now = new Date();
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return {
    dia: now.getDate().toString(),
    mes: meses[now.getMonth()],
    ano: now.getFullYear().toString()
  };
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Store file (mock)
export const storeFile = async (
  projectCode: string,
  documentType: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: 'FILE_TOO_LARGE'
    };
  }
  
  const fileName = `${projectCode}_${documentType}.${file.name.split('.').pop()}`;
  const mockUrl = `https://storage.eltex.es/documents/${fileName}`;
  
  return {
    success: true,
    url: mockUrl
  };
};

// Trigger owner notification
export const triggerOwnerNotification = async (
  projectCode: string,
  ownerName: string,
  ownerPhone: string
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Owner notification triggered:', { projectCode, ownerName, ownerPhone });
  return true;
};
