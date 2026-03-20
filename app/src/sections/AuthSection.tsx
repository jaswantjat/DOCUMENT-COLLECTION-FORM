import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, Check, FileText, Building2, Zap, Landmark, Mail, ArrowLeft } from 'lucide-react';
import { SignaturePad } from '@/components/SignaturePad';
import type { FormData, FormErrors, ProjectData } from '@/types';

interface AuthSectionProps {
  project: ProjectData;
  formData: FormData;
  errors: FormErrors;
  setSignature: (data: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const AuthSection = ({
  project,
  formData,
  errors,
  setSignature,
  onBack,
  onContinue
}: AuthSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.auth-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const organismos = [
    { icon: Landmark, label: 'Administraciones Públicas' },
    { icon: Building2, label: 'Ayuntamiento' },
    { icon: FileText, label: 'Organismo de Gestión Tributaria' },
    { icon: Zap, label: 'Distribuidora de Energía Eléctrica' }
  ];

  const tramites = [
    'Solicitud de la Licencia/Comunicación de obras',
    'Solicitud de la bonificación de Tasas (ICIO)',
    'Solicitud de la bonificación de IBI',
    'Solicitud de las subvenciones estatales',
    'Solicitud de CAU'
  ];

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="auth-card w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 6 de 6</span>
            <span className="text-eltex-blue font-medium">Autorización</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '95%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-eltex-blue text-white rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Autorización de Representación
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Autoriza a Eltex a gestionar tu proyecto
            </h1>
            <p className="text-gray-500 text-center">
              Necesitamos tu firma para poder tramitar permisos y bonificaciones
            </p>
          </div>

          {/* Document Preview */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            {/* Interesado */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm font-medium mb-3">
                Persona interesada
              </span>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Nombre</p>
                <p className="font-medium text-gray-900">{project.customerName}</p>
              </div>
            </div>

            {/* Representante */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-eltex-blue/10 text-eltex-blue rounded-md text-sm font-medium mb-3">
                Representante
              </span>
              <div className="bg-white rounded-lg p-4 border border-eltex-blue/20">
                <p className="text-sm text-gray-500 mb-1">Razón social</p>
                <p className="font-medium text-gray-900">ELTEX SOLAR S.L.U.</p>
                <p className="text-sm text-gray-500 mt-2 mb-1">NIF</p>
                <p className="font-medium text-gray-900">B06936587</p>
              </div>
            </div>

            {/* Organismos */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Organismos ante los que se autoriza:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {organismos.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                    <Icon className="w-4 h-4 text-eltex-blue" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trámites */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Trámites habilitados:
              </p>
              <div className="space-y-2">
                {tramites.map((tramite) => (
                  <div key={tramite} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-eltex-success flex-shrink-0" />
                    <span className="text-sm text-gray-600">{tramite}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 required">
                Firma de aprobación
              </label>
              {formData.authSignature && (
                <span className="flex items-center gap-1 text-sm text-eltex-success">
                  <Check className="w-4 h-4" />
                  Firmado
                </span>
              )}
            </div>
            
            <SignaturePad
              onSignature={setSignature}
              existingSignature={formData.authSignature}
              error={errors.authSignature}
            />
          </div>

          {/* Data Protection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>Protección de datos:</strong> El tratamiento de tus datos personales no será 
                comunicado a terceros, excepto bajo obligaciones legales. Cumplimos la Ley Orgánica 
                3/2018 de Protección de Datos. Para más información:{' '}
                <a href="mailto:atencioncliente@eltex.es" className="text-eltex-blue hover:underline">
                  atencioncliente@eltex.es
                </a>
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex gap-3">
            <button onClick={onBack} className="btn-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onContinue}
              disabled={!formData.authSignature}
              className="btn-primary flex-1"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
