import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { User, Mail, Phone } from 'lucide-react';
import type { PersonalData } from '@/types';

interface PersonalDataSectionProps {
  personalData: PersonalData;
  errors: {
    'personalData.fullName'?: string;
    'personalData.dni'?: string;
    'personalData.address'?: string;
    'personalData.postalCode'?: string;
    'personalData.city'?: string;
    'personalData.province'?: string;
    'personalData.phone'?: string;
    'personalData.email'?: string;
  };
  onFieldChange: (field: keyof PersonalData, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const PersonalDataSection = ({
  personalData,
  errors,
  onFieldChange,
  onBack,
  onContinue,
}: PersonalDataSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.personal-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getError = (field: keyof PersonalData) => {
    return errors[`personalData.${field}` as keyof typeof errors];
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  };

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12 pb-32">
      <div className="personal-card w-full max-w-xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 2 de 9</span>
            <span className="text-eltex-blue font-medium">Datos Personales</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '22%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-eltex-blue" />
              <h1 className="text-2xl font-bold text-gray-900">Datos Personales</h1>
            </div>
            <p className="text-gray-500 ml-7">Completa tu información personal</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre y apellidos <span className="text-eltex-error">*</span>
              </label>
              <input
                type="text"
                value={personalData.fullName}
                onChange={(e) => onFieldChange('fullName', e.target.value)}
                className={`form-input ${getError('fullName') ? 'error' : ''}`}
                placeholder="Juan García López"
              />
              {getError('fullName') && (
                <p className="text-eltex-error text-sm mt-1">{getError('fullName')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIF / DNI <span className="text-eltex-error">*</span>
              </label>
              <input
                type="text"
                value={personalData.dni}
                onChange={(e) => onFieldChange('dni', e.target.value.toUpperCase())}
                className={`form-input ${getError('dni') ? 'error' : ''}`}
                placeholder="12345678A"
                maxLength={10}
              />
              {getError('dni') && (
                <p className="text-eltex-error text-sm mt-1">{getError('dni')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección <span className="text-eltex-error">*</span>
              </label>
              <input
                type="text"
                value={personalData.address}
                onChange={(e) => onFieldChange('address', e.target.value)}
                className={`form-input ${getError('address') ? 'error' : ''}`}
                placeholder="Calle, número, piso, puerta"
              />
              {getError('address') && (
                <p className="text-eltex-error text-sm mt-1">{getError('address')}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código postal <span className="text-eltex-error">*</span>
                </label>
                <input
                  type="text"
                  value={personalData.postalCode}
                  onChange={(e) => onFieldChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  className={`form-input ${getError('postalCode') ? 'error' : ''}`}
                  placeholder="08001"
                  maxLength={5}
                />
                {getError('postalCode') && (
                  <p className="text-eltex-error text-sm mt-1">{getError('postalCode')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localidad <span className="text-eltex-error">*</span>
                </label>
                <input
                  type="text"
                  value={personalData.city}
                  onChange={(e) => onFieldChange('city', e.target.value)}
                  className={`form-input ${getError('city') ? 'error' : ''}`}
                  placeholder="Barcelona"
                />
                {getError('city') && (
                  <p className="text-eltex-error text-sm mt-1">{getError('city')}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia <span className="text-eltex-error">*</span>
              </label>
              <input
                type="text"
                value={personalData.province}
                onChange={(e) => onFieldChange('province', e.target.value)}
                className={`form-input ${getError('province') ? 'error' : ''}`}
                placeholder="Barcelona"
              />
              {getError('province') && (
                <p className="text-eltex-error text-sm mt-1">{getError('province')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-eltex-error">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={personalData.phone}
                  onChange={(e) => onFieldChange('phone', formatPhone(e.target.value))}
                  className={`form-input pl-12 ${getError('phone') ? 'error' : ''}`}
                  placeholder="+34 600 000 000"
                />
              </div>
              {getError('phone') && (
                <p className="text-eltex-error text-sm mt-1">{getError('phone')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-eltex-error">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={personalData.email}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  className={`form-input pl-12 ${getError('email') ? 'error' : ''}`}
                  placeholder="juan@email.com"
                />
              </div>
              {getError('email') && (
                <p className="text-eltex-error text-sm mt-1">{getError('email')}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onBack}
              className="btn-secondary flex-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onContinue}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <span>Continuar</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
