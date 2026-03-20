import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FileText, Shield, Clock, ArrowRight } from 'lucide-react';
import type { ProjectData } from '@/types';

interface Props {
  project: ProjectData;
  completedCount: number;
  totalCount: number;
  onContinue: () => void;
}

export function WelcomeSection({ project, completedCount, totalCount, onContinue }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const els = containerRef.current.querySelectorAll('[data-animate]');
    gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'expo.out' });
  }, []);

  const hasProgress = completedCount > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-lg">
        <div className="form-card p-8">
          {/* Logo */}
          <div data-animate className="flex justify-center mb-6">
            <img src="/eltex-logo.png" alt="Eltex" className="h-10 object-contain" />
          </div>

          {/* Greeting */}
          <div data-animate className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Hola, {project.customerName.split(' ')[0]}
            </h1>
            <p className="text-gray-600">
              {hasProgress
                ? 'Te quedan algunos documentos por completar. Retoma donde lo dejaste.'
                : `Tu asesor ${project.assessor} ha preparado este formulario para recoger la documentación de tu proyecto ${project.productType === 'solar' ? 'de energía solar' : 'de aerotermia'}.`
              }
            </p>
          </div>

          {/* Progress if returning */}
          {hasProgress && (
            <div data-animate className="bg-eltex-blue-light rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-eltex-blue">Tu progreso</span>
                <span className="text-sm font-bold text-eltex-blue">{completedCount} de {totalCount}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
              </div>
            </div>
          )}

          {/* What we need */}
          <div data-animate className="space-y-3 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Lo que necesitamos</h3>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <FileText className="w-5 h-5 text-eltex-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Datos personales y documentos</p>
                <p className="text-xs text-gray-500">DNI, IBI/escritura, factura de luz, fotos del inmueble</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-eltex-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Guarda y continúa luego</p>
                <p className="text-xs text-gray-500">El progreso se guarda automáticamente. Puedes continuar en cualquier momento con el mismo enlace.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-eltex-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Tus datos están seguros</p>
                <p className="text-xs text-gray-500">Conexión cifrada y cumplimiento RGPD.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button data-animate onClick={onContinue} className="btn-primary flex items-center justify-center gap-2">
            {hasProgress ? 'Continuar' : 'Empezar'}
            <ArrowRight className="w-5 h-5" />
          </button>

          <p data-animate className="text-xs text-center text-gray-400 mt-4">
            Ref: {project.code} · Asesor: {project.assessor}
          </p>
        </div>
      </div>
    </div>
  );
}
