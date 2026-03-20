import { useState, useCallback } from 'react';
import { ArrowRight, ArrowLeft, FileText, Zap, CheckCircle, AlertTriangle, Edit2, RotateCcw, Info } from 'lucide-react';
import type { IBIData, ElectricityBillData, UploadedPhoto, AIExtraction, FormErrors } from '@/types';
import { validatePhoto, createUploadedPhoto, fileToPreview, fileToBase64 } from '@/lib/photoValidation';
import { extractDocument } from '@/services/api';

interface Props {
  ibi: IBIData;
  electricityBill: ElectricityBillData;
  errors: FormErrors;
  onIBIPhotoChange: (photo: UploadedPhoto | null) => void;
  onIBIExtractionChange: (extraction: AIExtraction | null) => void;
  onElectricityPhotoChange: (photo: UploadedPhoto | null) => void;
  onElectricityExtractionChange: (extraction: AIExtraction | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

type UploadState = 'idle' | 'validating' | 'extracting' | 'confirming' | 'done' | 'error' | 'wrong-doc';

interface DocUploadProps {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  data: { photo: UploadedPhoto | null; extraction: AIExtraction | null };
  documentType: 'ibi' | 'electricity';
  error?: string;
  exampleNote: string;
  onPhotoChange: (photo: UploadedPhoto | null) => void;
  onExtractionChange: (extraction: AIExtraction | null) => void;
}

function DocUpload({ label, subtitle, icon, data, documentType, error, exampleNote, onPhotoChange, onExtractionChange }: DocUploadProps) {
  const [state, setState] = useState<UploadState>(data.photo ? (data.extraction?.confirmedByUser ? 'done' : 'confirming') : 'idle');
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
    setStatusMsg('Comprobando calidad de imagen...');

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
    setStatusMsg('Analizando documento con IA...');

    try {
      const base64 = await fileToBase64(file);
      const res = await extractDocument(base64, documentType);

      if (res.isWrongDocument) {
        setState('wrong-doc');
        setWrongDocMsg(res.message || 'Documento incorrecto');
        return;
      }

      if (!res.extraction) {
        // No extraction but not wrong doc — mark needs manual review and confirm immediately
        onExtractionChange({
          extractedData: {},
          confidence: 0,
          isCorrectDocument: true,
          documentTypeDetected: documentType,
          needsManualReview: true,
          confirmedByUser: true,
        });
        setState('done');
        setStatusMsg(res.message || 'Se marcará para revisión manual.');
        return;
      }

      onExtractionChange({ ...res.extraction, confirmedByUser: false });
      setState('confirming');
    } catch {
      // AI failed — allow continuation with manual review flag
      onExtractionChange({
        extractedData: {},
        confidence: 0,
        isCorrectDocument: true,
        documentTypeDetected: documentType,
        needsManualReview: true,
        confirmedByUser: true,
      });
      setState('done');
      setStatusMsg('Análisis automático no disponible. Se revisará manualmente.');
    }
  }, [documentType, onPhotoChange, onExtractionChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const confirmExtraction = () => {
    if (!data.extraction) return;
    const updated = { ...data.extraction, confirmedByUser: true, manualCorrections: editValues };
    onExtractionChange(updated);
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

  const ibiFields = [
    { key: 'referenciaCatastral', label: 'Referencia Catastral' },
    { key: 'titular', label: 'Titular' },
    { key: 'direccion', label: 'Dirección del inmueble' },
  ];

  const electricityFields = [
    { key: 'cups', label: 'CUPS' },
    { key: 'potenciaContratada', label: 'Potencia contratada (kW)' },
    { key: 'tipoFase', label: 'Tipo de instalación' },
  ];

  const fields = documentType === 'ibi' ? ibiFields : electricityFields;

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
          <div className="flex items-center gap-1 text-xs font-medium text-eltex-success bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Listo
          </div>
        )}
      </div>

      {/* Example note */}
      <button type="button" onClick={() => setShowExample(v => !v)}
        className="flex items-center gap-1.5 text-xs text-eltex-blue hover:underline">
        <Info className="w-3.5 h-3.5" /> {showExample ? 'Ocultar' : '¿Qué foto necesito?'}
      </button>
      {showExample && (
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-100">
          {exampleNote}
        </div>
      )}

      {/* IDLE — upload zone */}
      {(state === 'idle' || state === 'wrong-doc') && (
        <label className="upload-zone p-6 text-center block cursor-pointer">
          <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleInput} />
          <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Arrastra o <span className="text-eltex-blue font-medium">pulsa para subir</span></p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Mín. 1MB · Mín. 1200×900px</p>
        </label>
      )}

      {/* VALIDATING / EXTRACTING */}
      {(state === 'validating' || state === 'extracting') && (
        <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-eltex-blue border-t-transparent rounded-full animate-spin shrink-0" />
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

      {/* VALIDATION ERROR */}
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

      {/* Photo preview (shown after upload, all states after idle) */}
      {data.photo && state !== 'idle' && (
        <div className="flex gap-3 items-start">
          <img src={data.photo.preview} alt="Document" className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0" />
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700">{data.photo.file?.name || 'Foto subida'}</p>
            <p>{(data.photo.sizeBytes / 1024 / 1024).toFixed(1)} MB{data.photo.width ? ` · ${data.photo.width}×${data.photo.height}px` : ''}</p>
          </div>
        </div>
      )}

      {/* CONFIRMING — show extracted data */}
      {state === 'confirming' && data.extraction && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CheckCircle className="w-4 h-4 text-eltex-success" />
            Datos extraídos — confirma que son correctos
          </div>

          {data.extraction.needsManualReview && (
            <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg text-xs text-orange-700 border border-orange-100">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Confianza baja. Revisa los campos manualmente.
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
                    <button type="button" onClick={() => {
                      setEditingField(isEditing ? null : key);
                      setEditValues(v => ({ ...v, [key]: displayVal }));
                    }} className="text-xs text-eltex-blue flex items-center gap-1 hover:underline">
                      <Edit2 className="w-3 h-3" />{isEditing ? 'Cerrar' : 'Corregir'}
                    </button>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValues[key] ?? displayVal}
                      onChange={e => setEditValues(v => ({ ...v, [key]: e.target.value }))}
                      className="form-input text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className={`text-sm font-medium ${raw ? 'text-gray-900' : 'text-gray-400'}`}>
                      {displayVal || <em>No detectado</em>}
                    </p>
                  )}
                  {warning && (
                    <p className="text-xs text-orange-600 mt-1">{warning}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={retake} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5">
              <RotateCcw className="w-3.5 h-3.5" /> Repetir foto
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
              <AlertTriangle className="w-3 h-3" /> Marcado para revisión manual en oficina
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

export function PropertyDocsSection({ ibi, electricityBill, errors, onIBIPhotoChange, onIBIExtractionChange, onElectricityPhotoChange, onElectricityExtractionChange, onBack, onContinue }: Props) {
  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-lg mx-auto space-y-4">

        <div className="form-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-eltex-blue-light flex items-center justify-center">
              <FileText className="w-4 h-4 text-eltex-blue" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Documentación del inmueble</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">La IA extrae los datos automáticamente para que solo tengas que confirmarlos.</p>
        </div>

        <DocUpload
          label="IBI o Escritura"
          subtitle="Recibo del Impuesto de Bienes Inmuebles o escritura de la propiedad"
          icon={<FileText className="w-4 h-4 text-eltex-blue" />}
          data={ibi}
          documentType="ibi"
          error={errors['ibi.photo']}
          exampleNote="Sube una foto clara del recibo IBI o de las primeras páginas de la escritura. Asegúrate de que la Referencia Catastral (código alfanumérico de 20 caracteres) sea legible. Buen contraste y sin reflejos."
          onPhotoChange={onIBIPhotoChange}
          onExtractionChange={onIBIExtractionChange}
        />

        <DocUpload
          label="Factura de electricidad"
          subtitle="Última factura de luz del inmueble"
          icon={<Zap className="w-4 h-4 text-eltex-blue" />}
          data={electricityBill}
          documentType="electricity"
          error={errors['electricity.photo']}
          exampleNote="Sube una foto de la factura de luz donde se vean claramente: el CUPS (código que empieza por 'ES', 20-22 caracteres), la potencia contratada en kW, y si la instalación es monofásica o trifásica. Si no tienes la factura ahora, puedes subir esta parte más tarde."
          onPhotoChange={onElectricityPhotoChange}
          onExtractionChange={onElectricityExtractionChange}
        />

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          <strong>¿No tienes la factura ahora?</strong> Puedes continuar y añadirla más tarde usando el mismo enlace. La factura de luz es obligatoria para completar el expediente.
        </div>

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
