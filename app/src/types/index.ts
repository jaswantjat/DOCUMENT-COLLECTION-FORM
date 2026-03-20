// Types for Eltex Document Collection Form - Modern SaaS Theme

export interface ProjectData {
  projectCode: string;
  customerName: string;
  address: string;
  phone: string;
  region: string;
  productType: string;
  assessor: string;
}

export interface UploadedFile {
  file: File;
  preview: string;
  timestamp: number;
}

export interface DocumentStatus {
  dniFront: 'missing' | 'received' | 'pending';
  dniBack: 'missing' | 'received' | 'pending';
  bill: 'missing' | 'received' | 'pending';
  ibi: 'missing' | 'received' | 'pending';
  iban: 'missing' | 'received' | 'pending';
  auth: 'missing' | 'signed' | 'pending';
}

export interface OwnerData {
  name: string;
  phone: string;
  relation: string;
}

export interface CompanyData {
  name: string;
  nif: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface PersonalData {
  fullName: string;
  dni: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  comments?: string;
}

export type Location = 'catalonia' | 'madrid' | 'valencia';

export interface FormData {
  // Location
  location: Location;
  isCompany: boolean;
  companyData: CompanyData;

  // Personal data
  personalData: PersonalData;

  // Owner verification
  isOwner: boolean | null;
  ownerData: OwnerData;

  // Documents
  dniFront: UploadedFile | null;
  dniBack: UploadedFile | null;
  bill: UploadedFile | null;
  ibi: UploadedFile | null;

  // IBAN
  iban: string;

  // Signatures
  vatSignature: string | null;
  authSignature: string | null;

  // Metadata
  fechaFirma: string;
  lugarFirma: string;
}

export interface SubmissionData {
  projectCode: string;
  timestamp: number;
  ipAddress: string;
  source: 'customer' | 'assessor';
  formData: FormData;
  documentStatus: DocumentStatus;
}

export interface BackOfficeResponse {
  success: boolean;
  project?: ProjectData;
  documentStatus?: DocumentStatus;
  error?: string;
}

export type Section =
  | 'welcome'
  | 'location'
  | 'personal'
  | 'owner'
  | 'dni'
  | 'bill'
  | 'ibi'
  | 'iban'
  | 'vat'
  | 'auth'
  | 'review'
  | 'success';

export interface FormErrors {
  location?: string;
  'companyData.name'?: string;
  'companyData.nif'?: string;
  'companyData.address'?: string;
  'companyData.city'?: string;
  'companyData.postalCode'?: string;
  'personalData.fullName'?: string;
  'personalData.dni'?: string;
  'personalData.address'?: string;
  'personalData.postalCode'?: string;
  'personalData.city'?: string;
  'personalData.province'?: string;
  'personalData.phone'?: string;
  'personalData.email'?: string;
  isOwner?: string;
  'ownerData.name'?: string;
  'ownerData.phone'?: string;
  'ownerData.relation'?: string;
  dniFront?: string;
  dniBack?: string;
  bill?: string;
  ibi?: string;
  iban?: string;
  vatSignature?: string;
  authSignature?: string;
}

export interface StoredFormData {
  version: string;
  timestamp: number;
  currentSection?: string;
}
