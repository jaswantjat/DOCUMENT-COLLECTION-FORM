import { useEffect, useRef } from 'react';
import { CheckCircle, MessageCircle, Phone } from 'lucide-react';
import type { ProjectData } from '@/types';

interface Props {
  project: ProjectData;
}

export function SuccessSection({ project }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const els = containerRef.current.querySelectorAll('[data-animate]');
    els.forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(20px)';
      setTimeout(() => {
        htmlEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        htmlEl.style.opacity = '1';
        htmlEl.style.transform = 'translateY(0)';
      }, i * 100);
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-lg text-center">

        {/* Success icon */}
        <div data-animate className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <div data-animate className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            ¡Documentación enviada!
          </h1>
          <p className="text-gray-600 text-lg">
            Hola {project.customerName.split(' ')[0]}, hemos recibido toda tu documentación.
          </p>
        </div>

        {/* What happens next */}
        <div data-animate className="form-card p-6 mb-6 text-left space-y-4">
          <h3 className="font-semibold text-gray-900">¿Qué pasa ahora?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-eltex-blue flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Revisión de documentos</p>
                <p className="text-xs text-gray-500">Nuestro equipo revisará la documentación en las próximas 24–48 horas laborables.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-eltex-blue flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Confirmación por WhatsApp</p>
                <p className="text-xs text-gray-500">Recibirás un mensaje de confirmación en tu teléfono {project.phone}.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-eltex-blue flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Visita técnica</p>
                <p className="text-xs text-gray-500">Tu asesor {project.assessor} se pondrá en contacto para coordinar la visita técnica.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div data-animate className="form-card p-5 mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-3">¿Tienes alguna duda?</p>
          <div className="flex gap-3">
            <a
              href={`tel:${project.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-eltex-blue-light text-eltex-blue font-medium rounded-xl text-sm hover:bg-eltex-blue hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              Llamar
            </a>
            <a
              href={`https://wa.me/${project.phone.replace(/[^0-9]/g, '')}?text=Hola,%20acabo%20de%20enviar%20la%20documentaci%C3%B3n%20del%20proyecto%20${project.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-50 text-green-700 font-medium rounded-xl text-sm hover:bg-green-600 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Ref */}
        <p data-animate className="text-xs text-gray-400">
          Referencia del proyecto: <strong>{project.code}</strong> · Asesor: {project.assessor}
        </p>

        {/* Logo */}
        <div data-animate className="flex justify-center mt-6">
          <img src="/eltex-logo.png" alt="Eltex" className="h-8 object-contain opacity-60" />
        </div>
      </div>
    </div>
  );
}
