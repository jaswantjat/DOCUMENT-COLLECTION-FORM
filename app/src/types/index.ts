// Eltex Document Collection Form - Types

export type ProductType = 'solar' | 'aerothermal';

export interface ProjectData {
  code: string;
  customerName: string;
  phone: string;
  email: string;
  productType: ProductType;
  assessor: string;
  assessorId: string;
  formData: FormData | null;
  lastActivity: string | null;
  createdAt: string;
}

// Section 1: Customer Identity
export interface CustomerIdentity {
  fullName: string;
  dni: string; // DNI/NIE
  phone: string;
  email: string;
  street: string;
  number: string;
  floor: string;
  door: string;
  postalCode: string;
  municipality: string;
  province: string;
}

// Section 2: Property Documentation
export interface UploadedPhoto {
  id: string;
  file?: File;
  preview: string; // data URL or server URL
  timestamp: number;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export interface AIExtraction {
  extractedData: Record<string, any>;
  confidence: number;
  isCorrectDocument: boolean;
  documentTypeDetected: string;
  needsManualReview: boolean;
  confirmedByUser: boolean;
  manualCorrections?: Record<string, string>;
}

export interface IBIData {
  photo: UploadedPhoto | null;
  extraction: AIExtraction | null;
}

export interface ElectricityBillData {
  photo: UploadedPhoto | null;
  extraction: AIExtraction | null;
}

// Section 3: Property Photos
export interface PhotoSlot {
  photos: UploadedPhoto[];
  minRequired: number;
}

export interface ElectricalPanelData {
  photos: UploadedPhoto[];
}

export interface InstallationSpaceData {
  photos: UploadedPhoto[];
  widthCm: string;
  depthCm: string;
  heightCm: string;
}

export interface RoofData {
  photos: UploadedPhoto[];
  lengthM: string;
  widthM: string;
  roofType: '' | 'flat' | 'tiled' | 'metal' | 'other';
  orientation: '' | 'north' | 'south' | 'east' | 'west' | 'mixed';
}

export interface RadiatorData {
  photos: UploadedPhoto[];
  radiatorType: '' | 'iron' | 'aluminium' | 'underfloor' | 'mixed';
  totalCount: string;
  heatingZones: string;
}

// Section 4: Signatures
export interface SignatureData {
  customerSignature: string | null; // base64 PNG
  repSignature: string | null; // base64 PNG
}

// Full form data
export interface FormData {
  identity: CustomerIdentity;
  ibi: IBIData;
  electricityBill: ElectricityBillData;
  electricalPanel: ElectricalPanelData;
  installationSpace: InstallationSpaceData;
  roof: RoofData;
  radiators: RadiatorData;
  signatures: SignatureData;
}

// Form completion tracking
export interface FormItem {
  id: string;
  label: string;
  section: Section;
  required: boolean;
  isComplete: (formData: FormData, productType: ProductType) => boolean;
}

export type Section =
  | 'welcome'
  | 'identity'
  | 'property-docs'
  | 'property-photos'
  | 'signatures'
  | 'review'
  | 'success';

export interface FormErrors {
  [key: string]: string | undefined;
}

export type PhotoValidationResult = {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
};
