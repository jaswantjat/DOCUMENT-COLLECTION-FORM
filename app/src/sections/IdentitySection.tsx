import { ArrowRight, ArrowLeft, User, MapPin } from 'lucide-react';
import type { CustomerIdentity, FormErrors } from '@/types';

interface Props {
  identity: CustomerIdentity;
  errors: FormErrors;
  onChange: (field: keyof CustomerIdentity, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function Field({
  label, value, onChange, error, type = 'text', placeholder, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; type?: string; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-eltex-error">*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`form-input ${error ? 'error' : ''}`}
      />
      {error && <p className="text-xs text-eltex-error mt-1">{error}</p>}
    </div>
  );
}

export function IdentitySection({ identity, errors, onChange, onBack, onContinue }: Props) {
  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="form-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-eltex-blue-light flex items-center justify-center">
              <User className="w-4 h-4 text-eltex-blue" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Datos personales</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">Información del titular del proyecto.</p>
        </div>

        {/* Personal info */}
        <div className="form-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Identidad</h3>
          <Field label="Nombre completo" value={identity.fullName} onChange={v => onChange('fullName', v)}
            error={errors['identity.fullName']} placeholder="María García López" autoComplete="name" />
          <Field label="DNI / NIE" value={identity.dni} onChange={v => onChange('dni', v.toUpperCase())}
            error={errors['identity.dni']} placeholder="12345678A" autoComplete="off" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Teléfono" value={identity.phone} onChange={v => onChange('phone', v)}
              error={errors['identity.phone']} type="tel" placeholder="+34 600 000 000" autoComplete="tel" />
            <Field label="Email" value={identity.email} onChange={v => onChange('email', v)}
              error={errors['identity.email']} type="email" placeholder="maria@email.com" autoComplete="email" />
          </div>
        </div>

        {/* Property address */}
        <div className="form-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-eltex-blue" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Dirección del inmueble</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Calle / Avenida" value={identity.street} onChange={v => onChange('street', v)}
                error={errors['identity.street']} placeholder="Calle Mayor" autoComplete="address-line1" />
            </div>
            <Field label="Número" value={identity.number} onChange={v => onChange('number', v)}
              error={errors['identity.number']} placeholder="12" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Piso" value={identity.floor} onChange={v => onChange('floor', v)}
              placeholder="3º" />
            <Field label="Puerta" value={identity.door} onChange={v => onChange('door', v)}
              placeholder="B" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código postal" value={identity.postalCode} onChange={v => onChange('postalCode', v)}
              error={errors['identity.postalCode']} placeholder="28001" autoComplete="postal-code" />
            <Field label="Municipio" value={identity.municipality} onChange={v => onChange('municipality', v)}
              error={errors['identity.municipality']} placeholder="Madrid" autoComplete="address-level2" />
          </div>
          <Field label="Provincia" value={identity.province} onChange={v => onChange('province', v)}
            error={errors['identity.province']} placeholder="Madrid" autoComplete="address-level1" />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onBack} className="btn-secondary flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          <button type="button" onClick={onContinue} className="btn-primary flex items-center justify-center gap-2">
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
