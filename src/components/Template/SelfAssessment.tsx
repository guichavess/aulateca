import React from 'react';
import { PageFooter } from './PageFooter';

interface SelfAssessmentProps {
  pageNumber: number;
}

export function SelfAssessment({ pageNumber }: SelfAssessmentProps) {
  return (
    <div className="a4-page p-12 flex flex-col items-center justify-center pt-16">
      
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-indigo-900 mb-4">Autoavaliação</h2>
        <p className="text-xl text-slate-600">Como você se saiu nesta atividade?</p>
      </div>

      <div className="exercise-box w-full max-w-2xl bg-indigo-50 border-indigo-200 p-8 flex flex-col items-center gap-8 text-center">
        <p className="text-2xl font-bold text-indigo-900">Pinte a carinha que melhor representa o seu aprendizado hoje!</p>
        
        <img 
          src="/assets/template/self-assessment.jpg" 
          alt="Carinhas de autoavaliação" 
          className="w-full max-w-lg blend-multiply object-contain"
        />
      </div>
      
      <div className="mt-12 w-full max-w-2xl text-center">
        <p className="text-lg text-slate-700 font-medium mb-4">Espaço livre para desenhar algo legal:</p>
        <div className="exercise-box h-64 border-dashed border-4 border-slate-300 bg-transparent"></div>
      </div>

      <PageFooter pageNumber={pageNumber} />
    </div>
  );
}
