import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Check, FileText, User, CreditCard, Shield, Loader2, Edit2, AlertCircle, MapPin, Pen } from 'lucide-react';
import type { FormData, ProjectData } from '@/types';
import { submitFormData, getClientIP } from '@/services/backOffice';

interface ReviewSectionProps {
  project: ProjectData;
  formData: FormData;
  source: 'customer' | 'assessor';
  onEdit: (section: string) => void;
  onSuccess: () => void;
}

export const ReviewSection = ({
  project,
  formData,
  source,
  onEdit,
  onSuccess
}: ReviewSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.review-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const ipAddress = await getClientIP();

      const submissionData = {
        projectCode: project.projectCode,
        timestamp: Date.now(),
        ipAddress,
        source,
        formData,
        documentStatus: {
          dniFront: (formData.dniFront ? 'received' : 'missing') as 'missing' | 'received' | 'pending',
          dniBack: (formData.dniBack ? 'received' : 'missing') as 'missing' | 'received' | 'pending',
          bill: (formData.bill ? 'received' : 'missing') as 'missing' | 'received' | 'pending',
          ibi: (formData.ibi ? 'received' : 'missing') as 'missing' | 'received' | 'pending',
          iban: (formData.iban ? 'received' : 'missing') as 'missing' | 'received' | 'pending',
          auth: (formData.authSignature ? 'signed' : 'missing') as 'missing' | 'signed' | 'pending',
        }
      };

      const result = await submitFormData(submissionData);

      if (!result.success) {
        throw new Error(result.error || 'Error al enviar los documentos');
      }

      onSuccess();

    } catch (err) {
      setSubmitError('Hubo un problema al enviar los documentos. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  const documents = [
    {
      id: 'location',
      icon: MapPin,
      title: 'Localización',
      value: formData.location === 'catalonia' ? 'Cataluña' : formData.location === 'madrid' ? 'Madrid' : 'Valencia',
      status: 'complete'
    },
    {
      id: 'personal',
      icon: User,
      title: 'Datos personales',
      value: 'Completado',
      status: 'complete'
    },
    {
      id: 'owner',
      icon: User,
      title: 'Propietario',
      value: formData.isOwner ? 'Soy el propietario' : `No soy el propietario (${formData.ownerData.relation})`,
      status: 'complete'
    },
    {
      id: 'dni',
      icon: FileText,
      title: 'DNI',
      value: 'Fotos frontal y trasera subidas',
      status: formData.dniFront && formData.dniBack ? 'complete' : 'incomplete'
    },
    {
      id: 'bill',
      icon: FileText,
      title: 'Factura',
      value: formData.bill ? 'Documento subido' : 'Pendiente',
      status: formData.bill ? 'complete' : 'pending'
    },
    {
      id: 'ibi',
      icon: FileText,
      title: 'IBI',
      value: formData.ibi ? 'Documento subido' : 'Pendiente (opcional)',
      status: formData.ibi ? 'complete' : 'optional'
    },
    {
      id: 'iban',
      icon: CreditCard,
      title: 'IBAN',
      value: formData.iban.replace(/(.{4})/g, '$1 ').trim(),
      status: 'complete'
    },
    {
      id: 'vat',
      icon: Pen,
      title: 'Certificado IVA',
      value: formData.vatSignature ? 'Firmado' : 'Pendiente',
      status: formData.vatSignature ? 'complete' : 'pending'
    },
    {
      id: 'auth',
      icon: Shield,
      title: 'Autorización',
      value: formData.authSignature ? 'Firmada' : 'Pendiente',
      status: formData.authSignature ? 'complete' : 'pending'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <div className="w-6 h-6 bg-eltex-success rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>;
      case 'pending':
        return <div className="w-6 h-6 bg-eltex-warning/20 rounded-full flex items-center justify-center"><AlertCircle className="w-4 h-4 text-eltex-warning" /></div>;
      case 'optional':
        return <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center"><span className="text-xs text-gray-400">-</span></div>;
      default:
        return <div className="w-6 h-6 bg-eltex-error/20 rounded-full flex items-center justify-center"><AlertCircle className="w-4 h-4 text-eltex-error" /></div>;
    }
  };

  const isComplete = () => {
    return formData.dniFront && formData.dniBack && formData.bill && formData.iban && formData.vatSignature && formData.authSignature;
  };

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12 pb-32">
      <div className="review-card w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Revisión</span>
            <span className="text-eltex-blue font-medium">Finalizar</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Revisa tu documentación
            </h1>
            <p className="text-gray-500">
              Comprueba que todo esté correcto antes de enviar
            </p>
          </div>

          {/* Documents List */}
          <div className="space-y-3 mb-8">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <doc.icon className="w-5 h-5 text-eltex-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-500">{doc.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.status)}
                  <button
                    onClick={() => onEdit(doc.id)}
                    className="p-2 text-gray-400 hover:text-eltex-blue transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {submitError && (
            <div className="mb-6 p-4 bg-eltex-error/10 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-eltex-error flex-shrink-0" />
              <p className="text-sm text-eltex-error">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isComplete()}
            className="btn-primary"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </span>
            ) : 'Enviar documentación'}
          </button>
        </div>
      </div>
    </div>
  );
};
