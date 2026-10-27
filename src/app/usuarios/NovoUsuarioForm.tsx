"use client";
import { useActionState, useEffect, useRef } from "react";
import { criarUsuario } from "@/app/actions";

export default function NovoUsuarioForm() {
  const [estado, acao, pendente] = useActionState(criarUsuario, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (estado && !estado.erro) ref.current?.reset(); }, [estado]);
  return (
    <form ref={ref} action={acao} className="form">
      {estado?.erro && <div className="erro">{estado.erro}</div>}
      {estado && !estado.erro && <div className="ok">Usuário criado. Informe email e senha à pessoa.</div>}
      <div className="linha">
        <label>Nome<input name="nome" required /></label>
        <label>Email<input name="email" type="email" required /></label>
      </div>
      <div className="linha">
        <label>Senha inicial (mínimo 8)<input name="senha" type="text" required minLength={8} autoComplete="off" /></label>
        <label>Papel
          <select name="papel" defaultValue="GD">
            <option value="GD">Gerente Distrital</option>
            <option value="STAFF">Staff</option>
            <option value="GR">Gerente Regional</option>
          </select>
        </label>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn" type="submit" disabled={pendente}>{pendente ? "Criando..." : "Cadastrar"}</button>
      </div>
    </form>
  );
}
