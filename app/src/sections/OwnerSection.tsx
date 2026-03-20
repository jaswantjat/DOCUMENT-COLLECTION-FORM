import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { UserCheck, UserX, ChevronDown, AlertCircle, ArrowLeft } from 'lucide-react';
import type { FormData, FormErrors } from '@/types';

interface OwnerSectionProps {
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  updateOwnerField: <K extends keyof FormData['ownerData']>(field: K, value: FormData['ownerData'][K]) => void;
  onBack: () => void;
  onContinue: () => void;
}

const relationOptions = [
  { value: 'conyuge', label: 'Cónyuge' },
  { value: 'padre-madre', label: 'Padre/Madre' },
  { value: 'hijo-a', label: 'Hijo/a' },
  { value: 'arrendador', label: 'Arrendador/a' },
  { value: 'otro', label: 'Otro' }
];

export const OwnerSection = ({
  formData,
  errors,
  updateField,
  updateOwnerField,
  onBack,
  onContinue
}: OwnerSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(formData.isOwner === false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.owner-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'expo.out' }
      );
    }
  }, [showForm]);

  const handleOwnerResponse = (isOwner: boolean) => {
    updateField('isOwner', isOwner);
    setShowForm(!isOwner);
  };

  const canContinue = () => {
    if (formData.isOwner === null) return false;
    if (formData.isOwner === false) {
      return formData.ownerData.name && formData.ownerData.phone && formData.ownerData.relation;
    }
    return true;
  };

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="owner-card w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 1 de 6</span>
            <span className="text-eltex-blue font-medium">Propietario</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '16%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¿Eres el propietario?
            </h1>
            <p className="text-gray-500">
              Necesitamos saber quién es el titular de la vivienda
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleOwnerResponse(true)}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
                formData.isOwner === true
                  ? 'border-eltex-blue bg-eltex-blue-light'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                formData.isOwner === true ? 'bg-eltex-blue' : 'bg-gray-100'
              }`}>
                <UserCheck className={`w-7 h-7 ${formData.isOwner === true ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className={`font-semibold ${formData.isOwner === true ? 'text-eltex-blue' : 'text-gray-700'}`}>
                Sí, soy el propietario
              </span>
            </button>

            <button
              onClick={() => handleOwnerResponse(false)}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
                formData.isOwner === false
                  ? 'border-eltex-blue bg-eltex-blue-light'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                formData.isOwner === false ? 'bg-eltex-blue' : 'bg-gray-100'
              }`}>
                <UserX className={`w-7 h-7 ${formData.isOwner === false ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className={`font-semibold ${formData.isOwner === false ? 'text-eltex-blue' : 'text-gray-700'}`}>
                No, no soy el propietario
              </span>
            </button>
          </div>

          {errors.isOwner && (
            <div className="flex items-center gap-2 text-eltex-error text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {errors.isOwner}
            </div>
          )}

          {/* Owner Details Form */}
          {showForm && (
            <div ref={formRef} className="overflow-hidden">
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="bg-eltex-warning/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Importante:</strong> El propietario deberá firmar la autorización de representación. Te contactaremos para gestionar esto.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 required">
                    Nombre completo del propietario
                  </label>
                  <input
                    type="text"
                    value={formData.ownerData.name}
                    onChange={(e) => updateOwnerField('name', e.target.value)}
                    className={`form-input ${errors['ownerData.name'] ? 'error' : ''}`}
                    placeholder="Ej: María García López"
                  />
                  {errors['ownerData.name'] && (
                    <p className="mt-1.5 text-sm text-eltex-error">{errors['ownerData.name']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 required">
                    Teléfono del propietario
                  </label>
                  <input
                    type="tel"
                    value={formData.ownerData.phone}
                    onChange={(e) => updateOwnerField('phone', e.target.value)}
                    className={`form-input ${errors['ownerData.phone'] ? 'error' : ''}`}
                    placeholder="Ej: +34 612 345 678"
                  />
                  {errors['ownerData.phone'] && (
                    <p className="mt-1.5 text-sm text-eltex-error">{errors['ownerData.phone']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 required">
                    Relación con el propietario
                  </label>
                  <div className="relative">
                    <select
                      value={formData.ownerData.relation}
                      onChange={(e) => updateOwnerField('relation', e.target.value)}
                      className={`form-input appearance-none ${errors['ownerData.relation'] ? 'error' : ''}`}
                    >
                      <option value="">Selecciona una opción</option>
                      {relationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors['ownerData.relation'] && (
                    <p className="mt-1.5 text-sm text-eltex-error">{errors['ownerData.relation']}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex gap-3 mt-8">
            <button onClick={onBack} className="btn-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onContinue}
              disabled={!canContinue()}
              className="btn-primary flex-1"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
