import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Phone, Loader2 } from 'lucide-react';
import type { ProjectData } from '@/types';
import { lookupByPhone } from '@/services/api';

interface Props {
  onPhoneFound: (phone: string, project: ProjectData) => void;
  onContinueWithCode: (project: ProjectData) => void;
  project?: ProjectData | null; // already loaded via URL code
}

export function WelcomeSection({ onPhoneFound, onContinueWithCode, project }: Props) {
  const [phone, setPhone] = useState(project?.phone || '');
  const [error, setError] = useState('');
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState(!!project);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!project) inputRef.current?.focus();
  }, [project]);

  // If project already loaded via URL code, just confirm phone
  const handleContinue = async () => {
    if (project) {
      onContinueWithCode(project);
      return;
    }

    const cleaned = phone.trim();
    if (!cleaned || cleaned.replace(/\s/g, '').length < 9) {
      setError('Introduce un número de teléfono válido');
      return;
    }

    setLooking(true);
    setError('');
    try {
      const res = await lookupByPhone(cleaned);
      if (res.success && res.project) {
        setFound(true);
        onPhoneFound(cleaned, res.project);
      } else {
        setError(res.message || 'No encontramos ningún proyecto con ese número. Contacta con tu asesor.');
      }
    } catch {
      setError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
    } finally {
      setLooking(false);
    }
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
              {project ? `Hola, ${project.customerName.split(' ')[0]}` : 'Bienvenido/a'}
            </h1>
            <p className="text-gray-500 text-sm">
              {project
                ? 'Tu asesor ha preparado este formulario para ti. Pulsa continuar para empezar.'
                : 'Introduce tu número de teléfono para acceder a tu formulario.'}
            </p>
          </div>

          {/* Phone input — only shown when no project loaded by URL */}
          {!project && (
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
                  onKeyDown={e => e.key === 'Enter' && handleContinue()}
                  placeholder="+34 600 000 000"
                  autoComplete="tel"
                  className={`form-input pl-10 ${error ? 'error' : found ? 'border-green-400 focus:border-green-500 focus:ring-green-100' : ''}`}
                />
              </div>
              {error && <p className="text-xs text-eltex-error flex items-center gap-1.5">{error}</p>}
              {found && <p className="text-xs text-green-600 font-medium">✓ Proyecto encontrado</p>}
            </div>
          )}

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
