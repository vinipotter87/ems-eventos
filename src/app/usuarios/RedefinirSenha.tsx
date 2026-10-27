"use client";
import { useActionState } from "react";
import { redefinirSenha } from "@/app/actions";

export default function RedefinirSenha({ id }: { id: number }) {
  const [estado, acao, pendente] = useActionState(redefinirSenha, undefined);
  return (
    <details className="redefinir">
      <summary>Redefinir senha</summary>
      <form action={acao}>
        <input type="hidden" name="id" value={id} />
        <input name="senha" type="text" placeholder="Nova senha (mín. 8)" minLength={8} required />
        <button className="btn pequeno" type="submit" disabled={pendente}>{pendente ? "..." : "Salvar"}</button>
      </form>
      {estado?.erro && <div className="pequeno" style={{ color: "var(--vermelho)" }}>{estado.erro}</div>}
      {estado && !estado.erro && <div className="pequeno" style={{ color: "var(--verde)" }}>Senha redefinida.</div>}
    </details>
  );
}
