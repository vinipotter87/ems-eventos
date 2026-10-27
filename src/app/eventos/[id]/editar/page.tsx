import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import EventoForm from "@/components/EventoForm";
import { usuarioOuLogin } from "@/lib/pagina";
import { q, one } from "@/lib/db";
import { atualizarEvento, excluirEvento } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const eu = await usuarioOuLogin();
  const { id } = await params;
  const ev = await one<{
    id: number; nome: string; data: string; horario: string | null; cidade: string | null; local: string | null;
    marca: string | null; speaker: string | null; gd_id: number | null; observacoes: string | null; status: string;
  }>("SELECT id, nome, data::text AS data, horario, cidade, local, marca, speaker, gd_id, observacoes, status FROM eventos WHERE id = $1", [Number(id)]);
  if (!ev) notFound();
  const gds = await q<{ id: number; nome: string }>("SELECT id, nome FROM usuarios WHERE papel IN ('GD','GR') AND ativo ORDER BY nome");
  return (
    <>
      <Topbar usuario={eu} />
      <main className="conteudo" style={{ maxWidth: 760 }}>
        <h1>Editar evento</h1>
        <div className="card">
          <EventoForm acao={atualizarEvento} gds={gds} valores={ev} mostrarStatus textoBotao="Salvar alterações" />
        </div>
        {eu.papel === "GR" && (
          <div className="card" style={{ marginTop: 14 }}>
            <h2>Excluir evento</h2>
            <p className="suave">Remove o evento e todo o checklist associado. Não há como desfazer.</p>
            <form action={excluirEvento}>
              <input type="hidden" name="id" value={ev.id} />
              <button className="btn perigo" type="submit">Excluir este evento</button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
