import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useProject } from '@/hooks/useProject';
import { useFormState } from '@/hooks/useFormState';
import { useFormPersistence, generateShareableUrl } from '@/hooks/useFormPersistence';
import { WelcomeSection } from '@/sections/WelcomeSection';
import { LocationSection } from '@/sections/LocationSection';
import { PersonalDataSection } from '@/sections/PersonalDataSection';
import { OwnerSection } from '@/sections/OwnerSection';
import { DNISection } from '@/sections/DNISection';
import { BillSection } from '@/sections/BillSection';
import { IBISection } from '@/sections/IBISection';
import { IBANSection } from '@/sections/IBANSection';
import { IVACertificateSection } from '@/sections/IVACertificateSection';
import { AuthSection } from '@/sections/AuthSection';
import { ReviewSection } from '@/sections/ReviewSection';
import { SuccessSection } from '@/sections/SuccessSection';
import { ErrorSection } from '@/sections/ErrorSection';
import { LoadingSection } from '@/sections/LoadingSection';
import type { Section } from '@/types';
import './App.css';

function App() {
  // URL Parameters
  const { projectCode, source } = useUrlParams();

  // Project Data
  const { project, loading, error } = useProject(projectCode);

  // Form State
  const {
    formData,
    errors,
    updateField,
    updateOwnerField,
    updateCompanyField,
    updatePersonalField,
    setFile,
    setVATSignature,
    setAuthSignature,
    validateLocation,
    validatePersonal,
    validateOwner,
    validateDNI,
    validateBill,
    validateIBAN,
    validateVAT,
    validateAuth,
    getProgress
  } = useFormState();

  // Navigation State
  const [currentSection, setCurrentSection] = useState<Section>('welcome');

  // Form Persistence
  useFormPersistence(formData, currentSection, (data: any) => {
    // Restore form data when persistence hook finds data
    updateField('location', data.location);
    updateField('isCompany', data.isCompany);
    updateField('companyData', data.companyData);
    updateField('personalData', data.personalData);
    updateField('isOwner', data.isOwner);
    updateField('ownerData', data.ownerData);
    updateField('dniFront', data.dniFront);
    updateField('dniBack', data.dniBack);
    updateField('bill', data.bill);
    updateField('ibi', data.ibi);
    updateField('iban', data.iban);
    updateField('vatSignature', data.vatSignature);
    updateField('authSignature', data.authSignature);
    if (data.currentSection) {
      setCurrentSection(data.currentSection as Section);
    }
  });

  // Listen for form section restore event
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail) {
        setCurrentSection(e.detail as Section);
      }
    };
    window.addEventListener('formSectionRestore', handler as EventListener);
    return () => {
      window.removeEventListener('formSectionRestore', handler as EventListener);
    };
  }, []);

  // Handle section navigation
  const goToSection = (section: Section) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentSection(section);
  };

  // Handle welcome section continue
  const handleWelcomeContinue = () => {
    goToSection('location');
  };

  // Handle location section continue
  const handleLocationContinue = () => {
    if (validateLocation()) {
      goToSection('personal');
    }
  };

  // Handle personal section continue
  const handlePersonalContinue = () => {
    if (validatePersonal()) {
      goToSection('owner');
    }
  };

  // Handle owner section continue
  const handleOwnerContinue = () => {
    if (validateOwner()) {
      goToSection('dni');
    }
  };

  // Handle DNI section continue
  const handleDNIContinue = () => {
    if (validateDNI()) {
      goToSection('bill');
    }
  };

  // Handle bill section continue
  const handleBillContinue = () => {
    if (validateBill()) {
      goToSection('ibi');
    }
  };

  // Handle bill skip
  const handleBillSkip = () => {
    goToSection('ibi');
  };

  // Handle IBI section continue
  const handleIBIContinue = () => {
    goToSection('iban');
  };

  // Handle IBAN section continue
  const handleIBANContinue = () => {
    if (validateIBAN()) {
      goToSection('vat');
    }
  };

  // Handle VAT section continue
  const handleVATContinue = () => {
    if (validateVAT()) {
      goToSection('auth');
    }
  };

  // Handle auth section continue
  const handleAuthContinue = () => {
    if (validateAuth()) {
      goToSection('review');
    }
  };

  // Handle edit from review
  const handleEdit = (section: string) => {
    const sectionMap: Record<string, Section> = {
      'location': 'location',
      'personal': 'personal',
      'owner': 'owner',
      'dni': 'dni',
      'bill': 'bill',
      'ibi': 'ibi',
      'iban': 'iban',
      'vat': 'vat',
      'auth': 'auth'
    };
    goToSection(sectionMap[section] || 'welcome');
  };

  // Generate shareable link
  const handleShareLink = () => {
    const shareableUrl = generateShareableUrl(formData, currentSection);
    navigator.clipboard.writeText(shareableUrl).then(() => {
      toast.success('Enlace copiado', {
        description: 'Puedes compartir este enlace para continuar más tarde',
      });
    }).catch(() => {
      toast.error('Error al copiar enlace');
    });
  };

  // Handle submission success
  const handleSuccess = () => {
    goToSection('success');
    toast.success('Documentación enviada correctamente', {
      description: 'Te hemos enviado un WhatsApp de confirmación.',
      duration: 5000,
    });
  };

  // Render current section
  const renderSection = () => {
    if (loading) return <LoadingSection />;
    if (error || !project) return <ErrorSection error={error || 'UNKNOWN_ERROR'} />;

    switch (currentSection) {
      case 'welcome':
        return (
          <WelcomeSection
            project={project}
            onContinue={handleWelcomeContinue}
          />
        );

      case 'location':
        return (
          <LocationSection
            location={formData.location}
            isCompany={formData.isCompany}
            onLocationChange={(loc) => updateField('location', loc)}
            onCompanyToggle={(isComp) => updateField('isCompany', isComp)}
            companyName={formData.companyData.name}
            companyNIF={formData.companyData.nif}
            companyAddress={formData.companyData.address}
            companyCity={formData.companyData.city}
            companyPostal={formData.companyData.postalCode}
            onCompanyFieldChange={(field, value) => updateCompanyField(field as any, value)}
            onContinue={handleLocationContinue}
            errors={{
              'companyData.name': errors['companyData.name'],
              'companyData.nif': errors['companyData.nif'],
              'companyData.address': errors['companyData.address'],
              'companyData.city': errors['companyData.city'],
              'companyData.postalCode': errors['companyData.postalCode'],
            }}
          />
        );

      case 'personal':
        return (
          <PersonalDataSection
            personalData={formData.personalData}
            errors={{
              'personalData.fullName': errors['personalData.fullName'],
              'personalData.dni': errors['personalData.dni'],
              'personalData.address': errors['personalData.address'],
              'personalData.postalCode': errors['personalData.postalCode'],
              'personalData.city': errors['personalData.city'],
              'personalData.province': errors['personalData.province'],
              'personalData.phone': errors['personalData.phone'],
              'personalData.email': errors['personalData.email'],
            }}
            onFieldChange={(field, value) => updatePersonalField(field, value)}
            onBack={() => goToSection('location')}
            onContinue={handlePersonalContinue}
          />
        );

      case 'owner':
        return (
          <OwnerSection
            formData={formData}
            errors={errors}
            updateField={updateField}
            updateOwnerField={updateOwnerField}
            onBack={() => goToSection('personal')}
            onContinue={handleOwnerContinue}
          />
        );

      case 'dni':
        return (
          <DNISection
            dniFront={formData.dniFront}
            dniBack={formData.dniBack}
            errors={errors}
            setFile={setFile}
            onBack={() => goToSection('owner')}
            onContinue={handleDNIContinue}
          />
        );

      case 'bill':
        return (
          <BillSection
            bill={formData.bill}
            errors={errors}
            setFile={(file) => setFile('bill', file)}
            onBack={() => goToSection('dni')}
            onContinue={handleBillContinue}
            onSkip={handleBillSkip}
          />
        );

      case 'ibi':
        return (
          <IBISection
            ibi={formData.ibi}
            setFile={(file) => setFile('ibi', file)}
            onBack={() => goToSection('bill')}
            onContinue={handleIBIContinue}
          />
        );

      case 'iban':
        return (
          <IBANSection
            iban={formData.iban}
            error={errors.iban}
            updateIBAN={(value) => updateField('iban', value)}
            onBack={() => goToSection('ibi')}
            onContinue={handleIBANContinue}
          />
        );

      case 'vat':
        return (
          <IVACertificateSection
            personalData={formData.personalData}
            vatSignature={formData.vatSignature}
            errors={{
              vatSignature: errors.vatSignature,
            }}
            onSignature={setVATSignature}
            onBack={() => goToSection('iban')}
            onContinue={handleVATContinue}
          />
        );

      case 'auth':
        return (
          <AuthSection
            project={project}
            formData={formData}
            errors={errors}
            setSignature={setAuthSignature}
            onBack={() => goToSection('vat')}
            onContinue={handleAuthContinue}
          />
        );

      case 'review':
        return (
          <ReviewSection
            project={project}
            formData={formData}
            source={source}
            onEdit={handleEdit}
            onSuccess={handleSuccess}
          />
        );

      case 'success':
        return <SuccessSection project={project} />;

      default:
        return <ErrorSection error="UNKNOWN_ERROR" />;
    }
  };

  return (
    <div className="min-h-screen bg-eltex-lavender">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#3B46FF',
            color: '#fff',
            border: 'none',
          },
        }}
      />

      {/* Main content */}
      <main className="relative">
        {renderSection()}
      </main>

      {/* Progress Footer - only show on form sections */}
      {!loading && !error && project &&
       currentSection !== 'welcome' &&
       currentSection !== 'success' &&
       currentSection !== 'review' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-50">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <img
                src="/eltex-logo.png"
                alt="Eltex"
                className="h-6 object-contain"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShareLink}
                  className="text-sm text-eltex-blue hover:text-eltex-blue-dark font-medium"
                  title="Copiar enlace para continuar más tarde"
                >
                  Guardar progreso
                </button>
                <span className="text-sm font-medium text-eltex-blue">
                  {getProgress()}%
                </span>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
