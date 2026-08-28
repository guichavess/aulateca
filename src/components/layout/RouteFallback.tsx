import React from 'react';

/** Espera curta e silenciosa: usada pelo Suspense das rotas e pelo PaidGuard. */
const RouteFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-sm">
    Carregando…
  </div>
);

export default RouteFallback;
