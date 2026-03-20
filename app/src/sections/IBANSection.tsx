import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CreditCard, Check, AlertCircle, Lock, Shield, ArrowLeft } from 'lucide-react';
import { formatIBAN, validateIBAN } from '@/services/backOffice';

interface IBANSectionProps {
  iban: string;
  error?: string;
  updateIBAN: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const IBANSection = ({ iban, error, updateIBAN, onBack, onContinue }: IBANSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.iban-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const clean = iban.replace(/\s/g, '');
    setIsValid(validateIBAN(clean));
    setDisplayValue(formatIBAN(iban));
  }, [iban]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9\s]/g, '');
    const cleanValue = value.replace(/\s/g, '');
    
    if (cleanValue.length <= 24) {
      updateIBAN(cleanValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanPasted = pastedText.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleanPasted.length <= 24) {
      updateIBAN(cleanPasted);
    }
  };

  return (
    <div ref={sectionRef} className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="iban-card w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Paso 5 de 6</span>
            <span className="text-eltex-blue font-medium">IBAN</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '83%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="form-card p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cuenta bancaria
            </h1>
            <p className="text-gray-500">
              Introduce tu IBAN para los pagos del proyecto
            </p>
          </div>

          {/* Security Badge */}
          <div className="bg-eltex-lavender rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-eltex-blue/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-eltex-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Tus datos están seguros</p>
                <p className="text-xs text-gray-500">Encriptación bancaria de nivel militar</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 required">
              IBAN (número de cuenta)
            </label>

            <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''}`}>
              <div className={`relative rounded-xl border-2 transition-all overflow-hidden ${
                error
                  ? 'border-eltex-error bg-eltex-error/5'
                  : isValid
                  ? 'border-eltex-success bg-eltex-success/5'
                  : isFocused
                  ? 'border-eltex-blue ring-4 ring-eltex-blue/10'
                  : 'border-gray-200'
              }`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <CreditCard className={`w-6 h-6 transition-colors ${
                    isValid ? 'text-eltex-success' : isFocused ? 'text-eltex-blue' : 'text-gray-400'
                  }`} />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={displayValue}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  maxLength={29}
                  className="w-full pl-14 pr-14 py-4 text-xl font-mono tracking-wider bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isValid ? (
                    <div className="w-8 h-8 bg-eltex-success rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  ) : iban.length > 0 ? (
                    <div className="w-8 h-8 bg-eltex-error/10 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-eltex-error" />
                    </div>
                  ) : (
                    <Lock className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className={`text-sm transition-colors ${error ? 'text-eltex-error' : 'text-gray-500'}`}>
                {error || 'Formato: ES00 0000 0000 0000 0000 0000'}
              </p>
              <p className="text-sm text-gray-400">
                {iban.replace(/\s/g, '').length}/24
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex gap-3 mt-8">
            <button onClick={onBack} className="btn-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onContinue}
              disabled={!isValid}
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
