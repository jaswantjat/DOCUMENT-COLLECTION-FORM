import { useState, useCallback } from 'react';
import type { FormData, UploadedFile, FormErrors, OwnerData, CompanyData, PersonalData } from '@/types';
import { validateIBAN as validateIBANFormat } from '@/services/backOffice';

interface UseFormStateReturn {
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  updateOwnerField: <K extends keyof OwnerData>(field: K, value: OwnerData[K]) => void;
  updateCompanyField: <K extends keyof CompanyData>(field: K, value: CompanyData[K]) => void;
  updatePersonalField: <K extends keyof PersonalData>(field: K, value: PersonalData[K]) => void;
  setFile: (field: 'dniFront' | 'dniBack' | 'bill' | 'ibi', file: UploadedFile | null) => void;
  setVATSignature: (data: string | null) => void;
  setAuthSignature: (data: string | null) => void;
  validateLocation: () => boolean;
  validatePersonal: () => boolean;
  validateOwner: () => boolean;
  validateDNI: () => boolean;
  validateBill: () => boolean;
  validateIBAN: () => boolean;
  validateVAT: () => boolean;
  validateAuth: () => boolean;
  clearError: (field: keyof FormErrors) => void;
  getProgress: () => number;
}

const initialOwnerData: OwnerData = {
  name: '',
  phone: '',
  relation: ''
};

const initialCompanyData: CompanyData = {
  name: '',
  nif: '',
  address: '',
  city: '',
  postalCode: ''
};

const initialPersonalData: PersonalData = {
  fullName: '',
  dni: '',
  address: '',
  postalCode: '',
  city: '',
  province: '',
  phone: '',
  email: '',
  comments: ''
};

const initialFormData: FormData = {
  location: 'catalonia',
  isCompany: false,
  companyData: initialCompanyData,
  personalData: initialPersonalData,
  isOwner: null,
  ownerData: initialOwnerData,
  dniFront: null,
  dniBack: null,
  bill: null,
  ibi: null,
  iban: '',
  vatSignature: null,
  authSignature: null,
  fechaFirma: new Date().toISOString(),
  lugarFirma: ''
};

export const useFormState = (): UseFormStateReturn => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field as keyof FormErrors);
  }, []);

  const updateOwnerField = useCallback(<K extends keyof OwnerData>(
    field: K,
    value: OwnerData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      ownerData: { ...prev.ownerData, [field]: value }
    }));
    clearError(`ownerData.${field}` as keyof FormErrors);
  }, []);

  const updateCompanyField = useCallback(<K extends keyof CompanyData>(
    field: K,
    value: CompanyData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      companyData: { ...prev.companyData, [field]: value }
    }));
    clearError(`companyData.${field}` as keyof FormErrors);
  }, []);

  const updatePersonalField = useCallback(<K extends keyof PersonalData>(
    field: K,
    value: PersonalData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      personalData: { ...prev.personalData, [field]: value }
    }));
    clearError(`personalData.${field}` as keyof FormErrors);
  }, []);

  const setFile = useCallback((
    field: 'dniFront' | 'dniBack' | 'bill' | 'ibi',
    file: UploadedFile | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    clearError(field);
  }, []);

  const setVATSignature = useCallback((data: string | null) => {
    setFormData(prev => ({ ...prev, vatSignature: data }));
    clearError('vatSignature');
  }, []);

  const setAuthSignature = useCallback((data: string | null) => {
    setFormData(prev => ({ ...prev, authSignature: data }));
    clearError('authSignature');
  }, []);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validateLocation = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (formData.isCompany) {
      if (!formData.companyData.name.trim()) {
        newErrors['companyData.name'] = 'El nombre de la empresa es obligatorio';
      }
      if (!formData.companyData.nif.trim()) {
        newErrors['companyData.nif'] = 'El NIF de la empresa es obligatorio';
      }
      if (!formData.companyData.address.trim()) {
        newErrors['companyData.address'] = 'La dirección es obligatoria';
      }
      if (!formData.companyData.city.trim()) {
        newErrors['companyData.city'] = 'La ciudad es obligatoria';
      }
      if (!formData.companyData.postalCode.trim()) {
        newErrors['companyData.postalCode'] = 'El código postal es obligatorio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.isCompany, formData.companyData]);

  const validatePersonal = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.personalData.fullName.trim()) {
      newErrors['personalData.fullName'] = 'El nombre completo es obligatorio';
    }
    if (!formData.personalData.dni.trim()) {
      newErrors['personalData.dni'] = 'El DNI/NIF es obligatorio';
    }
    if (!formData.personalData.address.trim()) {
      newErrors['personalData.address'] = 'La dirección es obligatoria';
    }
    if (!formData.personalData.postalCode.trim()) {
      newErrors['personalData.postalCode'] = 'El código postal es obligatorio';
    }
    if (!formData.personalData.city.trim()) {
      newErrors['personalData.city'] = 'La localidad es obligatoria';
    }
    if (!formData.personalData.province.trim()) {
      newErrors['personalData.province'] = 'La provincia es obligatoria';
    }
    if (!formData.personalData.phone.trim()) {
      newErrors['personalData.phone'] = 'El teléfono es obligatorio';
    }
    if (!formData.personalData.email.trim() || !formData.personalData.email.includes('@')) {
      newErrors['personalData.email'] = 'Introduce un email válido';
    }

    // Update lugarFirma with city
    if (formData.personalData.city) {
      setFormData(prev => ({ ...prev, lugarFirma: formData.personalData.city }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.personalData]);

  const validateOwner = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (formData.isOwner === null) {
      newErrors.isOwner = 'Indica si eres el propietario';
    }

    if (formData.isOwner === false) {
      if (!formData.ownerData.name.trim()) {
        newErrors['ownerData.name'] = 'El nombre del propietario es obligatorio';
      }
      if (!formData.ownerData.phone.trim()) {
        newErrors['ownerData.phone'] = 'El teléfono es obligatorio';
      }
      if (!formData.ownerData.relation) {
        newErrors['ownerData.relation'] = 'Selecciona la relación';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.isOwner, formData.ownerData]);

  const validateDNI = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.dniFront) {
      newErrors.dniFront = 'Sube la foto frontal de tu DNI';
    }
    if (!formData.dniBack) {
      newErrors.dniBack = 'Sube la foto trasera de tu DNI';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.dniFront, formData.dniBack]);

  const validateBill = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.bill) {
      newErrors.bill = 'Sube tu factura de la luz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.bill]);

  const validateIBAN = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.iban.trim()) {
      newErrors.iban = 'Introduce tu IBAN';
    } else if (!validateIBANFormat(formData.iban.replace(/\s/g, ''))) {
      newErrors.iban = 'Introduce un IBAN español válido (ES + 22 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.iban]);

  const validateVAT = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.vatSignature) {
      newErrors.vatSignature = 'Debes firmar el certificado de IVA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.vatSignature]);

  const validateAuth = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.authSignature) {
      newErrors.authSignature = 'Debes firmar la autorización';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.authSignature]);

  const getProgress = useCallback((): number => {
    let completed = 0;
    let total = 9;

    if (formData.location) completed++;
    if (!formData.isCompany || (formData.companyData.name && formData.companyData.nif)) completed++;
    if (formData.personalData.fullName) completed++;
    if (formData.isOwner !== null) completed++;
    if (formData.dniFront) completed++;
    if (formData.dniBack) completed++;
    if (formData.bill) completed++;
    if (formData.iban && validateIBANFormat(formData.iban.replace(/\s/g, ''))) completed++;
    if (formData.vatSignature) completed++;
    if (formData.authSignature) completed++;

    return Math.round((completed / total) * 100);
  }, [formData]);

  return {
    formData,
    errors,
    updateField,
    updateOwnerField,
    updateCompanyField,
    updatePersonalField,
    setFile,
    setVATSignature,
    setAuthSignature,
    validateLocation,
    validatePersonal,
    validateOwner,
    validateDNI,
    validateBill,
    validateIBAN,
    validateVAT,
    validateAuth,
    clearError,
    getProgress
  };
};
