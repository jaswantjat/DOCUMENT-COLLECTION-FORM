import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Camera, Upload, Check, RefreshCw, FileText, Home, ArrowRight, ArrowLeft } from 'lucide-react';
import type { UploadedFile } from '@/types';

interface IBISectionProps {
  ibi: UploadedFile | null;
  setFile: (file: UploadedFile | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const IBISection = ({ ibi, setFile, onBack, onContinue }: IBISectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ibi-card',
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

  const isImage = ibi?.file.type.startsWith('image/');

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="ibi-card w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 4 de 6</span>
            <span className="text-eltex-blue font-medium">IBI</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '66%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">
                OPCIONAL
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Recibo del IBI
            </h1>
            <p className="text-gray-500">
              Lo necesitaremos para tramitar tus bonificaciones fiscales
            </p>
          </div>

          {/* Info */}
          <div className="bg-eltex-lavender rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-eltex-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-eltex-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  El IBI (Impuesto de Bienes Inmuebles) es el recibo anual que recibes del ayuntamiento. 
                  Contiene la referencia catastral de tu vivienda.
                </p>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Recibo del IBI
            </label>
            <p className="text-sm text-gray-500">
              Puedes subirlo ahora o añadirlo más tarde
            </p>

            {!ibi ? (
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`upload-zone p-8 flex flex-col items-center justify-center text-center transition-all ${
                  isDragging ? 'dragging' : ''
                }`}
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <Camera className="w-7 h-7 text-gray-500" />
                  </div>
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-7 h-7 text-gray-500" />
                  </div>
                </div>
                <p className="text-gray-900 font-medium mb-1">
                  Toca para subir el IBI
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
                    <img src={ibi.preview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <FileText className="w-16 h-16 mb-2" />
                      <span className="text-sm">{ibi.file.name}</span>
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
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button onClick={onBack} className="btn-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onContinue}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <span>{ibi ? 'Continuar' : 'Omitir por ahora'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
