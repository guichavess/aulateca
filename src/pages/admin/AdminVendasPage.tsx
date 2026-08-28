import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import {
  salesService,
  situacaoDoAcesso,
  situacaoDaConta,
  type Sale,
  type SalesFilter,
  type SituacaoTom,
} from '@/services/sales.service';

const filtros: Array<{ id: SalesFilter; label: string }> = [
  { id: 'todas', label: 'Todas' },
  { id: 'ativas', label: 'Com acesso' },
  { id: 'atencao', label: 'Travadas' },
  { id: 'sem_conta', label: 'Sem conta' },
  { id: 'encerradas', label: 'Encerradas' },
];

const tomClasses: Record<SituacaoTom, string> = {
  ok: 'bg-emerald-500/15 text-emerald-600',
  atencao: 'bg-amber-500/15 text-amber-600',
  ruim: 'bg-danger/15 text-danger-deep',
  neutro: 'bg-muted text-muted-foreground',
};

const Badge: React.FC<{ tom: SituacaoTom; children: React.ReactNode }> = ({ tom, children }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${tomClasses[tom]}`}>
    {children}
  </span>
);

const Cartao: React.FC<{ label: string; valor: number; destaque?: boolean }> = ({
  label,
  valor,
  destaque,
}) => (
  <div
    className={`rounded-2xl border p-4 ${
      destaque && valor > 0 ? 'border-danger/30 bg-danger/5' : 'border-border bg-card'
    }`}
  >
    <p className="text-xs text-muted-foreground">{label}</p>
    <p
      className={`font-fredoka text-2xl font-bold tabular-nums mt-0.5 ${
        destaque && valor > 0 ? 'text-danger' : ''
      }`}
    >
      {valor}
    </p>
  </div>
);

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const Linha: React.FC<{ venda: Sale }> = ({ venda }) => {
  const acesso = situacaoDoAcesso(venda);
  const conta = situacaoDaConta(venda);

  return (
    <tr className="hover:bg-secondary/30 transition-colors align-top">
      <td className="px-4 py-3">
        <div className="font-medium break-all">{venda.email}</div>
        <div className="text-[11px] text-muted-foreground">
          {venda.productName ?? 'produto não informado'}
          {venda.refId && <> · ref {venda.refId}</>}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge tom={acesso.tom}>{acesso.label}</Badge>
        {acesso.detalhe && (
          <div className="text-[11px] text-muted-foreground mt-1">{acesso.detalhe}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge tom={conta.tom}>{conta.label}</Badge>
        {conta.detalhe && (
          <div className="text-[11px] text-muted-foreground mt-1 break-words max-w-[22rem]">
            {conta.detalhe}
          </div>
        )}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {dataHora(venda.grantedAt)}
      </td>
      <td className="px-4 py-3 hidden xl:table-cell text-[11px] text-muted-foreground">
        {venda.lastEvent ?? '—'}
        {venda.lastEventAt && (
          <div className="tabular-nums">{dataHora(venda.lastEventAt)}</div>
        )}
      </td>
    </tr>
  );
};

const AdminVendasPage: React.FC = () => {
  const [filter, setFilter] = useState<SalesFilter>('todas');
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');

  const resumo = useQuery({
    queryKey: ['admin', 'vendas', 'resumo'],
    queryFn: () => salesService.summary(),
  });

  const lista = useQuery({
    queryKey: ['admin', 'vendas', filter, termo],
    queryFn: () => salesService.list(filter, termo),
  });

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-fredoka text-h1 font-bold">Vendas e acessos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            O que a Cakto liberou, quem já criou a senha e quem ficou pelo caminho.
          </p>
        </div>
        <button
          onClick={() => {
            resumo.refetch();
            lista.refetch();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${lista.isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {resumo.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Cartao label="Vendas registradas" valor={resumo.data.total} />
          <Cartao label="Com acesso agora" valor={resumo.data.ativas} />
          <Cartao label="Pagou e não entra" valor={resumo.data.atencao} destaque />
          <Cartao label="Sem conta criada" valor={resumo.data.semConta} />
        </div>
      )}

      {/* "Pagou e não entra" é dinheiro recebido sem produto entregue. Não é um
          número de acompanhamento: é uma fila de trabalho, e por isso vira
          chamada em vez de ficar só no cartão. */}
      {resumo.data && resumo.data.atencao > 0 && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-danger-deep">
              {resumo.data.atencao} {resumo.data.atencao === 1 ? 'pessoa pagou' : 'pessoas pagaram'} e
              não {resumo.data.atencao === 1 ? 'consegue' : 'conseguem'} entrar
            </p>
            <p className="text-muted-foreground mt-0.5">
              O acesso está liberado no banco, mas o e-mail com o link não saiu. O reenvio é
              manual — o passo a passo está em <code>docs/integracao-cakto.md</code>.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTermo(busca);
          }}
          className="ml-auto relative"
        >
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por e-mail"
            aria-label="Buscar por e-mail"
            className="h-8 w-56 pl-8 pr-3 rounded-full bg-secondary/60 text-xs outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>
      </div>

      {lista.isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {lista.isError && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          Falha ao carregar:{' '}
          {lista.error instanceof Error ? lista.error.message : 'erro desconhecido'}
        </div>
      )}

      {lista.data && lista.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <p className="text-sm">
            {termo
              ? `Nenhuma venda para "${termo}".`
              : filter === 'todas'
                ? 'Nenhuma venda registrada ainda.'
                : 'Nenhuma venda neste filtro.'}
          </p>
        </div>
      )}

      {lista.data && lista.data.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Comprador</th>
                <th className="text-left px-4 py-3 font-semibold">Acesso</th>
                <th className="text-left px-4 py-3 font-semibold">Conta</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Liberado em</th>
                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Último evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.data.map((venda) => (
                <Linha key={venda.id} venda={venda} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sem isto, um filtro que devolve 12 linhas de uma página de 50 parece
          "só existem 12" — e alguém fecha a tela achando que a fila acabou. */}
      {lista.data && lista.data.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          Mostrando as {lista.data.length} vendas mais recentes deste filtro (a consulta traz até 50
          por vez). Os contadores acima consideram a base inteira.
        </p>
      )}
    </div>
  );
};

export default AdminVendasPage;
