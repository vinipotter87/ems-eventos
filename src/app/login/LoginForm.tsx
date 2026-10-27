"use client";
import { useActionState } from "react";
import { login } from "@/app/actions";

export default function LoginForm({ next }: { next: string }) {
  const [estado, acao, pendente] = useActionState(login, undefined);
  return (
    <form action={acao} className="form">
      {estado?.erro && <div className="erro">{estado.erro}</div>}
      <input type="hidden" name="next" value={next} />
      <label>Email<input name="email" type="email" required autoComplete="email" autoFocus /></label>
      <label>Senha<input name="senha" type="password" required autoComplete="current-password" /></label>
      <button className="btn" type="submit" disabled={pendente}>{pendente ? "Entrando..." : "Entrar"}</button>
      <p className="pequeno" style={{ margin: 0 }}>Sem acesso? Solicite ao Gerente Regional.</p>
    </form>
  );
}
