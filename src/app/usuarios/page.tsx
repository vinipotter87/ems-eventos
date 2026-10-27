import { redirect } from "next/navigation";
import Topbar from "@/components/Topbar";
import { usuarioOuLogin, fmtDataHora } from "@/lib/pagina";
import { PAPEL_LABEL, DOMINIO_PERMITIDO, type Papel } from "@/lib/auth";
import { q } from "@/lib/db";
import { alternarAtivo, alterarPapel } from "@/app/actions";

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
        <p className="suave">
          As contas são criadas sozinhas no primeiro acesso, por qualquer email @{DOMINIO_PERMITIDO} que receba o código. Todo mundo entra como Staff; aqui você promove a Gerente Distrital ou desativa o acesso.
        </p>
        <div className="card">
          <h2>{usuarios.length} cadastrado{usuarios.length === 1 ? "" : "s"}</h2>
          <table className="tabela">
            <thead><tr><th>Nome</th><th>Email</th><th>Papel</th><th>Desde</th><th>Acesso</th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className={u.ativo ? "" : "inativo"}>
                  <td>{u.nome}{!u.ativo && " (inativo)"}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.id === eu.id ? (
                      PAPEL_LABEL[u.papel]
                    ) : (
                      <form action={alterarPapel} className="acoes-inline">
                        <input type="hidden" name="id" value={u.id} />
                        <select name="papel" defaultValue={u.papel} style={{ font: "inherit", padding: "5px 6px", border: "1px solid var(--borda)", borderRadius: 6 }}>
                          <option value="STAFF">Staff</option>
                          <option value="GD">Gerente Distrital</option>
                          <option value="GR">Gerente Regional</option>
                        </select>
                        <button className="btn secundario pequeno" type="submit">Salvar</button>
                      </form>
                    )}
                  </td>
                  <td className="pequeno">{fmtDataHora(u.criado_em)}</td>
                  <td>
                    {u.id !== eu.id && (
                      <form action={alternarAtivo}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="btn secundario pequeno" type="submit">{u.ativo ? "Desativar" : "Reativar"}</button>
                      </form>
                    )}
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
