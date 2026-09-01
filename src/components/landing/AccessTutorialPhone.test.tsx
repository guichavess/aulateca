import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessTutorialPhone from './AccessTutorialPhone';
import { renderAccessEmail } from '../../../supabase/functions/cakto-webhook/email';
import { PESSOA } from './phoneFichas';

/**
 * O tutorial mostra o primeiro acesso pós-compra: e-mail → criar senha → dentro
 * do app. Ele substituiu um vídeo de 11,3 MB gravado em 22/06, que ensinava uma
 * ferramenta que não existe mais — e é exatamente esse o risco que estes testes
 * seguram: a landing continuar ensinando um caminho que o sistema não percorre.
 */

/** O e-mail que a Edge Function manda de verdade quando a compra é confirmada. */
const email = renderAccessEmail({
  template: 'criar_acesso',
  link: 'https://aulateca.com.br/criar-acesso?e=abc',
  loginUrl: 'https://aulateca.com.br/login',
  customerName: PESSOA.nomeCompleto,
});

describe('o tutorial percorre os três passos do primeiro acesso', () => {
  it('abre no e-mail que chega depois do pagamento', () => {
    render(<AccessTutorialPhone />);

    expect(screen.getByText(email.subject)).toBeInTheDocument();
    expect(screen.getByText('Criar minha senha')).toBeInTheDocument();
    expect(
      screen.getByText('Assim que o pagamento cai, o e-mail chega com o link.'),
    ).toBeInTheDocument();
  });

  it('a bolinha 2 leva ao formulário de criar acesso', () => {
    render(<AccessTutorialPhone />);
    fireEvent.click(screen.getByLabelText('Passo 2'));

    expect(screen.getByText('E-mail da compra')).toBeInTheDocument();
    expect(screen.getByText('Criar acesso e entrar →')).toBeInTheDocument();
    // O e-mail da compra chega preenchido pelo `?e=` do link — é o que a
    // legenda promete, e o motivo de não haver uma segunda tela de login.
    expect(screen.getByText(PESSOA.email)).toBeInTheDocument();
  });

  it('a bolinha 3 termina dentro do app', () => {
    render(<AccessTutorialPhone />);
    fireEvent.click(screen.getByLabelText('Passo 3'));

    expect(screen.getByText(`Olá, ${PESSOA.nome}! 👋`)).toBeInTheDocument();
    expect(
      screen.getByText('Pronto: você já está dentro, com as fichas na mão.'),
    ).toBeInTheDocument();
  });
});

/**
 * A trava de fidelidade.
 *
 * O vitest já roda `supabase/functions/**` (ver vitest.config.ts), então aqui o
 * e-mail não é imitado: é o mesmo `renderAccessEmail` que a Edge Function
 * chama. Se alguém mudar o assunto, o botão ou o aviso do e-mail, este teste
 * quebra antes de a landing passar a ensinar um passo que o sistema não dá.
 */
describe('a tela do passo 1 é o e-mail que o sistema envia', () => {
  it('o assunto na tela é o assunto do e-mail', () => {
    render(<AccessTutorialPhone />);
    expect(screen.getByText(email.subject)).toBeInTheDocument();
  });

  it.each([
    'Criar minha senha',
    `Oi, ${PESSOA.nome}!`,
    'Sua compra de Aulateca foi confirmada — obrigado!',
    'Falta só um passo: criar a senha da sua conta. Use o botão abaixo; o e-mail já vem preenchido com o mesmo que você usou na compra.',
    'Importante: use o mesmo e-mail da compra.',
  ])('"%s" está na tela e no e-mail', (trecho) => {
    render(<AccessTutorialPhone />);

    expect(screen.getByText(trecho)).toBeInTheDocument();
    expect(email.text).toContain(trecho);
  });
});
