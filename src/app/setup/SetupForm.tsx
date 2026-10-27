"use client";
import { useActionState } from "react";
import { setupInicial } from "@/app/actions";

export default function SetupForm() {
  const [estado, acao, pendente] = useActionState(setupInicial, undefined);
  return (
    <form action={acao} className="form">
      {estado?.erro && <div className="erro">{estado.erro}</div>}
      <label>Nome<input name="nome" required autoComplete="name" /></label>
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Senha (mínimo 8 caracteres)<input name="senha" type="password" required minLength={8} autoComplete="new-password" /></label>
      <button className="btn" type="submit" disabled={pendente}>{pendente ? "Criando..." : "Criar conta e entrar"}</button>
    </form>
  );
}
