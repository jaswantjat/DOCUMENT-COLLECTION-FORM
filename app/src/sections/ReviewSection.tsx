import { useState } from 'react';
import { CheckCircle, Edit2, AlertTriangle, Send, Loader2, ChevronRight } from 'lucide-react';
import type { FormData, ProjectData } from '@/types';
import { submitForm } from '@/services/api';
import { getFormItems } from '@/hooks/useFormState';

interface Props {
  project: ProjectData;
  formData: FormData;
  source: 'customer' | 'assessor';
  canSubmit: boolean;
  onEdit: (section: string) => void;
  onSuccess: () => void;
}

interface ReviewItemProps {
  label: string;
  value: string | null;
  section: string;
  onEdit: (section: string) => void;
}

function ReviewItem({ label, value, section, onEdit }: ReviewItemProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value || <em>No completado</em>}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(section)}
        className="ml-3 p-1.5 text-eltex-blue hover:bg-eltex-blue-light rounded-lg transition-colors shrink-0"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ReviewGroup({
  title, children,
}: {
  title: string; children: React.ReactNode;
}) {
  return (
    <div className="form-card overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="px-5">
        {children}
      </div>
    </div>
  );
}

export function ReviewSection({
  project,
  formData,
  source,
  canSubmit,
  onEdit,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const formItems = getFormItems(project.productType);
  const incompleteMandatory = formItems.filter(i => i.required && !i.isComplete(formData, project.productType));
  const allComplete = incompleteMandatory.length === 0;

  const handleSubmit = async () => {
    if (!allComplete) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const result = await submitForm(project.code, formData, source);
      if (result.success) {
        onSuccess();
      } else {
        setSubmitError('Error al enviar. Por favor, inténtalo de nuevo.');
      }
    } catch {
      setSubmitError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const { dni, ibi, electricityBill, electricalPanel, roof, installationSpace, radiators, signatures } = formData;
  const dniName = dni.front.extraction?.extractedData?.fullName;
  const dniNumber = dni.front.extraction?.extractedData?.dniNumber;
  const dniAddress = dni.back.extraction?.extractedData?.address
    ? `${dni.back.extraction.extractedData.address}, ${dni.back.extraction.extractedData.municipality || ''}`
    : null;

  return (
    <div className="min-h-screen p-4 pb-10">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="form-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-eltex-blue-light flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-eltex-blue" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Revisar y enviar</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Comprueba que todo es correcto antes de enviar. Puedes editar cualquier sección.
          </p>
        </div>

        {/* Completion status */}
        {!allComplete && (
          <div className="form-card p-4 bg-orange-50 border border-orange-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800">Faltan elementos obligatorios</p>
                <ul className="mt-1 space-y-1">
                  {incompleteMandatory.map(item => (
                    <li key={item.id} className="text-xs text-orange-700 flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3" />
                      <button
                        type="button"
                        onClick={() => onEdit(item.section)}
                        className="hover:underline"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        <ReviewGroup title="Datos de contacto">
          <ReviewItem label="Teléfono" value={formData.phone || project.phone} section="phone" onEdit={onEdit} />
          <ReviewItem label="Nombre (del DNI)" value={dniName || project.customerName} section="property-docs" onEdit={onEdit} />
          <ReviewItem label="DNI / NIE" value={dniNumber || null} section="property-docs" onEdit={onEdit} />
          <ReviewItem label="Domicilio" value={dniAddress} section="property-docs" onEdit={onEdit} />
        </ReviewGroup>

        {/* Documents */}
        <ReviewGroup title="Documentación del inmueble">
          <ReviewItem
            label="DNI — Frontal"
            value={dni.front.photo ? (dni.front.extraction?.confirmedByUser ? 'Confirmado' : 'Subido') : null}
            section="property-docs"
            onEdit={onEdit}
          />
          <ReviewItem
            label="DNI — Trasero"
            value={dni.back.photo ? (dni.back.extraction?.confirmedByUser ? 'Confirmado' : 'Subido') : null}
            section="property-docs"
            onEdit={onEdit}
          />
          <ReviewItem
            label="IBI / Escritura"
            value={ibi.extraction?.confirmedByUser
              ? ibi.extraction.extractedData?.referenciaCatastral
                ? `Ref. Catastral: ${ibi.extraction.extractedData.referenciaCatastral}`
                : 'Subido y confirmado'
              : ibi.photo ? 'Subido (pendiente confirmar)' : null}
            section="property-docs"
            onEdit={onEdit}
          />
          <ReviewItem
            label="Factura de electricidad"
            value={electricityBill.extraction?.confirmedByUser
              ? electricityBill.extraction.extractedData?.cups
                ? `CUPS: ${electricityBill.extraction.extractedData.cups}`
                : 'Subido y confirmado'
              : electricityBill.photo ? 'Subido (pendiente confirmar)' : null}
            section="property-docs"
            onEdit={onEdit}
          />
        </ReviewGroup>

        {/* Photos */}
        <ReviewGroup title="Fotos del inmueble">
          <ReviewItem
            label="Cuadro eléctrico"
            value={electricalPanel.photos.length > 0 ? `${electricalPanel.photos.length} foto(s)` : null}
            section="property-photos"
            onEdit={onEdit}
          />
          {project.productType === 'solar' && (
            <ReviewItem
              label="Tejado"
              value={roof.photos.length > 0
                ? `${roof.photos.length} foto(s) · ${roof.roofType || ''} · ${roof.orientation || ''}`
                : null}
              section="property-photos"
              onEdit={onEdit}
            />
          )}
          {project.productType === 'aerothermal' && (
            <>
              <ReviewItem
                label="Espacio de instalación"
                value={installationSpace.photos.length > 0
                  ? `${installationSpace.photos.length} foto(s) · ${installationSpace.widthCm}×${installationSpace.depthCm}×${installationSpace.heightCm} cm`
                  : null}
                section="property-photos"
                onEdit={onEdit}
              />
              <ReviewItem
                label="Radiadores"
                value={radiators.photos.length > 0
                  ? `${radiators.photos.length} foto(s) · ${radiators.radiatorType || ''} · ${radiators.totalCount || '?'} uds`
                  : null}
                section="property-photos"
                onEdit={onEdit}
              />
            </>
          )}
        </ReviewGroup>

        {/* Signatures */}
        <ReviewGroup title="Firmas">
          <ReviewItem
            label="Firma del cliente"
            value={signatures.customerSignature ? 'Firmado' : null}
            section="signatures"
            onEdit={onEdit}
          />
          <ReviewItem
            label="Firma del comercial"
            value={signatures.repSignature ? 'Firmado' : null}
            section="signatures"
            onEdit={onEdit}
          />
        </ReviewGroup>

        {/* Submit error */}
        {submitError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-eltex-error border border-red-100">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allComplete || submitting}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar documentación
            </>
          )}
        </button>

        {!allComplete && (
          <p className="text-xs text-center text-gray-400">
            Completa todos los campos obligatorios para poder enviar.
          </p>
        )}
      </div>
    </div>
  );
}
