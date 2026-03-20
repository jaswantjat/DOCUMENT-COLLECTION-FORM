import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { AlertTriangle, MessageCircle, Mail } from 'lucide-react';

interface ErrorSectionProps {
  error: string;
}

export const ErrorSection = ({ error }: ErrorSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.error-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getErrorMessage = () => {
    switch (error) {
      case 'PROJECT_NOT_FOUND':
        return 'Este enlace no es válido. El código de proyecto no existe o ha expirado.';
      case 'INVALID_CODE':
        return 'Este enlace no es válido. Falta el código de proyecto.';
      case 'NETWORK_ERROR':
        return 'No pudimos conectar con el servidor. Por favor, inténtalo de nuevo.';
      default:
        return 'Este enlace no es válido. Contacta con tu asesor de Eltex.';
    }
  };

  return (
    <div 
      ref={sectionRef}
      className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-eltex-lavender"
    >
      <div className="error-card w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/eltex-logo.png" 
            alt="Eltex" 
            className="h-10 object-contain"
          />
        </div>

        <div className="form-card overflow-hidden">
          {/* Header */}
          <div className="bg-eltex-error px-8 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-eltex-error" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Enlace no válido
            </h2>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <p className="text-lg text-gray-700 mb-6">
              {getErrorMessage()}
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-500 mb-4">
                ¿Necesitas ayuda? Contacta con nosotros:
              </p>
              
              <div className="space-y-3">
                <a 
                  href="https://wa.me/34123456789"
                  className="flex items-center justify-center gap-3 w-full py-3 bg-[#25d366] text-white rounded-xl hover:bg-[#128c7e] transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Eltex</span>
                </a>
                
                <a 
                  href="mailto:atencioncliente@eltex.es"
                  className="flex items-center justify-center gap-3 w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  <Mail className="w-5 h-5" />
                  <span>atencioncliente@eltex.es</span>
                </a>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              O contacta directamente con tu asesor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
