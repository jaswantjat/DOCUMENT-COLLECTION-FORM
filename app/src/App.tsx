import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useProject } from '@/hooks/useProject';
import { useFormState, getFormItems } from '@/hooks/useFormState';
import { WelcomeSection } from '@/sections/WelcomeSection';
import { IdentitySection } from '@/sections/IdentitySection';
import { PropertyDocsSection } from '@/sections/PropertyDocsSection';
import { PropertyPhotosSection } from '@/sections/PropertyPhotosSection';
import { SignaturesSection } from '@/sections/SignaturesSection';
import { ReviewSection } from '@/sections/ReviewSection';
import { SuccessSection } from '@/sections/SuccessSection';
import { ErrorSection } from '@/sections/ErrorSection';
import { LoadingSection } from '@/sections/LoadingSection';
import type { Section } from '@/types';
import './App.css';

function App() {
  const { projectCode, source } = useUrlParams();
  const { project, loading, error } = useProject(projectCode);
  const {
    formData,
    errors,
    updateIdentity,
    setIBIPhoto,
    setIBIExtraction,
    setElectricityPhoto,
    setElectricityExtraction,
    setElectricalPanelPhotos,
    updateInstallationSpace,
    updateRoof,
    updateRadiators,
    setCustomerSignature,
    setRepSignature,
    validateIdentity,
    validatePropertyDocs,
    validateSignatures,
    getProgress,
    canSubmit,
    setErrors,
  } = useFormState(projectCode, project?.productType ?? 'solar');

  const [currentSection, setCurrentSection] = useState<Section>('welcome');
  const [submitted, setSubmitted] = useState(false);

  const goTo = (section: Section) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentSection(section);
  };

  const handleWelcomeContinue = () => goTo('identity');

  const handleIdentityContinue = () => {
    if (validateIdentity()) goTo('property-docs');
  };

  const handlePropertyDocsContinue = () => {
    if (validatePropertyDocs()) goTo('property-photos');
  };

  const handlePropertyPhotosContinue = () => {
    goTo('signatures');
  };

  const handleSignaturesContinue = () => {
    if (validateSignatures()) goTo('review');
  };

  const handleSuccess = () => {
    setSubmitted(true);
    goTo('success');
    toast.success('Documentación enviada correctamente', {
      description: 'Te hemos enviado un WhatsApp de confirmación.',
      duration: 5000,
    });
  };

  const renderSection = () => {
    if (loading) return <LoadingSection />;
    if (error || !project) return <ErrorSection error={error || 'UNKNOWN_ERROR'} />;

    switch (currentSection) {
      case 'welcome':
        return (
          <WelcomeSection
            project={project}
            completedCount={getProgress().completed}
            totalCount={getProgress().total}
            onContinue={handleWelcomeContinue}
          />
        );

      case 'identity':
        return (
          <IdentitySection
            identity={formData.identity}
            errors={errors}
            onChange={updateIdentity}
            onBack={() => goTo('welcome')}
            onContinue={handleIdentityContinue}
          />
        );

      case 'property-docs':
        return (
          <PropertyDocsSection
            ibi={formData.ibi}
            electricityBill={formData.electricityBill}
            errors={errors}
            onIBIPhotoChange={setIBIPhoto}
            onIBIExtractionChange={setIBIExtraction}
            onElectricityPhotoChange={setElectricityPhoto}
            onElectricityExtractionChange={setElectricityExtraction}
            onBack={() => goTo('identity')}
            onContinue={handlePropertyDocsContinue}
          />
        );

      case 'property-photos':
        return (
          <PropertyPhotosSection
            productType={project.productType}
            formData={formData}
            errors={errors}
            setElectricalPanelPhotos={setElectricalPanelPhotos}
            updateInstallationSpace={updateInstallationSpace}
            updateRoof={updateRoof}
            updateRadiators={updateRadiators}
            onBack={() => goTo('property-docs')}
            onContinue={handlePropertyPhotosContinue}
          />
        );

      case 'signatures':
        return (
          <SignaturesSection
            project={project}
            formData={formData}
            errors={errors}
            onCustomerSignature={setCustomerSignature}
            onRepSignature={setRepSignature}
            onBack={() => goTo('property-photos')}
            onContinue={handleSignaturesContinue}
          />
        );

      case 'review':
        return (
          <ReviewSection
            project={project}
            formData={formData}
            source={source}
            canSubmit={canSubmit()}
            onEdit={(section) => goTo(section as Section)}
            onSuccess={handleSuccess}
          />
        );

      case 'success':
        return <SuccessSection project={project} />;

      default:
        return <ErrorSection error="UNKNOWN_ERROR" />;
    }
  };

  const progress = project ? getProgress() : null;
  const showFooter =
    !loading && !error && project &&
    currentSection !== 'welcome' &&
    currentSection !== 'success' &&
    currentSection !== 'review';

  return (
    <div className="min-h-screen bg-eltex-lavender">
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

      <main className="relative">
        {renderSection()}
      </main>

      {showFooter && progress && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-50">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <img src="/eltex-logo.png" alt="Eltex" className="h-6 object-contain" />
              <span className="text-sm font-medium text-eltex-blue">
                {progress.completed} / {progress.total} completados
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
