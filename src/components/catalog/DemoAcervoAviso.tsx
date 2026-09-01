import React from 'react';

/**
 * Diz, na cara, que o que está na tela é acervo de demonstração.
 *
 * Existe porque o mock silencioso foi o problema: material fictício com cara de
 * catálogo real, e download que não baixa. Se vamos mostrar o acervo de exemplo,
 * a tela precisa admitir isso — inclusive para quem está conduzindo a demo.
 */
const DemoAcervoAviso: React.FC = () => (
  <div
    role="status"
    className="rounded-xl border-2 border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink"
  >
    <strong className="font-fredoka font-bold">Acervo de demonstração.</strong>{' '}
    O banco está sem materiais, então estes são exemplos — os downloads não funcionam.
  </div>
);

export default DemoAcervoAviso;
