import React from 'react';
import EmptyState from '@/components/ui/EmptyState';
import SuporteLinks from '@/components/support/SuporteLinks';
import { reportarErro } from '@/lib/monitoring';

interface Props {
  children: React.ReactNode;
  /** Aparece no assunto do chamado. Diz de qual altura o erro veio. */
  origem: string;
  /** Sem isto, o botão de recarregar é a única saída. */
  mostrarVoltar?: boolean;
}

interface State {
  erro: Error | null;
  eventId: string | null;
}

/**
 * A rede embaixo do app.
 *
 * Sem um boundary, qualquer exceção durante o render desmonta a árvore inteira
 * e o professor fica olhando uma página branca — sem mensagem, sem botão, sem
 * ideia do que fazer. E como nada era reportado, do nosso lado o erro
 * simplesmente não existia.
 *
 * Precisa ser classe: `componentDidCatch` não tem equivalente em hook no React 18.
 *
 * O `eventId` na tela não é enfeite. É o que transforma "não abre aqui" em um
 * chamado que dá para investigar — a pessoa manda o código, e ele cai exatamente
 * no evento do Sentry.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { erro: null, eventId: null };

  static getDerivedStateFromError(erro: Error): Partial<State> {
    return { erro };
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    const eventId = reportarErro(erro, {
      origem: this.props.origem,
      componentStack: info.componentStack,
      rota: window.location.pathname,
    });
    this.setState({ eventId });
  }

  render() {
    const { erro, eventId } = this.state;
    if (!erro) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md space-y-6">
          <EmptyState
            tone="error"
            mood="neutral"
            title="Alguma coisa quebrou por aqui"
            description={
              <>
                O erro foi registrado e já estamos sabendo. Recarregar a página costuma
                resolver.
                {eventId && (
                  <>
                    {' '}
                    Se continuar, mande este código para a gente:{' '}
                    <code className="font-mono text-xs text-foreground">{eventId}</code>
                  </>
                )}
              </>
            }
            action={
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="py-3 px-5 rounded-xl font-fredoka font-bold btn-primary-glow"
                >
                  Recarregar
                </button>
                {this.props.mostrarVoltar && (
                  // location.href, não navigate(): o router pode ser justamente
                  // o que quebrou, e uma navegação de verdade remonta tudo.
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/'; }}
                    className="py-3 px-5 rounded-xl font-semibold border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Voltar ao início
                  </button>
                )}
              </div>
            }
          />

          <SuporteLinks
            titulo="Continua quebrado?"
            assunto={`Aulateca — erro em ${this.props.origem}`}
            contexto={[
              `Tela: ${window.location.pathname}`,
              eventId ? `Código do erro: ${eventId}` : null,
              erro.message ? `Mensagem: ${erro.message}` : null,
            ]}
          />
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
