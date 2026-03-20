import { useRef, useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, PenLine, RotateCcw, CheckCircle } from 'lucide-react';
import type { FormData, ProjectData, FormErrors } from '@/types';

interface Props {
  project: ProjectData;
  formData: FormData;
  errors: FormErrors;
  onCustomerSignature: (sig: string | null) => void;
  onRepSignature: (sig: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

// ─── Signature Pad ────────────────────────────────────────────────────────────

interface SignaturePadProps {
  label: string;
  subtitle: string;
  value: string | null;
  error?: string;
  onChange: (sig: string | null) => void;
}

function SignaturePad({ label, subtitle, value, error, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If we have a value, restore it
    if (value && !hasSignature) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e, canvas);
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
    }
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  return (
    <div className="form-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-eltex-blue-light flex items-center justify-center shrink-0">
            <PenLine className="w-4 h-4 text-eltex-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {hasSignature && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Firmado
          </div>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-40 cursor-crosshair"
          style={{ touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Firma aquí</p>
          </div>
        )}
      </div>

      {hasSignature && (
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1.5 text-xs text-eltex-blue hover:underline"
        >
          <RotateCcw className="w-3 h-3" /> Borrar firma
        </button>
      )}

      {error && (
        <p className="text-xs text-eltex-error">{error}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SignaturesSection({
  project,
  formData,
  errors,
  onCustomerSignature,
  onRepSignature,
  onBack,
  onContinue,
}: Props) {
  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="form-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-eltex-blue-light flex items-center justify-center">
              <PenLine className="w-4 h-4 text-eltex-blue" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Firmas</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Se requieren dos firmas para completar la documentación del proyecto.
          </p>
        </div>

        {/* Legal text */}
        <div className="form-card p-5">
          <p className="text-xs text-gray-600 leading-relaxed">
            En <strong>{today}</strong>, yo, <strong>{formData.identity.fullName || 'el/la titular'}</strong>,
            con DNI/NIE <strong>{formData.identity.dni || '—'}</strong>, domiciliado/a en{' '}
            <strong>{formData.identity.street ? `${formData.identity.street} ${formData.identity.number}, ${formData.identity.municipality}` : 'la dirección indicada'}</strong>,
            autorizo a Eltex a tramitar el expediente de instalación (Ref. <strong>{project.code}</strong>) y
            declaro que los documentos aportados son verídicos y están en vigor.
          </p>
        </div>

        {/* Customer signature */}
        <SignaturePad
          label="Firma del cliente"
          subtitle={`${formData.identity.fullName || 'Titular del proyecto'}`}
          value={formData.signatures.customerSignature}
          error={errors['signatures.customer']}
          onChange={onCustomerSignature}
        />

        {/* Rep signature */}
        <SignaturePad
          label="Firma del comercial"
          subtitle={`${project.assessor} · Asesor Eltex`}
          value={formData.signatures.repSignature}
          error={errors['signatures.rep']}
          onChange={onRepSignature}
        />

        {/* Privacy notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          Sus datos serán tratados conforme al RGPD (UE) 2016/679 y la LOPDGDD. El responsable del
          tratamiento es Eltex. Puede ejercer sus derechos de acceso, rectificación, supresión y
          portabilidad escribiendo a privacidad@eltex.es.
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
