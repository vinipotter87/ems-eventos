import Topbar from "@/components/Topbar";
import EventoForm from "@/components/EventoForm";
import { usuarioOuLogin } from "@/lib/pagina";
import { q } from "@/lib/db";
import { criarEvento } from "@/app/actions";
import { ITENS } from "@/lib/checklist";

export const dynamic = "force-dynamic";

export default async function NovoEventoPage() {
  const eu = await usuarioOuLogin();
  const gds = await q<{ id: number; nome: string }>("SELECT id, nome FROM usuarios WHERE papel IN ('GD','GR') AND ativo ORDER BY nome");
  return (
    <>
      <Topbar usuario={eu} />
      <main className="conteudo" style={{ maxWidth: 760 }}>
        <h1>Novo evento</h1>
        <p className="suave">Ao criar, o evento recebe o checklist padrão com {ITENS.length} itens em três fases.</p>
        <div className="card">
          <EventoForm acao={criarEvento} gds={gds} gdPadrao={eu.papel === "GD" ? eu.id : null} textoBotao="Criar evento" />
        </div>
      </main>
    </>
  );
}
