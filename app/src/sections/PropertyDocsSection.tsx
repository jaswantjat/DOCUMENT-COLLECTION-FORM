import { useState, useCallback } from 'react';
import { ArrowRight, ArrowLeft, FileText, Zap, CreditCard, CheckCircle, AlertTriangle, Edit2, RotateCcw, Info, Phone } from 'lucide-react';
import type { IBIData, ElectricityBillData, DNIData, UploadedPhoto, AIExtraction, DocSlot, FormErrors } from '@/types';
import { validatePhoto, createUploadedPhoto, fileToPreview, fileToBase64 } from '@/lib/photoValidation';
import { extractDocument } from '@/services/api';

interface Props {
  dni: DNIData;
  ibi: IBIData;
  electricityBill: ElectricityBillData;
  errors: FormErrors;
  onDNIFrontPhotoChange: (photo: UploadedPhoto | null) => void;
  onDNIFrontExtractionChange: (extraction: AIExtraction | null) => void;
  onDNIBackPhotoChange: (photo: UploadedPhoto | null) => void;
  onDNIBackExtractionChange: (extraction: AIExtraction | null) => void;
  onIBIPhotoChange: (photo: UploadedPhoto | null) => void;
  onIBIExtractionChange: (extraction: AIExtraction | null) => void;
  onElectricityPhotoChange: (photo: UploadedPhoto | null) => void;
  onElectricityExtractionChange: (extraction: AIExtraction | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

type UploadState = 'idle' | 'validating' | 'extracting' | 'confirming' | 'done' | 'error' | 'wrong-doc';

type DocType = 'ibi' | 'electricity' | 'dniFront' | 'dniBack';

const FIELD_CONFIGS: Record<DocType, Array<{ key: string; label: string }>> = {
  dniFront: [
    { key: 'fullName', label: 'Nombre completo' },
    { key: 'dniNumber', label: 'Número DNI/NIE' },
    { key: 'dateOfBirth', label: 'Fecha de nacimiento' },
    { key: 'expiryDate', label: 'Válido hasta' },
    { key: 'sex', label: 'Sexo' },
  ],
  dniBack: [
    { key: 'address', label: 'Domicilio' },
    { key: 'municipality', label: 'Municipio' },
    { key: 'province', label: 'Provincia' },
    { key: 'placeOfBirth', label: 'Lugar de nacimiento' },
  ],
  ibi: [
    { key: 'referenciaCatastral', label: 'Referencia Catastral' },
    { key: 'titular', label: 'Titular' },
    { key: 'direccion', label: 'Dirección del inmueble' },
  ],
  electricity: [
    { key: 'cups', label: 'CUPS' },
    { key: 'potenciaContratada', label: 'Potencia contratada (kW)' },
    { key: 'tipoFase', label: 'Tipo de instalación' },
    { key: 'direccionSuministro', label: 'Dirección de suministro' },
  ],
};

interface DocUploadProps {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  data: DocSlot;
  documentType: DocType;
  error?: string;
  exampleNote: string;
  onPhotoChange: (photo: UploadedPhoto | null) => void;
  onExtractionChange: (extraction: AIExtraction | null) => void;
}

function DocUpload({ label, subtitle, icon, data, documentType, error, exampleNote, onPhotoChange, onExtractionChange }: DocUploadProps) {
  const [state, setState] = useState<UploadState>(
    data.photo ? (data.extraction?.confirmedByUser ? 'done' : 'confirming') : 'idle'
  );
  const [statusMsg, setStatusMsg] = useState('');
  const [wrongDocMsg, setWrongDocMsg] = useState('');
  const [validationErr, setValidationErr] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showExample, setShowExample] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setValidationErr('');
    setWrongDocMsg('');
    setState('validating');
    setStatusMsg('Comprobando archivo...');

    const result = await validatePhoto(file);
    if (!result.valid) {
      setState('error');
      setValidationErr(result.error || 'Archivo no válido');
      return;
    }

    const preview = await fileToPreview(file);
    const photo = createUploadedPhoto(file, preview, result.width, result.height);
    onPhotoChange(photo);

    setState('extracting');
    setStatusMsg('Analizando con IA...');

    try {
      const base64 = await fileToBase64(file);
      const res = await extractDocument(base64, documentType);

      if (res.isWrongDocument) {
        setState('wrong-doc');
        setWrongDocMsg(res.message || 'Documento incorrecto');
        return;
      }

      if (!res.extraction) {
        onExtractionChange({ extractedData: {}, confidence: 0, isCorrectDocument: true, documentTypeDetected: documentType, needsManualReview: true, confirmedByUser: true });
        setState('done');
        setStatusMsg(res.message || 'Se revisará manualmente.');
        return;
      }

      onExtractionChange({ ...res.extraction, confirmedByUser: false });
      setState('confirming');
    } catch {
      onExtractionChange({ extractedData: {}, confidence: 0, isCorrectDocument: true, documentTypeDetected: documentType, needsManualReview: true, confirmedByUser: true });
      setState('done');
      setStatusMsg('Análisis no disponible. Se revisará manualmente.');
    }
  }, [documentType, onPhotoChange, onExtractionChange]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const confirmExtraction = () => {
    if (!data.extraction) return;
    onExtractionChange({ ...data.extraction, confirmedByUser: true, manualCorrections: editValues });
    setState('done');
  };

  const retake = () => {
    onPhotoChange(null);
    onExtractionChange(null);
    setValidationErr('');
    setWrongDocMsg('');
    setEditValues({});
    setState('idle');
  };

  const ext = data.extraction?.extractedData || {};
  const fields = FIELD_CONFIGS[documentType];

  return (
    <div className="form-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-eltex-blue-light flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {state === 'done' && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Listo
          </div>
        )}
      </div>

      {/* Example toggle */}
      <button type="button" onClick={() => setShowExample(v => !v)}
        className="flex items-center gap-1.5 text-xs text-eltex-blue hover:underline">
        <Info className="w-3.5 h-3.5" /> {showExample ? 'Ocultar' : '¿Qué foto necesito?'}
      </button>
      {showExample && (
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-100">{exampleNote}</div>
      )}

      {/* IDLE / WRONG-DOC — upload zone */}
      {(state === 'idle' || state === 'wrong-doc') && (
        <label className="upload-zone p-6 text-center block cursor-pointer"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
          <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleInput} />
          <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Arrastra o <span className="text-eltex-blue font-medium">pulsa para subir</span></p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG o PDF · Máx. 20MB</p>
        </label>
      )}

      {/* LOADING */}
      {(state === 'validating' || state === 'extracting') && (
        <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-eltex-blue border-t-transparent rounded-full animate-spin shrink-0" />
          <p className="text-sm text-eltex-blue">{statusMsg}</p>
        </div>
      )}

      {/* WRONG DOC */}
      {state === 'wrong-doc' && (
        <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl text-sm text-orange-700 border border-orange-100">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{wrongDocMsg}</p>
            <button type="button" onClick={retake} className="text-xs text-eltex-blue mt-1 flex items-center gap-1 hover:underline">
              <RotateCcw className="w-3 h-3" /> Subir de nuevo
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {state === 'error' && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-sm text-eltex-error border border-red-100">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{validationErr}</p>
            <button type="button" onClick={retake} className="text-xs text-eltex-blue mt-1 flex items-center gap-1 hover:underline">
              <RotateCcw className="w-3 h-3" /> Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Photo preview */}
      {data.photo && state !== 'idle' && (
        <div className="flex gap-3 items-start">
          <img src={data.photo.preview} alt="Document" className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0" />
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700 truncate max-w-[200px]">{data.photo.file?.name || 'Foto subida'}</p>
            <p>{(data.photo.sizeBytes / 1024 / 1024).toFixed(1)} MB{data.photo.width ? ` · ${data.photo.width}×${data.photo.height}px` : ''}</p>
          </div>
        </div>
      )}

      {/* CONFIRMING */}
      {state === 'confirming' && data.extraction && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CheckCircle className="w-4 h-4 text-eltex-success" />
            Datos extraídos — confirma que son correctos
          </div>
          {data.extraction.needsManualReview && (
            <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg text-xs text-orange-700 border border-orange-100">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Confianza baja. Revisa los campos.
            </div>
          )}
          <div className="space-y-2">
            {fields.map(({ key, label }) => {
              const raw = ext[key];
              const warning = ext[`${key}Warning`];
              const displayVal = editValues[key] ?? (raw !== null && raw !== undefined ? String(raw) : '');
              const isEditing = editingField === key;
              return (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-medium">{label}</span>
                    <button type="button" onClick={() => { setEditingField(isEditing ? null : key); setEditValues(v => ({ ...v, [key]: displayVal })); }}
                      className="text-xs text-eltex-blue flex items-center gap-1 hover:underline">
                      <Edit2 className="w-3 h-3" />{isEditing ? 'Cerrar' : 'Corregir'}
                    </button>
                  </div>
                  {isEditing ? (
                    <input type="text" value={editValues[key] ?? displayVal} onChange={e => setEditValues(v => ({ ...v, [key]: e.target.value }))}
                      className="form-input text-sm" autoFocus />
                  ) : (
                    <p className={`text-sm font-medium ${raw ? 'text-gray-900' : 'text-gray-400'}`}>
                      {displayVal || <em>No detectado</em>}
                    </p>
                  )}
                  {warning && <p className="text-xs text-orange-600 mt-1">{warning}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={retake} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5">
              <RotateCcw className="w-3.5 h-3.5" /> Repetir
            </button>
            <button type="button" onClick={confirmExtraction} className="btn-primary flex-1 text-sm py-2.5">
              Confirmar datos
            </button>
          </div>
        </div>
      )}

      {/* DONE */}
      {state === 'done' && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            {fields.map(({ key, label }) => {
              const finalVal = data.extraction?.manualCorrections?.[key] ?? data.extraction?.extractedData?.[key];
              return (
                <div key={key} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-eltex-success shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500">{label}: </span>
                    <span className="text-sm font-medium text-gray-800">
                      {finalVal !== null && finalVal !== undefined ? String(finalVal) : <em className="text-gray-400">No detectado</em>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {data.extraction?.needsManualReview && (
            <p className="text-xs text-orange-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Marcado para revisión manual
            </p>
          )}
          {statusMsg && <p className="text-xs text-gray-500">{statusMsg}</p>}
          <button type="button" onClick={retake} className="text-xs text-eltex-blue hover:underline flex items-center gap-1 mt-1">
            <RotateCcw className="w-3 h-3" /> Cambiar foto
          </button>
        </div>
      )}

      {error && state === 'idle' && (
        <p className="text-xs text-eltex-error">{error}</p>
      )}
    </div>
  );
}

// ── Section divider ────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export function PropertyDocsSection({
  dni, ibi, electricityBill, errors,
  onDNIFrontPhotoChange, onDNIFrontExtractionChange,
  onDNIBackPhotoChange, onDNIBackExtractionChange,
  onIBIPhotoChange, onIBIExtractionChange,
  onElectricityPhotoChange, onElectricityExtractionChange,
  onBack, onContinue,
}: Props) {
  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="form-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-eltex-blue-light flex items-center justify-center">
              <FileText className="w-4 h-4 text-eltex-blue" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Documentación</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Opcional — sube los que tengas ahora. La IA extrae los datos automáticamente.
          </p>
        </div>

        {/* DNI */}
        <SectionLabel label="DNI / NIE" />

        <DocUpload
          label="DNI — Cara frontal"
          subtitle="Lado con la foto y número de DNI"
          icon={<CreditCard className="w-4 h-4 text-eltex-blue" />}
          data={dni.front}
          documentType="dniFront"
          error={errors['dni.front']}
          exampleNote="Fotografía clara del anverso del DNI o NIE. Asegúrate de que el número de documento (ej. 12345678A), la fecha de nacimiento y el nombre sean legibles. Buena iluminación, sin reflejos."
          onPhotoChange={onDNIFrontPhotoChange}
          onExtractionChange={onDNIFrontExtractionChange}
        />

        <DocUpload
          label="DNI — Cara trasera"
          subtitle="Lado con el domicilio y zona MRZ"
          icon={<CreditCard className="w-4 h-4 text-eltex-blue" />}
          data={dni.back}
          documentType="dniBack"
          error={errors['dni.back']}
          exampleNote="Fotografía del reverso del DNI. Necesitamos la dirección de tu domicilio que aparece en el dorso. Asegúrate de que el texto sea completamente legible."
          onPhotoChange={onDNIBackPhotoChange}
          onExtractionChange={onDNIBackExtractionChange}
        />

        {/* Property docs */}
        <SectionLabel label="Documentos del inmueble" />

        <DocUpload
          label="IBI o Escritura"
          subtitle="Recibo del Impuesto de Bienes Inmuebles o escritura"
          icon={<FileText className="w-4 h-4 text-eltex-blue" />}
          data={{ photo: ibi.photo, extraction: ibi.extraction }}
          documentType="ibi"
          error={errors['ibi.photo']}
          exampleNote="Foto del recibo IBI o primeras páginas de la escritura. La Referencia Catastral (20 caracteres alfanuméricos) debe ser legible."
          onPhotoChange={onIBIPhotoChange}
          onExtractionChange={onIBIExtractionChange}
        />

        <DocUpload
          label="Factura de electricidad"
          subtitle="Última factura de luz del inmueble"
          icon={<Zap className="w-4 h-4 text-eltex-blue" />}
          data={{ photo: electricityBill.photo, extraction: electricityBill.extraction }}
          documentType="electricity"
          error={errors['electricity.photo']}
          exampleNote="Foto de la factura de luz donde se vean el CUPS (empieza por 'ES'), la potencia contratada en kW, y el tipo de instalación (monofásica/trifásica)."
          onPhotoChange={onElectricityPhotoChange}
          onExtractionChange={onElectricityExtractionChange}
        />

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          <strong>¿No tienes algún documento ahora?</strong> Puedes continuar y añadirlo más tarde usando el mismo enlace.
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onBack} className="btn-secondary flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          <button type="button" onClick={onContinue} className="btn-primary flex items-center justify-center gap-2">
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
