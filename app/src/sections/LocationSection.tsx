import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MapPin, Building, CheckCircle2 } from 'lucide-react';
import type { Location } from '@/types';

interface LocationSectionProps {
  location: Location;
  isCompany: boolean;
  onLocationChange: (location: Location) => void;
  onCompanyToggle: (isCompany: boolean) => void;
  companyName: string;
  companyNIF: string;
  companyAddress: string;
  companyCity: string;
  companyPostal: string;
  onCompanyFieldChange: (field: string, value: string) => void;
  onContinue: () => void;
  errors: {
    'companyData.name'?: string;
    'companyData.nif'?: string;
    'companyData.address'?: string;
    'companyData.city'?: string;
    'companyData.postalCode'?: string;
  };
}

const locations: { id: Location; label: string; flag: string }[] = [
  { id: 'catalonia', label: 'Cataluña', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'madrid', label: 'Madrid', flag: '🇪🇸' },
  { id: 'valencia', label: 'Valencia', flag: '🇪🇸' },
];

export const LocationSection = ({
  location,
  isCompany,
  onLocationChange,
  onCompanyToggle,
  companyName,
  companyNIF,
  companyAddress,
  companyCity,
  companyPostal,
  onCompanyFieldChange,
  onContinue,
  errors,
}: LocationSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.location-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );

      gsap.fromTo(
        '.location-option',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getError = (field: string) => {
    const errorField = `companyData.${field}` as keyof typeof errors;
    return errors[errorField];
  };

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12 pb-32">
      <div className="location-card w-full max-w-xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 1 de 9</span>
            <span className="text-eltex-blue font-medium">Localización</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '11%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-eltex-blue" />
              <h1 className="text-2xl font-bold text-gray-900">Localización</h1>
            </div>
            <p className="text-gray-500 ml-7">Selecciona tu ubicación para continuar</p>
          </div>

          {/* Location Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿En qué sitio te encuentras actualmente? <span className="text-eltex-error">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => onLocationChange(loc.id)}
                  className={`
                    location-option p-4 border-2 rounded-xl text-left transition-all duration-200
                    ${location === loc.id
                      ? 'border-eltex-blue bg-eltex-blue/5 ring-2 ring-eltex-blue/20'
                      : 'border-gray-200 hover:border-eltex-blue hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{loc.flag}</span>
                    <span className="font-medium text-gray-900">{loc.label}</span>
                  </div>
                  {location === loc.id && (
                    <div className="flex justify-end mt-2">
                      <CheckCircle2 className="w-4 h-4 text-eltex-blue" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Company Toggle */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Es empresa?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onCompanyToggle(true)}
                className={`
                  p-4 border-2 rounded-xl text-left transition-all duration-200
                  ${isCompany
                    ? 'border-eltex-blue bg-eltex-blue/5 ring-2 ring-eltex-blue/20'
                    : 'border-gray-200 hover:border-eltex-blue hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5" />
                  <span className="font-medium text-gray-900">Sí</span>
                </div>
                {isCompany && (
                  <div className="flex justify-end mt-2">
                    <CheckCircle2 className="w-4 h-4 text-eltex-blue" />
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => onCompanyToggle(false)}
                className={`
                  p-4 border-2 rounded-xl text-left transition-all duration-200
                  ${!isCompany
                    ? 'border-eltex-blue bg-eltex-blue/5 ring-2 ring-eltex-blue/20'
                    : 'border-gray-200 hover:border-eltex-blue hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium text-gray-900">No</span>
                </div>
                {!isCompany && (
                  <div className="flex justify-end mt-2">
                    <CheckCircle2 className="w-4 h-4 text-eltex-blue" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Company Fields */}
          {isCompany && (
            <div className="bg-eltex-lavender rounded-xl p-6 mb-6 animate-fade-in-up">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la empresa</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la empresa <span className="text-eltex-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => onCompanyFieldChange('name', e.target.value)}
                    className={`form-input ${getError('name') ? 'error' : ''}`}
                    placeholder="Nombre de la empresa"
                  />
                  {getError('name') && (
                    <p className="text-eltex-error text-sm mt-1">{getError('name')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIF de la empresa <span className="text-eltex-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyNIF}
                    onChange={(e) => onCompanyFieldChange('nif', e.target.value.toUpperCase())}
                    className={`form-input ${getError('nif') ? 'error' : ''}`}
                    placeholder="B12345678"
                    maxLength={10}
                  />
                  {getError('nif') && (
                    <p className="text-eltex-error text-sm mt-1">{getError('nif')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de la empresa <span className="text-eltex-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => onCompanyFieldChange('address', e.target.value)}
                    className={`form-input ${getError('address') ? 'error' : ''}`}
                    placeholder="Calle, número, piso"
                  />
                  {getError('address') && (
                    <p className="text-eltex-error text-sm mt-1">{getError('address')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Municipalidad <span className="text-eltex-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyCity}
                      onChange={(e) => onCompanyFieldChange('city', e.target.value)}
                      className={`form-input ${getError('city') ? 'error' : ''}`}
                      placeholder="Ciudad"
                    />
                    {getError('city') && (
                      <p className="text-eltex-error text-sm mt-1">{getError('city')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código postal <span className="text-eltex-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyPostal}
                      onChange={(e) => onCompanyFieldChange('postal', e.target.value.replace(/\D/g, ''))}
                      className={`form-input ${getError('postalCode') ? 'error' : ''}`}
                      placeholder="08001"
                      maxLength={5}
                    />
                    {getError('postalCode') && (
                      <p className="text-eltex-error text-sm mt-1">{getError('postalCode')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <span>Continuar</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
