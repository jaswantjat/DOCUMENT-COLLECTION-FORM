import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  FormData, FormErrors, CustomerIdentity, UploadedPhoto,
  AIExtraction, ProductType, Section, FormItem
} from '@/types';
import { saveProgress } from '@/services/api';

const initialIdentity: CustomerIdentity = {
  fullName: '',
  dni: '',
  phone: '',
  email: '',
  street: '',
  number: '',
  floor: '',
  door: '',
  postalCode: '',
  municipality: '',
  province: '',
};

export const initialFormData: FormData = {
  identity: { ...initialIdentity },
  ibi: { photo: null, extraction: null },
  electricityBill: { photo: null, extraction: null },
  electricalPanel: { photos: [] },
  installationSpace: { photos: [], widthCm: '', depthCm: '', heightCm: '' },
  roof: { photos: [], lengthM: '', widthM: '', roofType: '', orientation: '' },
  radiators: { photos: [], radiatorType: '', totalCount: '', heatingZones: '' },
  signatures: { customerSignature: null, repSignature: null },
};

// Define all form items for progress tracking
export function getFormItems(productType: ProductType): FormItem[] {
  const items: FormItem[] = [
    {
      id: 'identity',
      label: 'Datos personales',
      section: 'identity',
      required: true,
      isComplete: (fd) => {
        const i = fd.identity;
        return !!(i.fullName && i.dni && i.phone && i.email && i.street && i.number && i.postalCode && i.municipality && i.province);
      },
    },
    {
      id: 'ibi',
      label: 'IBI / Escritura',
      section: 'property-docs',
      required: true,
      isComplete: (fd) => !!(fd.ibi.photo && fd.ibi.extraction?.confirmedByUser),
    },
    {
      id: 'electricity',
      label: 'Factura de luz',
      section: 'property-docs',
      required: true,
      isComplete: (fd) => !!(fd.electricityBill.photo && fd.electricityBill.extraction?.confirmedByUser),
    },
    {
      id: 'electricalPanel',
      label: 'Cuadro eléctrico',
      section: 'property-photos',
      required: true,
      isComplete: (fd) => fd.electricalPanel.photos.length >= 2,
    },
  ];

  if (productType === 'aerothermal') {
    items.push(
      {
        id: 'installationSpace',
        label: 'Espacio de instalación',
        section: 'property-photos',
        required: true,
        isComplete: (fd) => fd.installationSpace.photos.length >= 2 && !!(fd.installationSpace.widthCm && fd.installationSpace.depthCm && fd.installationSpace.heightCm),
      },
      {
        id: 'radiators',
        label: 'Radiadores',
        section: 'property-photos',
        required: true,
        isComplete: (fd) => fd.radiators.photos.length >= 1 && !!(fd.radiators.radiatorType && fd.radiators.totalCount && fd.radiators.heatingZones),
      },
    );
  }

  if (productType === 'solar') {
    items.push({
      id: 'roof',
      label: 'Tejado',
      section: 'property-photos',
      required: true,
      isComplete: (fd) => fd.roof.photos.length >= 2 && !!(fd.roof.roofType && fd.roof.orientation && fd.roof.lengthM && fd.roof.widthM),
    });
  }

  items.push({
    id: 'signatures',
    label: 'Firmas',
    section: 'signatures',
    required: true,
    isComplete: (fd) => !!(fd.signatures.customerSignature && fd.signatures.repSignature),
  });

  return items;
}

export const useFormState = (projectCode: string | null, productType: ProductType) => {
  const [formData, setFormData] = useState<FormData>({ ...initialFormData });
  const [errors, setErrors] = useState<FormErrors>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-save with debounce
  useEffect(() => {
    if (!projectCode) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      // Strip File objects before saving (not serializable)
      const cleanData = JSON.parse(JSON.stringify(formData, (key, value) => {
        if (value instanceof File) return undefined;
        return value;
      }));
      saveProgress(projectCode, cleanData).catch(() => {});
    }, 2000);

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [formData, projectCode]);

  const updateIdentity = useCallback((field: keyof CustomerIdentity, value: string) => {
    setFormData(prev => ({
      ...prev,
      identity: { ...prev.identity, [field]: value },
    }));
    setErrors(prev => ({ ...prev, [`identity.${field}`]: undefined }));
  }, []);

  const setIBIPhoto = useCallback((photo: UploadedPhoto | null) => {
    setFormData(prev => ({
      ...prev,
      ibi: { ...prev.ibi, photo, extraction: photo ? prev.ibi.extraction : null },
    }));
  }, []);

  const setIBIExtraction = useCallback((extraction: AIExtraction | null) => {
    setFormData(prev => ({
      ...prev,
      ibi: { ...prev.ibi, extraction },
    }));
  }, []);

  const setElectricityPhoto = useCallback((photo: UploadedPhoto | null) => {
    setFormData(prev => ({
      ...prev,
      electricityBill: { ...prev.electricityBill, photo, extraction: photo ? prev.electricityBill.extraction : null },
    }));
  }, []);

  const setElectricityExtraction = useCallback((extraction: AIExtraction | null) => {
    setFormData(prev => ({
      ...prev,
      electricityBill: { ...prev.electricityBill, extraction },
    }));
  }, []);

  const setElectricalPanelPhotos = useCallback((photos: UploadedPhoto[]) => {
    setFormData(prev => ({
      ...prev,
      electricalPanel: { photos },
    }));
  }, []);

  const updateInstallationSpace = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      installationSpace: { ...prev.installationSpace, [field]: value },
    }));
  }, []);

  const updateRoof = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roof: { ...prev.roof, [field]: value },
    }));
  }, []);

  const updateRadiators = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      radiators: { ...prev.radiators, [field]: value },
    }));
  }, []);

  const setCustomerSignature = useCallback((sig: string | null) => {
    setFormData(prev => ({
      ...prev,
      signatures: { ...prev.signatures, customerSignature: sig },
    }));
  }, []);

  const setRepSignature = useCallback((sig: string | null) => {
    setFormData(prev => ({
      ...prev,
      signatures: { ...prev.signatures, repSignature: sig },
    }));
  }, []);

  // Validators
  const validateIdentity = useCallback((): boolean => {
    const e: FormErrors = {};
    const i = formData.identity;

    if (!i.fullName.trim()) e['identity.fullName'] = 'Nombre completo obligatorio';
    if (!i.dni.trim()) {
      e['identity.dni'] = 'DNI/NIE obligatorio';
    } else {
      const dniRe = /^[0-9]{8}[A-Z]$/i;
      const nieRe = /^[XYZ][0-9]{7}[A-Z]$/i;
      if (!dniRe.test(i.dni.trim()) && !nieRe.test(i.dni.trim())) {
        e['identity.dni'] = 'Formato DNI (12345678A) o NIE (X1234567A)';
      }
    }
    if (!i.phone.trim()) {
      e['identity.phone'] = 'Teléfono obligatorio';
    } else if (!/^(\+34)?[6-9][0-9]{8}$/.test(i.phone.replace(/\s/g, ''))) {
      e['identity.phone'] = 'Formato de teléfono español no válido';
    }
    if (!i.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email)) {
      e['identity.email'] = 'Email válido obligatorio';
    }
    if (!i.street.trim()) e['identity.street'] = 'Calle obligatoria';
    if (!i.number.trim()) e['identity.number'] = 'Número obligatorio';
    if (!i.postalCode.trim()) {
      e['identity.postalCode'] = 'Código postal obligatorio';
    } else if (!/^[0-9]{5}$/.test(i.postalCode.trim())) {
      e['identity.postalCode'] = 'Código postal: 5 dígitos';
    }
    if (!i.municipality.trim()) e['identity.municipality'] = 'Municipio obligatorio';
    if (!i.province.trim()) e['identity.province'] = 'Provincia obligatoria';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData.identity]);

  const validatePropertyDocs = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!formData.ibi.photo) e['ibi.photo'] = 'Sube la foto del IBI o escritura';
    if (!formData.electricityBill.photo) e['electricity.photo'] = 'Sube la factura de electricidad';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData.ibi, formData.electricityBill]);

  const validateSignatures = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!formData.signatures.customerSignature) e['signatures.customer'] = 'Firma del cliente obligatoria';
    if (!formData.signatures.repSignature) e['signatures.rep'] = 'Firma del comercial obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData.signatures]);

  const getProgress = useCallback((): { completed: number; total: number; percent: number } => {
    const items = getFormItems(productType);
    const completed = items.filter(item => item.isComplete(formData, productType)).length;
    return {
      completed,
      total: items.length,
      percent: Math.round((completed / items.length) * 100),
    };
  }, [formData, productType]);

  const canSubmit = useCallback((): boolean => {
    const items = getFormItems(productType);
    return items.filter(i => i.required).every(i => i.isComplete(formData, productType));
  }, [formData, productType]);

  const clearError = useCallback((key: string) => {
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);

  const restoreFormData = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  return {
    formData,
    errors,
    updateIdentity,
    setIBIPhoto,
    setIBIExtraction,
    setElectricityPhoto,
    setElectricityExtraction,
    setElectricalPanelPhotos,
    updateInstallationSpace,
    updateRoof,
    updateRadiators,
    setCustomerSignature,
    setRepSignature,
    validateIdentity,
    validatePropertyDocs,
    validateSignatures,
    getProgress,
    canSubmit,
    clearError,
    setErrors,
    restoreFormData,
  };
};
