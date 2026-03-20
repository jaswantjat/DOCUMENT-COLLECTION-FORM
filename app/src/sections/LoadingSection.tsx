import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const LoadingSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.loading-logo', {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      gsap.to('.loading-bar', {
        width: '100%',
        duration: 2,
        repeat: -1,
        ease: 'power1.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-eltex-lavender"
    >
      {/* Logo */}
      <div className="loading-logo mb-8">
        <img 
          src="/eltex-logo.png" 
          alt="Eltex" 
          className="h-12 object-contain"
        />
      </div>

      {/* Loading Text */}
      <p className="text-gray-500 mb-8">
        Cargando documentos...
      </p>

      {/* Progress Bar */}
      <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="loading-bar h-full bg-eltex-blue rounded-full" style={{ width: '0%' }} />
      </div>
    </div>
  );
};
