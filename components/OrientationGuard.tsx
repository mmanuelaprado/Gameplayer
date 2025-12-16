import React, { useEffect, useState } from 'react';

export const OrientationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Lógica segura para detectar orientação
      // Consideramos "Portrait" se a altura for maior que a largura
      // E se a largura for menor que 1024px (para não bloquear PCs com janelas estreitas)
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isVertical = height > width;
      const isMobileSize = width < 1024;

      if (isVertical && isMobileSize) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    };

    // Verifica inicial e no resize
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (isPortrait) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center text-white p-6 touch-none">
        {/* Ícone de Celular Girando (SVG Nativo para evitar erros de importação) */}
        <div className="mb-6 relative w-16 h-16">
            <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-sky-400 w-full h-full animate-bounce"
            >
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                <path d="M12 18h.01"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-1 bg-white/20 rotate-45 transform origin-center"></div>
            </div>
        </div>

        <h2 className="text-2xl font-bold font-sans text-center mb-2 text-sky-400">
            Gire seu Celular
        </h2>
        
        <p className="text-center text-slate-300 text-sm max-w-xs leading-relaxed">
            O Neon City foi feito para ser jogado na horizontal.
        </p>
        
        <div className="mt-8 px-3 py-1 bg-slate-800 rounded text-xs font-mono text-slate-500">
            {window.innerWidth} x {window.innerHeight}
        </div>
      </div>
    );
  }

  // Renderiza o jogo normalmente se não estiver em retrato
  return <>{children}</>;
};