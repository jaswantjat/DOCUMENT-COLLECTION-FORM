import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FileText, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import type { ProjectData } from '@/types';

interface WelcomeSectionProps {
  project: ProjectData;
  onContinue: () => void;
}

export const WelcomeSection = ({ project, onContinue }: WelcomeSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.welcome-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
      
      gsap.fromTo(
        '.feature-item',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.3, ease: 'expo.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const firstName = project.customerName.split(' ')[0];

  return (
    <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="welcome-card w-full max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/eltex-logo.png" 
            alt="Eltex" 
            className="h-10 object-contain"
          />
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¡Hola, {firstName}!
            </h1>
            <p className="text-gray-500">
              Completa la documentación de tu proyecto solar
            </p>
          </div>

          {/* Project Info */}
          <div className="bg-eltex-lavender rounded-xl p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-eltex-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-eltex-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Proyecto</p>
                <p className="font-semibold text-gray-900">{project.projectCode}</p>
                <p className="text-sm text-gray-600 mt-1">{project.address}</p>
                <p className="text-sm text-gray-500 mt-0.5">Asesor: {project.assessor}</p>
              </div>
            </div>
          </div>

          {/* What you'll need */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Necesitarás
            </h2>
            <div className="space-y-3">
              <div className="feature-item flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-eltex-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-eltex-success" />
                </div>
                <span className="text-gray-700">DNI (foto frontal y trasera)</span>
              </div>
              <div className="feature-item flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-eltex-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-eltex-success" />
                </div>
                <span className="text-gray-700">Factura de la luz</span>
              </div>
              <div className="feature-item flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-eltex-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-eltex-success" />
                </div>
                <span className="text-gray-700">IBAN de tu cuenta bancaria</span>
              </div>
              <div className="feature-item flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <div className="w-8 h-8 bg-eltex-warning/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-eltex-warning" />
                </div>
                <span className="text-gray-500">IBI (opcional, para bonificaciones)</span>
              </div>
            </div>
          </div>

          {/* Time estimate */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Shield className="w-4 h-4" />
            <span>Tus datos están protegidos y encriptados</span>
          </div>

          {/* CTA Button */}
          <button
            onClick={onContinue}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <span>Comenzar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Tiempo estimado: 3-5 minutos
        </p>
      </div>
    </div>
  );
};
