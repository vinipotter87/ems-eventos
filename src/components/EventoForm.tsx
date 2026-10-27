"use client";
import { useActionState } from "react";
import { STATUS_LABEL } from "@/lib/util";

type Resultado = { erro?: string } | undefined;
type GD = { id: number; nome: string };
type Valores = {
  id?: number; nome?: string; data?: string; horario?: string | null; cidade?: string | null; local?: string | null;
  marca?: string | null; speaker?: string | null; gd_id?: number | null; observacoes?: string | null; status?: string;
};

export default function EventoForm({
  acao, gds, valores, gdPadrao, mostrarStatus, textoBotao,
}: {
  acao: (prev: Resultado, fd: FormData) => Promise<Resultado>;
  gds: GD[]; valores?: Valores; gdPadrao?: number | null; mostrarStatus?: boolean; textoBotao: string;
}) {
  const [estado, submit, pendente] = useActionState(acao, undefined);
  const v = valores ?? {};
  return (
    <form action={submit} className="form">
      {estado?.erro && <div className="erro">{estado.erro}</div>}
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <label>Nome do evento<input name="nome" required defaultValue={v.nome ?? ""} placeholder="Ex.: Jantar científico Ozivy · Campinas" /></label>
      <div className="linha">
        <label>Data<input name="data" type="date" required defaultValue={v.data ?? ""} /></label>
        <label>Horário<input name="horario" defaultValue={v.horario ?? ""} placeholder="Ex.: 19h30" /></label>
      </div>
      <div className="linha">
        <label>Cidade<input name="cidade" defaultValue={v.cidade ?? ""} /></label>
        <label>Local<input name="local" defaultValue={v.local ?? ""} placeholder="Restaurante, hotel, auditório" /></label>
      </div>
      <div className="linha">
        <label>Marca / produto<input name="marca" defaultValue={v.marca ?? ""} /></label>
        <label>Speaker<input name="speaker" defaultValue={v.speaker ?? ""} /></label>
      </div>
      <div className="linha">
        <label>GD responsável
          <select name="gd_id" defaultValue={v.gd_id ?? gdPadrao ?? ""}>
            <option value="">Sem GD definido</option>
            {gds.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
        </label>
        {mostrarStatus && (
          <label>Status
            <select name="status" defaultValue={v.status ?? "planejamento"}>
              {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
        )}
      </div>
      <label>Observações<textarea name="observacoes" defaultValue={v.observacoes ?? ""} /></label>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn" type="submit" disabled={pendente}>{pendente ? "Salvando..." : textoBotao}</button>
      </div>
    </form>
  );
}
