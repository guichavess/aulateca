import React from 'react';
import { PageFooter } from './PageFooter';

interface CoverPageProps {
  title: string;
  gradeLabel: string;
  pageNumber: number;
}

export function CoverPage({ title, gradeLabel, pageNumber }: CoverPageProps) {
  return (
    <div className="a4-page p-8 flex flex-col">
      <div 
        className="w-full h-64 rounded-xl overflow-hidden relative mb-8"
        style={{
          backgroundImage: "url('/assets/template/cover-scene.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-white/40 mix-blend-overlay"></div>
        {/* Empty space at the top third for title overlay as requested */}
        <div className="absolute top-8 left-8 right-8 text-center bg-white/90 p-4 rounded-xl shadow-lg border-2 border-indigo-200">
          <h1 className="text-4xl font-black text-indigo-900 uppercase tracking-tight">{title}</h1>
          <div className="text-xl font-bold text-amber-500 mt-2">{gradeLabel}</div>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center relative">
         <img 
            src="/assets/template/teca-detective.jpg" 
            alt="Teca Mascot" 
            className="w-64 h-auto blend-multiply"
         />
      </div>

      <PageFooter pageNumber={pageNumber} />
    </div>
  );
}
