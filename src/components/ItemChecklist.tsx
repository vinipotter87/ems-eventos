"use client";
import { useState, useTransition } from "react";
import { marcarItem, salvarDetalhesItem } from "@/app/actions";

export type ItemDados = {
  id: number; titulo: string; critico: boolean; concluido: boolean;
  concluido_por_nome: string | null; concluido_em: string | null;
  responsavel: string | null; prazo: string | null; observacao: string | null;
};

function fmtData(d: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-");
  return `${day}/${m}/${y}`;
}
function fmtDataHora(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function ItemChecklist({ item, hoje }: { item: ItemDados; hoje: string }) {
  const [feito, setFeito] = useState(item.concluido);
  const [aberto, setAberto] = useState(false);
  const [pendente, startTransition] = useTransition();
  const [salvando, startSalvar] = useTransition();

  const atrasado = !feito && !!item.prazo && item.prazo.slice(0, 10) < hoje;

  function alternar() {
    const novo = !feito;
    setFeito(novo);
    startTransition(async () => {
      try { await marcarItem(item.id, novo); } catch { setFeito(!novo); }
    });
  }

  function salvar(fd: FormData) {
    startSalvar(async () => {
      await salvarDetalhesItem(item.id, {
        responsavel: String(fd.get("responsavel") ?? ""),
        prazo: String(fd.get("prazo") ?? ""),
        observacao: String(fd.get("observacao") ?? ""),
      });
      setAberto(false);
    });
  }

  const temMeta = item.responsavel || item.prazo || item.observacao || (feito && item.concluido_por_nome);

  return (
    <div className={`item${feito ? " feito" : ""}`}>
      <input type="checkbox" checked={feito} onChange={alternar} disabled={pendente} aria-label={item.titulo} />
      <div>
        <div className="item-titulo" onClick={alternar}>
          {item.titulo} {item.critico && <span className="badge critico" style={{ marginLeft: 6 }}>Crítico</span>}
        </div>
        {temMeta && (
          <div className="item-meta">
            {item.responsavel && <span>Responsável: {item.responsavel}</span>}
            {item.prazo && <span className={atrasado ? "atrasado" : ""}>Prazo: {fmtData(item.prazo)}{atrasado ? " (atrasado)" : ""}</span>}
            {feito && item.concluido_por_nome && <span>Concluído por {item.concluido_por_nome} em {fmtDataHora(item.concluido_em)}</span>}
            {item.observacao && <span>Obs.: {item.observacao}</span>}
          </div>
        )}
      </div>
      <div className="item-acoes">
        <button type="button" onClick={() => setAberto((a) => !a)}>{aberto ? "Fechar" : "Detalhes"}</button>
      </div>
      {aberto && (
        <form action={salvar} className="item-detalhes">
          <div className="linha">
            <label>Responsável<input name="responsavel" defaultValue={item.responsavel ?? ""} placeholder="Nome de quem executa" /></label>
            <label>Prazo<input name="prazo" type="date" defaultValue={item.prazo?.slice(0, 10) ?? ""} /></label>
          </div>
          <label>Observação<textarea name="observacao" defaultValue={item.observacao ?? ""} placeholder="Valor acordado, contato do local, pendência, link do Sympla..." /></label>
          <div className="botoes">
            <button type="button" className="btn secundario pequeno" onClick={() => setAberto(false)}>Cancelar</button>
            <button type="submit" className="btn pequeno" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
