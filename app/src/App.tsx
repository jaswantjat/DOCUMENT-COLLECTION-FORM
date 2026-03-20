import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { useFormState, getFormItems } from '@/hooks/useFormState';
import { WelcomeSection } from '@/sections/WelcomeSection';
import { PhoneSection } from '@/sections/PhoneSection';
import { PropertyDocsSection } from '@/sections/PropertyDocsSection';
import { PropertyPhotosSection } from '@/sections/PropertyPhotosSection';
import { SignaturesSection } from '@/sections/SignaturesSection';
import { ReviewSection } from '@/sections/ReviewSection';
import { SuccessSection } from '@/sections/SuccessSection';
import { ErrorSection } from '@/sections/ErrorSection';
import { LoadingSection } from '@/sections/LoadingSection';
import { Dashboard } from '@/pages/Dashboard';
import type { Section, ProjectData } from '@/types';
import './App.css';

// ── Form App (inner, has access to router hooks) ─────────────────────────────
function FormApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlCode = searchParams.get('code') || searchParams.get('project');
  const urlSource = searchParams.get('source') as 'assessor' | null;

  const [projectCode, setProjectCode] = useState<string | null>(urlCode);
  const [source] = useState<'customer' | 'assessor'>(urlSource === 'assessor' ? 'assessor' : 'customer');

  const { project, loading, error, setProject } = useProject(projectCode);

  const {
    formData, errors,
    setPhone,
    setDNIFrontPhoto, setDNIFrontExtraction,
    setDNIBackPhoto, setDNIBackExtraction,
    setIBIPhoto, setIBIExtraction,
    setElectricityPhoto, setElectricityExtraction,
    setElectricalPanelPhotos,
    updateInstallationSpace, updateRoof, updateRadiators,
    setCustomerSignature, setRepSignature,
    validatePhone, validatePropertyDocs, validateSignatures,
    getProgress, canSubmit, setErrors,
  } = useFormState(projectCode, project?.productType ?? 'solar');

  const [currentSection, setCurrentSection] = useState<Section>('welcome');

  // If no code in URL, skip welcome and go to phone entry
  useEffect(() => {
    if (!urlCode) {
      setCurrentSection('phone');
    }
  }, [urlCode]);

  const goTo = (section: Section) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentSection(section);
  };

  // Called when phone lookup finds a project (no URL code case)
  const handlePhoneFound = (phone: string, foundProject?: ProjectData) => {
    setPhone(phone);
    if (foundProject) {
      setProject(foundProject);
      setProjectCode(foundProject.code);
      // Update URL with code so user can bookmark/return
      setSearchParams({ code: foundProject.code });
    }
  };

  const handleSuccess = () => {
    goTo('success');
  };

  const renderSection = () => {
    // Phone section doesn't need project loaded yet
    if (currentSection === 'phone') {
      return (
        <PhoneSection
          projectPhone={project?.phone}
          initialPhone={formData.phone}
          onPhoneConfirmed={handlePhoneFound}
          onContinue={() => goTo(project || urlCode ? 'welcome' : 'property-docs')}
        />
      );
    }

    if (loading) return <LoadingSection />;
    if (error || !project) return <ErrorSection error={error || 'INVALID_CODE'} />;

    switch (currentSection) {
      case 'welcome':
        return (
          <WelcomeSection
            project={project}
            completedCount={getProgress().completed}
            totalCount={getProgress().total}
            onContinue={() => goTo('property-docs')}
          />
        );

      case 'property-docs':
        return (
          <PropertyDocsSection
            dni={formData.dni}
            ibi={formData.ibi}
            electricityBill={formData.electricityBill}
            errors={errors}
            onDNIFrontPhotoChange={setDNIFrontPhoto}
            onDNIFrontExtractionChange={setDNIFrontExtraction}
            onDNIBackPhotoChange={setDNIBackPhoto}
            onDNIBackExtractionChange={setDNIBackExtraction}
            onIBIPhotoChange={setIBIPhoto}
            onIBIExtractionChange={setIBIExtraction}
            onElectricityPhotoChange={setElectricityPhoto}
            onElectricityExtractionChange={setElectricityExtraction}
            onBack={() => goTo(urlCode ? 'welcome' : 'phone')}
            onContinue={() => { if (validatePropertyDocs()) goTo('property-photos'); }}
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
            onContinue={() => goTo('signatures')}
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
            onContinue={() => { if (validateSignatures()) goTo('review'); }}
          />
        );

      case 'review':
        return (
          <ReviewSection
            project={project}
            formData={formData}
            source={source}
            canSubmit={canSubmit()}
            onEdit={(s) => goTo(s as Section)}
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
    currentSection !== 'phone' &&
    currentSection !== 'success' &&
    currentSection !== 'review';

  return (
    <div className="min-h-screen bg-eltex-lavender">
      <Toaster
        position="top-center"
        toastOptions={{ style: { background: '#3B46FF', color: '#fff', border: 'none' } }}
      />

      {/* Dashboard link (subtle, top right) */}
      <div className="fixed top-3 right-4 z-50">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-xs text-gray-400 hover:text-eltex-blue transition-colors bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200 shadow-sm"
        >
          Dashboard →
        </button>
      </div>

      <main>{renderSection()}</main>

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

// ── Root with Router ──────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormApp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
