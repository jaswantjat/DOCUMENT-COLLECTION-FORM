import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Camera, Check, RefreshCw, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import type { UploadedFile, FormErrors } from '@/types';

interface DNISectionProps {
  dniFront: UploadedFile | null;
  dniBack: UploadedFile | null;
  errors: FormErrors;
  setFile: (field: 'dniFront' | 'dniBack', file: UploadedFile | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface UploadBoxProps {
  label: string;
  sublabel: string;
  file: UploadedFile | null;
  onFileSelect: (file: UploadedFile | null) => void;
  error?: string;
  isBack?: boolean;
}

const UploadBox = ({ label, sublabel, file, onFileSelect, error, isBack }: UploadBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      onFileSelect(uploadedFile);
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

  const isImage = file?.file.type.startsWith('image/');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 required">
        {label}
      </label>
      <p className="text-sm text-gray-500">{sublabel}</p>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`upload-zone p-8 flex flex-col items-center justify-center text-center transition-all ${
            isDragging ? 'dragging' : ''
          } ${error ? 'border-eltex-error bg-eltex-error/5' : ''}`}
        >
          <div className="w-16 h-16 bg-eltex-blue/10 rounded-full flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-eltex-blue" />
          </div>
          <p className="text-gray-900 font-medium mb-1">
            {isBack ? 'Ahora la parte de atrás' : 'Toca para hacer foto'}
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
            capture="environment"
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
              <img src={file.preview} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <FileText className="w-16 h-16 mb-2" />
                <span className="text-sm">{file.file.name}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <button
              onClick={() => onFileSelect(null)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Repetir
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-eltex-error text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export const DNISection = ({ dniFront, dniBack, errors, setFile, onBack, onContinue }: DNISectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dni-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const canContinue = () => dniFront && dniBack;

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12 pb-32">
      <div className="dni-card w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 4 de 9</span>
            <span className="text-eltex-blue font-medium">DNI</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '44%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tu documento de identidad
            </h1>
            <p className="text-gray-500">
              Sube fotos claras de tu DNI por ambas caras
            </p>
          </div>

          {/* Upload Boxes */}
          <div className="space-y-6">
            <UploadBox
              label="DNI - Foto frontal"
              sublabel="Asegúrate de que se vean bien los 4 bordes"
              file={dniFront}
              onFileSelect={(file) => setFile('dniFront', file)}
              error={errors.dniFront}
            />

            <UploadBox
              label="DNI - Foto trasera"
              sublabel="Ahora la parte de atrás"
              file={dniBack}
              onFileSelect={(file) => setFile('dniBack', file)}
              error={errors.dniBack}
              isBack
            />
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-eltex-lavender rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>Consejo:</strong> Busca una zona con buena luz y evita reflejos. El texto debe ser legible.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button onClick={onBack} className="btn-secondary flex-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onContinue}
              disabled={!canContinue()}
              className="btn-primary flex-1"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
