import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Phone, Loader2 } from 'lucide-react';
import type { ProjectData } from '@/types';
import { lookupByPhone } from '@/services/api';

interface Props {
  projectPhone?: string; // pre-filled if project already loaded
  initialPhone?: string;
  onPhoneConfirmed: (phone: string, project?: ProjectData) => void;
  onContinue: () => void;
}

export function PhoneSection({ projectPhone, initialPhone, onPhoneConfirmed, onContinue }: Props) {
  const [phone, setPhone] = useState(initialPhone || projectPhone || '');
  const [error, setError] = useState('');
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState(!!projectPhone);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContinue = async () => {
    const cleaned = phone.trim();
    if (!cleaned || cleaned.replace(/\s/g, '').length < 9) {
      setError('Introduce un número de teléfono válido');
      return;
    }

    // If project was already loaded by URL code, just confirm phone and continue
    if (projectPhone) {
      onPhoneConfirmed(cleaned);
      onContinue();
      return;
    }

    // Look up project by phone
    setLooking(true);
    setError('');
    try {
      const res = await lookupByPhone(cleaned);
      if (res.success && res.project) {
        setFound(true);
        onPhoneConfirmed(cleaned, res.project);
        // Small delay for UX feedback
        setTimeout(() => onContinue(), 400);
      } else {
        setError(res.message || 'No encontramos ningún proyecto con ese número. Contacta con tu asesor.');
      }
    } catch {
      setError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
    } finally {
      setLooking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleContinue();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="form-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/eltex-logo.png" alt="Eltex" className="h-10 object-contain" />
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-eltex-blue-light flex items-center justify-center">
              <Phone className="w-8 h-8 text-eltex-blue" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {projectPhone ? 'Confirma tu teléfono' : '¿Cuál es tu número de teléfono?'}
            </h1>
            <p className="text-gray-500 text-sm">
              {projectPhone
                ? 'Tu asesor nos ha facilitado tu número. Confirma que es correcto para continuar.'
                : 'Introduce el teléfono con el que tu asesor registró el proyecto.'}
            </p>
          </div>

          {/* Input */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none select-none">
                🇪🇸
              </span>
              <input
                ref={inputRef}
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError(''); setFound(false); }}
                onKeyDown={handleKeyDown}
                placeholder="+34 600 000 000"
                autoComplete="tel"
                className={`form-input pl-10 ${error ? 'error' : found ? 'border-green-400 focus:border-green-500 focus:ring-green-100' : ''}`}
              />
            </div>
            {error && <p className="text-xs text-eltex-error flex items-center gap-1.5">{error}</p>}
            {found && <p className="text-xs text-green-600 font-medium">✓ Proyecto encontrado</p>}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={looking}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {looking ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Buscando...</>
            ) : (
              <>Continuar <ArrowRight className="w-5 h-5" /></>
            )}
          </button>

          <p className="text-xs text-center text-gray-400 mt-5">
            ¿Problemas? Contacta con tu asesor de Eltex.
          </p>
        </div>
      </div>
    </div>
  );
}
