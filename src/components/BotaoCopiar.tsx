"use client";
import { useState } from "react";

export default function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [ok, setOk] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    } catch {
      window.prompt("Copie o texto abaixo:", texto);
    }
  }
  return <button type="button" className="btn secundario pequeno" onClick={copiar}>{ok ? "Copiado" : rotulo}</button>;
}
