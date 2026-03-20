import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Check, FileText, Shield, Download, MessageCircle, Home } from 'lucide-react';
import type { ProjectData } from '@/types';

interface SuccessSectionProps {
  project: ProjectData;
}

export const SuccessSection = ({ project }: SuccessSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.success-icon',
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
      );

      gsap.fromTo(
        '.success-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.3 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Confetti animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const colors = ['#3B46FF', '#10B981', '#F0F4FF', '#ffffff'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - (p.y / canvas.height));
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-eltex-blue to-eltex-blue-dark"
    >
      {/* Confetti Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Content */}
      <div className="success-content relative z-10 w-full max-w-lg mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center">
          {/* Success Icon */}
          <div className="success-icon w-20 h-20 bg-eltex-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            ¡Documentación enviada!
          </h1>

          <p className="text-gray-600 mb-8">
            Hemos recibido correctamente todos tus documentos para el proyecto de{' '}
            <strong className="text-eltex-blue">{project.customerName}</strong>.
          </p>

          {/* Documents Summary */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Documentos recibidos
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="w-8 h-8 bg-eltex-success/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-eltex-success" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">DNI</p>
                </div>
                <Check className="w-5 h-5 text-eltex-success" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="w-8 h-8 bg-eltex-success/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-eltex-success" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">Factura de luz</p>
                </div>
                <Check className="w-5 h-5 text-eltex-success" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="w-8 h-8 bg-eltex-success/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-eltex-success" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">Autorización de representación</p>
                </div>
                <Check className="w-5 h-5 text-eltex-success" />
              </div>
            </div>
          </div>

          {/* WhatsApp Confirmation */}
          <div className="bg-[#25d366]/10 border border-[#25d366]/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="w-5 h-5 text-[#25d366]" />
              <span className="font-medium text-gray-900">Confirmación enviada</span>
            </div>
            <p className="text-sm text-gray-600">
              Te hemos enviado un WhatsApp con la confirmación
            </p>
          </div>

          {/* Project Info */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
            <Home className="w-4 h-4" />
            <span>Proyecto: {project.projectCode}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Descargar copia</span>
            </button>
            <button
              onClick={() => window.close()}
              className="flex-1 px-6 py-3 bg-eltex-blue text-white rounded-xl hover:bg-eltex-blue-dark transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/70 mt-6">
          Tu asesor {project.assessor} revisará la documentación
        </p>
      </div>
    </div>
  );
};
