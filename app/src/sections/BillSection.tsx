import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Camera, Upload, Check, RefreshCw, FileText, AlertCircle, Zap, ArrowLeft } from 'lucide-react';
import type { UploadedFile, FormErrors } from '@/types';

interface BillSectionProps {
  bill: UploadedFile | null;
  errors: FormErrors;
  setFile: (file: UploadedFile | null) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}

export const BillSection = ({ bill, errors, setFile, onBack, onContinue, onSkip }: BillSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bill-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const uploadedFile: UploadedFile = {
        file: selectedFile,
        preview: e.target?.result as string,
        timestamp: Date.now()
      };
      setFile(uploadedFile);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const isImage = bill?.file.type.startsWith('image/');

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="bill-card w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 3 de 6</span>
            <span className="text-eltex-blue font-medium">Factura</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '50%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Factura de la luz
            </h1>
            <p className="text-gray-500">
              Necesitamos ver tu CUPS para tramitar la legalización
            </p>
          </div>

          {/* CUPS Info */}
          <div className="bg-eltex-lavender rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-eltex-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-eltex-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">¿Qué es el CUPS?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Es el número que identifica tu punto de suministro eléctrico. Aparece en la parte superior de tu factura.
                </p>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 required">
              Factura de electricidad
            </label>
            <p className="text-sm text-gray-500">
              Puedes hacer una foto del papel o subir el PDF que recibes por email
            </p>

            {!bill ? (
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`upload-zone p-8 flex flex-col items-center justify-center text-center transition-all ${
                  isDragging ? 'dragging' : ''
                } ${errors.bill ? 'border-eltex-error bg-eltex-error/5' : ''}`}
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 bg-eltex-blue/10 rounded-full flex items-center justify-center">
                    <Camera className="w-7 h-7 text-eltex-blue" />
                  </div>
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-7 h-7 text-gray-500" />
                  </div>
                </div>
                <p className="text-gray-900 font-medium mb-1">
                  Toca para subir tu factura
                </p>
                <p className="text-sm text-gray-500">
                  O arrastra un archivo aquí
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG o PDF · Máx. 10MB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border-2 border-eltex-success">
                <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-eltex-success rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>

                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {isImage ? (
                    <img src={bill.preview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <FileText className="w-16 h-16 mb-2" />
                      <span className="text-sm">{bill.file.name}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => setFile(null)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Cambiar
                  </button>
                </div>
              </div>
            )}

            {errors.bill && (
              <div className="flex items-center gap-2 text-eltex-error text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.bill}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button onClick={onBack} className="btn-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onContinue}
              disabled={!bill}
              className="btn-primary flex-1"
            >
              Continuar
            </button>
          </div>
          <button
            onClick={onSkip}
            className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            No tengo la factura ahora · Añadir después
          </button>
        </div>
      </div>
    </div>
  );
};
