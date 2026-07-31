import React from 'react';

export function PageFooter({ pageNumber }: { pageNumber: number }) {
  return (
    <div className="absolute bottom-4 left-0 right-0 text-center text-sm font-semibold text-slate-500 font-sans">
      🐙 AulaTeca — aulateca.com | Pág {pageNumber}
    </div>
  );
}
