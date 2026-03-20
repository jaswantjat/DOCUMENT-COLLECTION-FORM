import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FileText, Calendar, Info } from 'lucide-react';
import { SignaturePad } from '@/components/SignaturePad';
import type { PersonalData } from '@/types';

interface IVACertificateSectionProps {
  personalData: PersonalData;
  vatSignature: string | null;
  errors: {
    vatSignature?: string;
  };
  onSignature: (data: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const IVACertificateSection = ({
  personalData,
  vatSignature,
  errors,
  onSignature,
  onBack,
  onContinue,
}: IVACertificateSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState({ day: '', month: '', year: '' });

  useEffect(() => {
    const now = new Date();
    setDate({
      day: now.getDate().toString(),
      month: getMonthName(now.getMonth()),
      year: now.getFullYear().toString().slice(-2),
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.iva-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getMonthName = (month: number): string => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  };

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12 pb-32">
      <div className="iva-card w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 7 de 9</span>
            <span className="text-eltex-blue font-medium">Certificado 10% IVA</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '78%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-eltex-blue" />
              <h1 className="text-2xl font-bold text-gray-900">Certificado 10% IVA</h1>
            </div>
            <p className="text-gray-500 ml-7">Firma</p>
          </div>

          {/* Info Alert */}
          <div className="bg-eltex-blue/5 border border-eltex-blue/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-eltex-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Solicitud de tipo reducido de IVA (10%)
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Art. 91.uno.2. 10º Ley 37/1992 del Impuesto de Valor Añadido
                </p>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            {/* Header */}
            <div className="text-center mb-4 pb-4 border-b border-gray-200">
              <span className="inline-block px-4 py-2 bg-eltex-blue text-white rounded-full text-sm font-medium">
                IVA REDUCIDO
              </span>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                SOLICITUD DE CERTIFICACIÓN DE APLICACIÓN DE TIPO REDUCIDO DE IVA (10%)
              </h3>
              <p className="text-xs text-gray-500">
                EN OBRAS DE RENOVACIÓN Y REPARACIÓN DE VIVIENDAS
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (Art. 91.uno.2. 10º Ley 37/1992 del Impuesto de Valor Añadido)
              </p>
            </div>

            {/* Form Content */}
            <div className="text-gray-700 text-sm leading-relaxed">
              <p className="mb-4">
                <strong>Sr/Sra.</strong>{' '}
                <span className="border-b border-gray-400 min-w-[200px] inline-block">
                  {personalData.fullName || '________________________________________'}
                </span>
              </p>

              <p className="mb-4">
                <strong>titular del DNI</strong>{' '}
                <span className="border-b border-gray-400 min-w-[150px] inline-block">
                  {personalData.dni || '_______________'}
                </span>
              </p>

              <p className="mb-4">
                <strong>con domicilio en</strong>{' '}
                <span className="border-b border-gray-400 min-w-[300px] inline-block">
                  {personalData.address || '__________________________________________________'}
                </span>
              </p>

              <p className="mb-4">
                <strong>código postal</strong>{' '}
                <span className="border-b border-gray-400 min-w-[80px] inline-block">
                  {personalData.postalCode || '_______'}
                </span>
                , localidad{' '}
                <span className="border-b border-gray-400 min-w-[150px] inline-block">
                  {personalData.city || '_______________'}
                </span>
                ,{' '}
                provincia{' '}
                <span className="border-b border-gray-400 min-w-[100px] inline-block">
                  {personalData.province || '___________'}
                </span>
                ,
              </p>

              <p className="mb-4"><strong>bajo su responsabilidad manifiesta los siguientes puntos:</strong></p>

              <p className="mb-3"><strong>1º. Confirma los apartados siguientes:</strong></p>

              <ul className="list-disc list-inside space-y-2 mb-4 pl-4">
                <li>Que no actúa como empresa, profesional o persona jurídica, sino única y exclusivamente como persona física.</li>
                <li>
                  Que es propietario o arrendatario del inmueble situado en{' '}
                  <span className="border-b border-gray-400 min-w-[200px] inline-block">
                    {personalData.address || '__________________________________________________'}
                  </span>
                  .
                </li>
                <li>Que la referida vivienda está construido/rehabilitado desde hace más de dos años de la fecha en que se firma el documento.</li>
                <li>Que el uso del inmueble está destinado al uso particular.</li>
              </ul>

              <p className="mb-3"><strong>2º. Pide a la empresa ELTEX SOLAR S.L.U. con NIF B06936587 y domicilio a C/ DE LAS CIENCIAS 81 - NAVE 2, L'Hospitalet de Llobregat (08908) la aplicación del tipo reducido del IVA para concurrir a todas y cada una de las circunstancias y requisitos expresados anteriormente y descritos según el artículo 91. Uno 2.10º de la Ley 37/1992, en la ejecución de la obra constituyente como rehabilitación de eficiencia energética y mejora/reforma de la superficie de ubicación de la propia instalación, realizada a la referida vivienda y facturada a nombre del titular del presente documento.</strong></p>
            </div>

            {/* Date Line */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700 text-right">
                En <span className="border-b border-gray-400 min-w-[150px] inline-block">_______________</span>,
                el <span className="border-b border-gray-400 min-w-[40px] inline-block px-2 text-center">{date.day}</span> de{' '}
                <span className="border-b border-gray-400 min-w-[100px] inline-block px-2 text-center">{date.month}</span> de 20{' '}
                <span className="border-b border-gray-400 min-w-[30px] inline-block px-2 text-center">{date.year}</span>
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Firma de aprobación <span className="text-eltex-error">*</span>
              </label>
              {vatSignature && (
                <span className="flex items-center gap-1 text-sm text-eltex-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Firmado
                </span>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Fecha: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <SignaturePad
                onSignature={onSignature}
                existingSignature={vatSignature}
                error={errors.vatSignature}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onBack} className="btn-secondary flex-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onContinue}
              disabled={!vatSignature}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <span>Continuar</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
