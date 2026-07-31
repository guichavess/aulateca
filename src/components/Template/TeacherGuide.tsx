import React from 'react';
import { PageFooter } from './PageFooter';

interface TeacherGuideProps {
  title: string;
  gradeLabel: string;
  pageNumber: number;
  bncc: string[];
  materials: string[];
}

export function TeacherGuide({ title, gradeLabel, pageNumber, bncc, materials }: TeacherGuideProps) {
  return (
    <div className="a4-page p-12 flex flex-col pt-16">
      <div className="relative z-20 mb-10 pb-4 border-b-4 border-amber-400">
        <div className="uppercase tracking-widest text-slate-500 font-bold mb-2 text-sm">Guia do Professor</div>
        <h2 className="text-4xl font-black text-indigo-950">{title}</h2>
        <span className="inline-block mt-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold text-sm">
          {gradeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-grow">
        <div className="space-y-6">
          <div className="exercise-box bg-indigo-50 border-none shadow-none">
            <h3 className="font-bold text-indigo-900 text-xl mb-3">Habilidades BNCC</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              {bncc.map((code, idx) => (
                <li key={idx} className="font-medium">{code}</li>
              ))}
            </ul>
          </div>
          
          <div className="exercise-box bg-amber-50 border-none shadow-none">
            <h3 className="font-bold text-amber-900 text-xl mb-3">Materiais Necessários</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              {materials.map((mat, idx) => (
                <li key={idx}>{mat}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex justify-center items-center">
          {/* Teacher Mascot */}
          <img 
            src="/assets/template/teca-base.jpg" 
            alt="Teacher Mascot" 
            className="w-80 h-auto blend-multiply"
          />
        </div>
      </div>

      <PageFooter pageNumber={pageNumber} />
    </div>
  );
}
