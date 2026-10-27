import Topbar from "@/components/Topbar";
import EventoForm from "@/components/EventoForm";
import { usuarioOuLogin } from "@/lib/pagina";
import { criarEvento } from "@/app/actions";
import { ITENS } from "@/lib/checklist";

export const dynamic = "force-dynamic";

export default async function NovoEventoPage() {
  const eu = await usuarioOuLogin();
  return (
    <>
      <Topbar usuario={eu} />
      <main className="conteudo" style={{ maxWidth: 760 }}>
        <h1>Novo evento</h1>
        <p className="suave">Ao criar, o evento recebe o checklist padrão com {ITENS.length} itens em três fases. Você fica como responsável pelo evento.</p>
        <div className="card">
          <EventoForm acao={criarEvento} gds={[]} responsavelNome={eu.nome} textoBotao="Criar evento" />
        </div>
      </main>
    </>
  );
}
