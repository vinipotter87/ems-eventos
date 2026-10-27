import Link from "next/link";
import Topbar from "@/components/Topbar";
import { usuarioOuLogin, fmtData, STATUS_LABEL } from "@/lib/pagina";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

type Linha = {
  id: number; nome: string; data: string; cidade: string | null; local: string | null; marca: string | null;
  speaker: string | null; status: string; gd_nome: string | null; total: string; feitos: string; criticos_pend: string;
};

export default async function EventosPage({ searchParams }: { searchParams: Promise<{ status?: string; gd?: string }> }) {
  const eu = await usuarioOuLogin();
  const sp = await searchParams;
  const status = sp.status ?? "ativos";
  const gd = sp.gd ? Number(sp.gd) : null;

  const cond: string[] = [];
  const params: unknown[] = [];
  if (status === "ativos") cond.push("e.status IN ('planejamento','realizado')");
  else if (status !== "todos") { params.push(status); cond.push(`e.status = $${params.length}`); }
  if (gd) { params.push(gd); cond.push(`e.gd_id = $${params.length}`); }

  const linhas = await q<Linha>(`
    SELECT e.id, e.nome, e.data::text AS data, e.cidade, e.local, e.marca, e.speaker, e.status, u.nome AS gd_nome,
      (SELECT COUNT(*)::text FROM evento_itens i WHERE i.evento_id = e.id) AS total,
      (SELECT COUNT(*)::text FROM evento_itens i WHERE i.evento_id = e.id AND i.concluido) AS feitos,
      (SELECT COUNT(*)::text FROM evento_itens i WHERE i.evento_id = e.id AND i.critico AND NOT i.concluido) AS criticos_pend
    FROM eventos e LEFT JOIN usuarios u ON u.id = e.gd_id
    ${cond.length ? "WHERE " + cond.join(" AND ") : ""}
    ORDER BY CASE WHEN e.status IN ('planejamento','realizado') THEN 0 ELSE 1 END, e.data ASC, e.id DESC
  `, params);

  const gds = await q<{ id: number; nome: string }>("SELECT id, nome FROM usuarios WHERE papel IN ('GD','GR') AND ativo ORDER BY nome");

  const filtro = (s: string, label: string) => (
    <Link key={s} href={`/eventos?status=${s}${gd ? `&gd=${gd}` : ""}`} className={status === s ? "ativo" : ""}>{label}</Link>
  );

  return (
    <>
      <Topbar usuario={eu} />
      <main className="conteudo">
        <div className="card-cab">
          <div>
            <h1>Eventos</h1>
            <p className="suave" style={{ margin: 0 }}>Regional SPI OESTE · Cardiometabólico</p>
          </div>
          <Link href="/eventos/novo" className="btn">Novo evento</Link>
        </div>

        <div className="filtros">
          {filtro("ativos", "Ativos")}
          {filtro("planejamento", "Em planejamento")}
          {filtro("realizado", "Realizados")}
          {filtro("encerrado", "Encerrados")}
          {filtro("todos", "Todos")}
        </div>
        {gds.length > 1 && (
          <div className="filtros" style={{ marginTop: -6 }}>
            <Link href={`/eventos?status=${status}`} className={!gd ? "ativo" : ""}>Todos os GDs</Link>
            {gds.map((g) => (
              <Link key={g.id} href={`/eventos?status=${status}&gd=${g.id}`} className={gd === g.id ? "ativo" : ""}>{g.nome}</Link>
            ))}
          </div>
        )}

        {linhas.length === 0 ? (
          <div className="card vazio">Nenhum evento nesse filtro. <Link href="/eventos/novo">Criar o primeiro evento</Link>.</div>
        ) : (
          <div className="lista-eventos">
            {linhas.map((e) => {
              const total = Number(e.total), feitos = Number(e.feitos);
              const pct = total ? Math.round((feitos / total) * 100) : 0;
              const crit = Number(e.criticos_pend);
              return (
                <Link key={e.id} href={`/eventos/${e.id}`} className="card evento-card" style={{ textDecoration: "none", color: "inherit" }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="titulo">{e.nome}</span>
                      <span className={`badge ${e.status}`}>{STATUS_LABEL[e.status]}</span>
                      {crit > 0 && e.status !== "cancelado" && <span className="badge critico">{crit} crítico{crit > 1 ? "s" : ""} pendente{crit > 1 ? "s" : ""}</span>}
                    </div>
                    <div className="meta">
                      <span>{fmtData(e.data)}</span>
                      {e.cidade && <span>{e.cidade}</span>}
                      {e.local && <span>{e.local}</span>}
                      {e.marca && <span>{e.marca}</span>}
                      {e.speaker && <span>Speaker: {e.speaker}</span>}
                      {e.gd_nome && <span>GD: {e.gd_nome}</span>}
                    </div>
                    <div className={`progresso${pct === 100 ? " completo" : ""}`} style={{ marginTop: 10 }}><span style={{ width: `${pct}%` }} /></div>
                  </div>
                  <div className="pct">{feitos}/{total} · {pct}%</div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
