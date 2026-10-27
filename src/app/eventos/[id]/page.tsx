import Link from "next/link";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import ItemChecklist, { type ItemDados } from "@/components/ItemChecklist";
import BotaoCopiar from "@/components/BotaoCopiar";
import { usuarioOuLogin, fmtData, hojeISO, STATUS_LABEL } from "@/lib/pagina";
import { q, one } from "@/lib/db";
import { FASES, ORIENTACOES_STAFF, SCRIPT_RECEPCAO, textoOrientacoesParaCopiar, type Fase } from "@/lib/checklist";

export const dynamic = "force-dynamic";

type Evento = {
  id: number; nome: string; data: string; horario: string | null; cidade: string | null; local: string | null;
  marca: string | null; speaker: string | null; status: string; observacoes: string | null; gd_nome: string | null;
};
type Item = ItemDados & { fase: Fase; grupo: string; ordem: number };

export default async function EventoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aba?: string }> }) {
  const eu = await usuarioOuLogin();
  const { id } = await params;
  const { aba: abaRaw } = await searchParams;
  const ev = await one<Evento>(`
    SELECT e.id, e.nome, e.data::text AS data, e.horario, e.cidade, e.local, e.marca, e.speaker, e.status, e.observacoes, u.nome AS gd_nome
    FROM eventos e LEFT JOIN usuarios u ON u.id = e.gd_id WHERE e.id = $1`, [Number(id)]);
  if (!ev) notFound();

  const itens = await q<Item>(`
    SELECT i.id, i.fase, i.grupo, i.ordem, i.titulo, i.critico, i.concluido, i.prazo::text AS prazo, i.responsavel, i.observacao,
      i.concluido_em::text AS concluido_em, u.nome AS concluido_por_nome
    FROM evento_itens i LEFT JOIN usuarios u ON u.id = i.concluido_por
    WHERE i.evento_id = $1 ORDER BY i.ordem`, [ev.id]);

  const total = itens.length, feitos = itens.filter((i) => i.concluido).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  const criticos = itens.filter((i) => i.critico);
  const criticosPend = criticos.filter((i) => !i.concluido).length;
  const hoje = hojeISO();
  const atrasados = itens.filter((i) => !i.concluido && i.prazo && i.prazo < hoje).length;

  const abas: { key: string; label: string }[] = [
    ...FASES.map((f) => ({ key: f.key, label: f.titulo })),
    { key: "criticos", label: "Pontos críticos" },
    { key: "staffs", label: "Orientações aos staffs" },
  ];
  const aba = abas.some((a) => a.key === abaRaw) ? (abaRaw as string) : "pre";
  const faseAtual = FASES.find((f) => f.key === aba);

  const porGrupo = (fase: Fase) => {
    const m = new Map<string, Item[]>();
    for (const i of itens.filter((x) => x.fase === fase)) {
      if (!m.has(i.grupo)) m.set(i.grupo, []);
      m.get(i.grupo)!.push(i);
    }
    return [...m.entries()];
  };

  const textoCopiar = textoOrientacoesParaCopiar(ev.nome, `${fmtData(ev.data)}${ev.horario ? " · " + ev.horario : ""}`, [ev.local, ev.cidade].filter(Boolean).join(", "));

  return (
    <>
      <Topbar usuario={eu} />
      <main className="conteudo">
        <p className="pequeno" style={{ margin: "0 0 8px" }}><Link href="/eventos">Eventos</Link> / {ev.nome}</p>
        <div className="card">
          <div className="cab-evento">
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0 }}>{ev.nome}</h1>
                <span className={`badge ${ev.status}`}>{STATUS_LABEL[ev.status]}</span>
              </div>
              <div className="dados">
                <span><b>Data:</b> {fmtData(ev.data)}{ev.horario ? ` · ${ev.horario}` : ""}</span>
                {(ev.local || ev.cidade) && <span><b>Local:</b> {[ev.local, ev.cidade].filter(Boolean).join(", ")}</span>}
                {ev.marca && <span><b>Marca:</b> {ev.marca}</span>}
                {ev.speaker && <span><b>Speaker:</b> {ev.speaker}</span>}
                {ev.gd_nome && <span><b>Responsável:</b> {ev.gd_nome}</span>}
              </div>
              {ev.observacoes && <p className="suave" style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{ev.observacoes}</p>}
            </div>
            <Link href={`/eventos/${ev.id}/editar`} className="btn secundario pequeno">Editar evento</Link>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <div className={`progresso${pct === 100 ? " completo" : ""}`} style={{ flex: 1 }}><span style={{ width: `${pct}%` }} /></div>
            <div className="pct">{feitos}/{total} · {pct}%</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {criticosPend > 0 ? <span className="badge critico">{criticosPend} ponto{criticosPend > 1 ? "s" : ""} crítico{criticosPend > 1 ? "s" : ""} pendente{criticosPend > 1 ? "s" : ""}</span> : <span className="badge encerrado">Pontos críticos concluídos</span>}
            {atrasados > 0 && <span className="badge pendente">{atrasados} ite{atrasados > 1 ? "ns" : "m"} com prazo vencido</span>}
          </div>
        </div>

        <div className="resumo-fases">
          {FASES.map((f) => {
            const its = itens.filter((i) => i.fase === f.key);
            const ok = its.filter((i) => i.concluido).length;
            return (
              <Link key={f.key} href={`/eventos/${ev.id}?aba=${f.key}`} className="fase-pill" style={{ textDecoration: "none" }}>
                <div className="nome">{f.titulo}</div>
                <div className="num">{ok}/{its.length}</div>
                <div className="progresso" style={{ marginTop: 6 }}><span style={{ width: `${its.length ? (ok / its.length) * 100 : 0}%` }} /></div>
              </Link>
            );
          })}
        </div>

        <div className="abas">
          {abas.map((a) => <Link key={a.key} href={`/eventos/${ev.id}?aba=${a.key}`} className={aba === a.key ? "ativo" : ""}>{a.label}</Link>)}
        </div>

        {faseAtual && (
          <div className="card">
            <h2>{faseAtual.titulo}</h2>
            <p className="suave" style={{ marginTop: 0 }}>{faseAtual.subtitulo}</p>
            {porGrupo(faseAtual.key).map(([grupo, its]) => (
              <div key={grupo} className="grupo">
                <div className="grupo-titulo">{grupo} <span>{its.filter((i) => i.concluido).length} de {its.length}</span></div>
                <div className="card" style={{ padding: 0 }}>
                  {its.map((i) => <ItemChecklist key={i.id} item={i} hoje={hoje} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {aba === "criticos" && (
          <div className="card">
            <h2>Pontos críticos de controle</h2>
            <p className="suave" style={{ marginTop: 0 }}>Itens obrigatórios antes de liberar a realização ou o encerramento do evento: contrato do speaker, valor acordado, regras de compliance e NF, limite do cartão, conferência de participantes, documentação fiscal e RDV.</p>
            <div className="criticos-lista">
              {criticos.map((i) => (
                <div key={i.id} className={`critico-linha${i.concluido ? " ok" : ""}`}>
                  <span className="ponto" />
                  <span>{i.titulo}</span>
                  <span className="pequeno" style={{ marginLeft: "auto" }}>{FASES.find((f) => f.key === i.fase)?.titulo}</span>
                </div>
              ))}
            </div>
            <div className="script" style={{ fontStyle: "normal", marginTop: 16 }}>
              O evento não termina com a saída dos convidados. O fechamento acontece quando a documentação está regularizada, os médicos presentes foram direcionados aos representantes e existe continuidade científica e comercial mensurável.
            </div>
          </div>
        )}

        {aba === "staffs" && (
          <div className="card orientacoes">
            <div className="card-cab">
              <div>
                <h2>Orientações aos staffs</h2>
                <p className="suave" style={{ margin: 0 }}>Texto de repasse à equipe. Copie e envie no grupo do evento.</p>
              </div>
              <BotaoCopiar texto={textoCopiar} rotulo="Copiar orientações" />
            </div>
            {ORIENTACOES_STAFF.map((b) => (
              <div key={b.titulo}>
                <h4>{b.titulo}</h4>
                <ul>{b.itens.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            ))}
            <h4>Padrão de recepção médica</h4>
            <div className="script">{SCRIPT_RECEPCAO}</div>
          </div>
        )}
      </main>
    </>
  );
}
