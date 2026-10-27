import { redirect } from "next/navigation";
import Topbar from "@/components/Topbar";
import { usuarioOuLogin, fmtDataHora } from "@/lib/pagina";
import { PAPEL_LABEL, type Papel } from "@/lib/auth";
import { q } from "@/lib/db";
import { alternarAtivo } from "@/app/actions";
import NovoUsuarioForm from "./NovoUsuarioForm";
import RedefinirSenha from "./RedefinirSenha";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const eu = await usuarioOuLogin();
  if (eu.papel !== "GR") redirect("/eventos");
  const usuarios = await q<{ id: number; nome: string; email: string; papel: Papel; ativo: boolean; criado_em: string }>(
    "SELECT id, nome, email, papel, ativo, criado_em::text AS criado_em FROM usuarios ORDER BY papel, nome");
  return (
    <>
      <Topbar usuario={eu} />
      <main className="conteudo">
        <h1>Usuários</h1>
        <p className="suave">Somente o Gerente Regional cadastra, desativa e redefine senhas.</p>
        <div className="card">
          <h2>Novo usuário</h2>
          <NovoUsuarioForm />
        </div>
        <div className="card">
          <h2>Cadastrados</h2>
          <table className="tabela">
            <thead><tr><th>Nome</th><th>Email</th><th>Papel</th><th>Desde</th><th>Ações</th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className={u.ativo ? "" : "inativo"}>
                  <td>{u.nome}{!u.ativo && " (inativo)"}</td>
                  <td>{u.email}</td>
                  <td>{PAPEL_LABEL[u.papel]}</td>
                  <td className="pequeno">{fmtDataHora(u.criado_em)}</td>
                  <td>
                    <div className="acoes-inline">
                      {u.id !== eu.id && (
                        <form action={alternarAtivo}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="btn secundario pequeno" type="submit">{u.ativo ? "Desativar" : "Reativar"}</button>
                        </form>
                      )}
                      <RedefinirSenha id={u.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
