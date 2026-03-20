import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  FormData, FormErrors, UploadedPhoto,
  AIExtraction, ProductType, FormItem, DocSlot
} from '@/types';
import { saveProgress } from '@/services/api';

const emptyDocSlot = (): DocSlot => ({ photo: null, extraction: null });

export const initialFormData: FormData = {
  phone: '',
  dni: { front: emptyDocSlot(), back: emptyDocSlot() },
  ibi: { photo: null, extraction: null },
  electricityBill: { photo: null, extraction: null },
  electricalPanel: { photos: [] },
  installationSpace: { photos: [], widthCm: '', depthCm: '', heightCm: '' },
  roof: { photos: [], lengthM: '', widthM: '', roofType: '', orientation: '' },
  radiators: { photos: [], radiatorType: '', totalCount: '', heatingZones: '' },
  signatures: { customerSignature: null, repSignature: null },
};

export function getFormItems(productType: ProductType): FormItem[] {
  const items: FormItem[] = [
    {
      id: 'phone',
      label: 'Teléfono de contacto',
      section: 'phone',
      required: true,
      isComplete: (fd) => fd.phone.trim().length >= 9,
    },
    {
      id: 'dniFront',
      label: 'DNI — Cara frontal',
      section: 'property-docs',
      required: false,
      isComplete: (fd) => !!fd.dni.front.photo,
    },
    {
      id: 'dniBack',
      label: 'DNI — Cara trasera',
      section: 'property-docs',
      required: false,
      isComplete: (fd) => !!fd.dni.back.photo,
    },
    {
      id: 'ibi',
      label: 'IBI / Escritura',
      section: 'property-docs',
      required: false,
      isComplete: (fd) => !!fd.ibi.photo,
    },
    {
      id: 'electricity',
      label: 'Factura de luz',
      section: 'property-docs',
      required: false,
      isComplete: (fd) => !!fd.electricityBill.photo,
    },
    {
      id: 'electricalPanel',
      label: 'Cuadro eléctrico',
      section: 'property-photos',
      required: false,
      isComplete: (fd) => fd.electricalPanel.photos.length >= 1,
    },
  ];

  if (productType === 'aerothermal') {
    items.push(
      {
        id: 'installationSpace',
        label: 'Espacio de instalación',
        section: 'property-photos',
        required: false,
        isComplete: (fd) => fd.installationSpace.photos.length >= 1,
      },
      {
        id: 'radiators',
        label: 'Radiadores',
        section: 'property-photos',
        required: false,
        isComplete: (fd) => fd.radiators.photos.length >= 1,
      },
    );
  }

  if (productType === 'solar') {
    items.push({
      id: 'roof',
      label: 'Tejado',
      section: 'property-photos',
      required: false,
      isComplete: (fd) => fd.roof.photos.length >= 1,
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
      const cleanData = JSON.parse(JSON.stringify(formData, (key, value) => {
        if (value instanceof File) return undefined;
        return value;
      }));
      saveProgress(projectCode, cleanData).catch(() => {});
    }, 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [formData, projectCode]);

  const setPhone = useCallback((phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
    setErrors(prev => ({ ...prev, phone: undefined }));
  }, []);

  // DNI
  const setDNIFrontPhoto = useCallback((photo: UploadedPhoto | null) => {
    setFormData(prev => ({ ...prev, dni: { ...prev.dni, front: { photo, extraction: photo ? prev.dni.front.extraction : null } } }));
  }, []);
  const setDNIFrontExtraction = useCallback((extraction: AIExtraction | null) => {
    setFormData(prev => ({ ...prev, dni: { ...prev.dni, front: { ...prev.dni.front, extraction } } }));
  }, []);
  const setDNIBackPhoto = useCallback((photo: UploadedPhoto | null) => {
    setFormData(prev => ({ ...prev, dni: { ...prev.dni, back: { photo, extraction: photo ? prev.dni.back.extraction : null } } }));
  }, []);
  const setDNIBackExtraction = useCallback((extraction: AIExtraction | null) => {
    setFormData(prev => ({ ...prev, dni: { ...prev.dni, back: { ...prev.dni.back, extraction } } }));
  }, []);

  // IBI
  const setIBIPhoto = useCallback((photo: UploadedPhoto | null) => {
    setFormData(prev => ({ ...prev, ibi: { ...prev.ibi, photo, extraction: photo ? prev.ibi.extraction : null } }));
  }, []);
  const setIBIExtraction = useCallback((extraction: AIExtraction | null) => {
    setFormData(prev => ({ ...prev, ibi: { ...prev.ibi, extraction } }));
  }, []);

  // Electricity
  const setElectricityPhoto = useCallback((photo: UploadedPhoto | null) => {
    setFormData(prev => ({ ...prev, electricityBill: { ...prev.electricityBill, photo, extraction: photo ? prev.electricityBill.extraction : null } }));
  }, []);
  const setElectricityExtraction = useCallback((extraction: AIExtraction | null) => {
    setFormData(prev => ({ ...prev, electricityBill: { ...prev.electricityBill, extraction } }));
  }, []);

  // Photos
  const setElectricalPanelPhotos = useCallback((photos: UploadedPhoto[]) => {
    setFormData(prev => ({ ...prev, electricalPanel: { photos } }));
  }, []);
  const updateInstallationSpace = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, installationSpace: { ...prev.installationSpace, [field]: value } }));
  }, []);
  const updateRoof = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, roof: { ...prev.roof, [field]: value } }));
  }, []);
  const updateRadiators = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, radiators: { ...prev.radiators, [field]: value } }));
  }, []);

  // Signatures
  const setCustomerSignature = useCallback((sig: string | null) => {
    setFormData(prev => ({ ...prev, signatures: { ...prev.signatures, customerSignature: sig } }));
  }, []);
  const setRepSignature = useCallback((sig: string | null) => {
    setFormData(prev => ({ ...prev, signatures: { ...prev.signatures, repSignature: sig } }));
  }, []);

  // Validators
  const validatePhone = useCallback((): boolean => {
    const e: FormErrors = {};
    const phone = formData.phone.trim();
    if (!phone) {
      e.phone = 'El teléfono es obligatorio';
    } else if (phone.replace(/\s/g, '').length < 9) {
      e.phone = 'Introduce un número de teléfono válido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData.phone]);

  const validatePropertyDocs = useCallback((): boolean => {
    setErrors({});
    return true;
  }, []);

  const validateSignatures = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!formData.signatures.customerSignature) e['signatures.customer'] = 'Firma del cliente obligatoria';
    if (!formData.signatures.repSignature) e['signatures.rep'] = 'Firma del comercial obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData.signatures]);

  const getProgress = useCallback(() => {
    const items = getFormItems(productType);
    const completed = items.filter(item => item.isComplete(formData, productType)).length;
    return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  }, [formData, productType]);

  const canSubmit = useCallback((): boolean => {
    const items = getFormItems(productType);
    return items.filter(i => i.required).every(i => i.isComplete(formData, productType));
  }, [formData, productType]);

  const restoreFormData = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  return {
    formData,
    errors,
    setPhone,
    setDNIFrontPhoto, setDNIFrontExtraction,
    setDNIBackPhoto, setDNIBackExtraction,
    setIBIPhoto, setIBIExtraction,
    setElectricityPhoto, setElectricityExtraction,
    setElectricalPanelPhotos,
    updateInstallationSpace, updateRoof, updateRadiators,
    setCustomerSignature, setRepSignature,
    validatePhone, validatePropertyDocs, validateSignatures,
    getProgress, canSubmit,
    setErrors, restoreFormData,
  };
};
