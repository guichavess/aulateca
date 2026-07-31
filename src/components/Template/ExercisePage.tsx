import React from 'react';
import { PageFooter } from './PageFooter';

interface ExercisePageProps {
  title: string;
  gradeLabel: string;
  pageNumber: number;
  exercises: { id: number; content: string }[];
}

export function ExercisePage({ title, gradeLabel, pageNumber, exercises }: ExercisePageProps) {
  return (
    <div className="a4-page p-12 flex flex-col pt-24">
      {/* Banner & Header */}
      <div 
        className="absolute top-0 left-0 right-0 h-8 opacity-80 blend-multiply"
        style={{ backgroundImage: "url('/assets/template/border-strip.jpg')" }}
      ></div>
      
      {/* Corner Ornament */}
      <div className="corner-ornament corner-top-left blend-multiply z-10" />

      <div className="relative z-20 mb-8 border-b-2 border-indigo-100 pb-4">
        <h2 className="text-3xl font-bold text-indigo-900">{title} <span className="text-amber-500">{gradeLabel}</span></h2>
      </div>
      
      <div className="flex-grow space-y-6 relative z-20">
        {exercises.map((ex) => (
          <div key={ex.id} className="exercise-box">
            <p className="text-lg text-slate-800 font-medium">{ex.content}</p>
            {/* Blank space for student to write */}
            <div className="mt-6 border-b-2 border-dashed border-slate-300 w-full h-8"></div>
            <div className="mt-2 border-b-2 border-dashed border-slate-300 w-full h-8"></div>
          </div>
        ))}
      </div>

      <PageFooter pageNumber={pageNumber} />
    </div>
  );
}
