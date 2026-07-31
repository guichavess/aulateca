import React, { useEffect } from 'react';
import { CoverPage } from '../components/Template/CoverPage';
import { TeacherGuide } from '../components/Template/TeacherGuide';
import { ExercisePage } from '../components/Template/ExercisePage';
import { SelfAssessment } from '../components/Template/SelfAssessment';
import '../styles/print.css';

// Mock data simulating catalogo.csv
const mockActivity = {
  title: "Mistério das Vogais",
  gradeLabel: "⭐⭐ 2º Ano",
  bncc: ["EF02LP01", "EF02LP04", "EF02LP07"],
  materials: ["Lápis de cor", "Borracha", "Tesoura sem ponta"],
  exercises: [
    { id: 1, content: "1. Encontre as vogais escondidas no texto abaixo e circule-as de vermelho:" },
    { id: 2, content: "2. Complete as palavras com as vogais que estão faltando:" },
    { id: 3, content: "3. Escreva três palavras que comecem com a letra A:" }
  ]
};

export default function PrintTemplate() {
  
  // Opcional: Acionar a impressão automaticamente quando a rota carregar
  // useEffect(() => {
  //   setTimeout(() => window.print(), 1500);
  // }, []);

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:p-0 print:bg-white flex flex-col items-center">
      
      {/* UI Controls (Hidden on print) */}
      <div className="no-print mb-8 bg-white p-4 rounded-xl shadow flex gap-4 items-center">
        <h1 className="text-xl font-bold text-slate-800">Visualização do Template de Impressão</h1>
        <button 
          onClick={() => window.print()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
        >
          Imprimir PDF
        </button>
      </div>

      <div className="flex flex-col gap-8 print:gap-0">
        <div className="page-break">
          <CoverPage 
            title={mockActivity.title} 
            gradeLabel={mockActivity.gradeLabel} 
            pageNumber={1} 
          />
        </div>

        <div className="page-break">
          <TeacherGuide 
            title={mockActivity.title}
            gradeLabel={mockActivity.gradeLabel}
            bncc={mockActivity.bncc}
            materials={mockActivity.materials}
            pageNumber={2}
          />
        </div>

        <div className="page-break">
          <ExercisePage 
            title={mockActivity.title}
            gradeLabel={mockActivity.gradeLabel}
            exercises={mockActivity.exercises}
            pageNumber={3}
          />
        </div>

        <div className="page-break">
          <SelfAssessment pageNumber={4} />
        </div>
      </div>
    </div>
  );
}
