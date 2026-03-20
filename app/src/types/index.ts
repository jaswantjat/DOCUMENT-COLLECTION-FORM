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

export interface UploadedPhoto {
  id: string;
  file?: File;
  preview: string;
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

export interface DocSlot {
  photo: UploadedPhoto | null;
  extraction: AIExtraction | null;
}

export interface DNIData {
  front: DocSlot;
  back: DocSlot;
}

export interface IBIData {
  photo: UploadedPhoto | null;
  extraction: AIExtraction | null;
}

export interface ElectricityBillData {
  photo: UploadedPhoto | null;
  extraction: AIExtraction | null;
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

export interface SignatureData {
  customerSignature: string | null;
  repSignature: string | null;
}

export interface FormData {
  phone: string;
  dni: DNIData;
  ibi: IBIData;
  electricityBill: ElectricityBillData;
  electricalPanel: ElectricalPanelData;
  installationSpace: InstallationSpaceData;
  roof: RoofData;
  radiators: RadiatorData;
  signatures: SignatureData;
}

export interface FormItem {
  id: string;
  label: string;
  section: Section;
  required: boolean;
  isComplete: (formData: FormData, productType: ProductType) => boolean;
}

export type Section =
  | 'welcome'
  | 'phone'
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
