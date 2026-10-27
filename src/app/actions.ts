"use server";

import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q, one } from "@/lib/db";
import {
  criarSessao,
  encerrarSessao,
  exigirUsuario,
  adminEmails,
  emailValido,
  emailDoDominio,
  nomeDoEmail,
  hashCodigo,
  codigoConfere,
  DOMINIO_PERMITIDO,
  type Papel,
} from "@/lib/auth";
import { enviarCodigo } from "@/lib/email";
import { ITENS, TEMPLATE_VERSAO } from "@/lib/checklist";

type Resultado = { erro?: string } | undefined;

function s(fd: FormData, k: string): string {
  return String(fd.get(k) ?? "").trim();
}

// ---------------- LOGIN POR CODIGO (somente emails @ems.com.br) ----------------
export type EstadoLogin = { etapa: "email" | "codigo"; email?: string; erro?: string; info?: string };

const VALIDADE_MIN = 10;
const MAX_TENTATIVAS = 5;
const MAX_CODIGOS_POR_HORA = 5;
const INTERVALO_REENVIO_SEG = 45;

async function emailAutorizado(email: string): Promise<boolean> {
  if (!emailValido(email)) return false;
  if (emailDoDominio(email) || adminEmails().includes(email)) return true;
  // Gerente Regional ja cadastrado (ex.: criado antes desta regra) continua com acesso.
  const gr = await one("SELECT 1 AS x FROM usuarios WHERE email = $1 AND papel = 'GR' AND ativo = TRUE", [email]);
  return !!gr;
}

async function emitirCodigo(email: string): Promise<EstadoLogin> {
  await q("DELETE FROM login_codigos WHERE criado_em < NOW() - INTERVAL '1 day'");

  const rec = await one<{ n: string; recente: boolean }>(
    `SELECT COUNT(*)::text AS n,
            COALESCE(BOOL_OR(criado_em > NOW() - INTERVAL '${INTERVALO_REENVIO_SEG} seconds'), FALSE) AS recente
       FROM login_codigos WHERE email = $1 AND criado_em > NOW() - INTERVAL '1 hour'`,
    [email]
  );
  if (rec?.recente) {
    return { etapa: "codigo", email, info: "Um código acabou de ser enviado. Aguarde alguns segundos para pedir outro." };
  }
  if (Number(rec?.n ?? 0) >= MAX_CODIGOS_POR_HORA) {
    return { etapa: "email", erro: "Muitos códigos solicitados para este email. Tente novamente em cerca de uma hora." };
  }

  const codigo = String(randomInt(0, 1000000)).padStart(6, "0");
  const reg = await one<{ id: number }>(
    `INSERT INTO login_codigos (email, codigo_hash, expira_em)
     VALUES ($1, $2, NOW() + INTERVAL '${VALIDADE_MIN} minutes') RETURNING id`,
    [email, hashCodigo(email, codigo)]
  );
  try {
    await enviarCodigo(email, codigo);
  } catch (e) {
    console.error("Falha ao enviar codigo:", e instanceof Error ? e.message : e);
    await q("DELETE FROM login_codigos WHERE id = $1", [reg!.id]);
    return { etapa: "email", erro: "Não foi possível enviar o email agora. Tente novamente em instantes." };
  }
  return { etapa: "codigo", email, info: `Enviamos um código de 6 dígitos para ${email}. Ele vale por ${VALIDADE_MIN} minutos.` };
}

export async function entrar(_prev: EstadoLogin | undefined, fd: FormData): Promise<EstadoLogin> {
  const acao = s(fd, "acao");
  const email = s(fd, "email").toLowerCase();
  const next = s(fd, "next");

  if (acao === "voltar") return { etapa: "email" };

  if (!emailValido(email)) return { etapa: "email", erro: "Informe um email válido." };
  if (!(await emailAutorizado(email))) {
    return { etapa: "email", erro: `Acesso restrito a emails @${DOMINIO_PERMITIDO}.` };
  }

  if (acao === "enviar" || acao === "reenviar") return emitirCodigo(email);

  // acao === "verificar"
  const codigo = s(fd, "codigo").replace(/\D/g, "");
  if (codigo.length !== 6) return { etapa: "codigo", email, erro: "Digite os 6 dígitos do código." };

  const reg = await one<{ id: number; codigo_hash: string; expirado: boolean; tentativas: number }>(
    `SELECT id, codigo_hash, (expira_em < NOW()) AS expirado, tentativas
       FROM login_codigos WHERE email = $1 ORDER BY id DESC LIMIT 1`,
    [email]
  );
  if (!reg) return { etapa: "email", erro: "Solicite um novo código." };
  if (reg.expirado) return { etapa: "email", erro: "Código expirado. Solicite um novo." };
  if (reg.tentativas >= MAX_TENTATIVAS) return { etapa: "email", erro: "Muitas tentativas incorretas. Solicite um novo código." };

  if (!codigoConfere(email, codigo, reg.codigo_hash)) {
    await q("UPDATE login_codigos SET tentativas = tentativas + 1 WHERE id = $1", [reg.id]);
    return { etapa: "codigo", email, erro: "Código incorreto." };
  }

  // Sucesso: codigo de uso unico.
  await q("DELETE FROM login_codigos WHERE email = $1", [email]);

  const ehAdmin = adminEmails().includes(email);
  let u = await one<{ id: number; ativo: boolean }>("SELECT id, ativo FROM usuarios WHERE email = $1", [email]);
  if (!u) {
    u = await one<{ id: number; ativo: boolean }>(
      "INSERT INTO usuarios (nome, email, papel) VALUES ($1, $2, $3) RETURNING id, ativo",
      [nomeDoEmail(email), email, ehAdmin ? "GR" : "STAFF"]
    );
  } else if (ehAdmin) {
    await q("UPDATE usuarios SET papel = 'GR', ativo = TRUE WHERE id = $1", [u.id]);
    u.ativo = true;
  }
  if (!u!.ativo) return { etapa: "email", erro: "Conta desativada. Fale com o Gerente Regional." };

  await criarSessao(u!.id);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/eventos");
}

export async function logout(): Promise<void> {
  await encerrarSessao();
  redirect("/login");
}

// ---------------- USUARIOS (somente GR) ----------------
export async function alternarAtivo(fd: FormData): Promise<void> {
  const eu = await exigirUsuario();
  if (eu.papel !== "GR") return;
  const id = Number(fd.get("id"));
  if (!id || id === eu.id) return;
  await q("UPDATE usuarios SET ativo = NOT ativo WHERE id = $1", [id]);
  revalidatePath("/usuarios");
}

export async function alterarPapel(fd: FormData): Promise<void> {
  const eu = await exigirUsuario();
  if (eu.papel !== "GR") return;
  const id = Number(fd.get("id"));
  const papel = String(fd.get("papel") ?? "") as Papel;
  if (!id || id === eu.id || !["GR", "GD", "STAFF"].includes(papel)) return;
  await q("UPDATE usuarios SET papel = $1 WHERE id = $2", [papel, id]);
  revalidatePath("/usuarios");
}

// ---------------- EVENTOS ----------------
export async function criarEvento(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const eu = await exigirUsuario();
  const nome = s(fd, "nome");
  const data = s(fd, "data");
  if (!nome || !data) return { erro: "Nome e data do evento são obrigatórios." };
  const gdRaw = s(fd, "gd_id");
  const gd_id = gdRaw ? Number(gdRaw) : eu.papel === "GD" ? eu.id : null;

  const ev = await one<{ id: number }>(
    `INSERT INTO eventos (nome, data, horario, cidade, local, marca, speaker, gd_id, observacoes, template_versao, criado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [
      nome,
      data,
      s(fd, "horario") || null,
      s(fd, "cidade") || null,
      s(fd, "local") || null,
      s(fd, "marca") || null,
      s(fd, "speaker") || null,
      gd_id,
      s(fd, "observacoes") || null,
      TEMPLATE_VERSAO,
      eu.id,
    ]
  );

  // Snapshot do template no evento
  const values: string[] = [];
  const params: unknown[] = [];
  ITENS.forEach((it, i) => {
    const b = params.length;
    values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7})`);
    params.push(ev!.id, it.key, it.fase, it.grupo, i + 1, it.titulo, !!it.critico);
  });
  await q(
    `INSERT INTO evento_itens (evento_id, item_key, fase, grupo, ordem, titulo, critico) VALUES ${values.join(",")}`,
    params
  );

  revalidatePath("/eventos");
  redirect(`/eventos/${ev!.id}`);
}

export async function atualizarEvento(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const eu = await exigirUsuario();
  const id = Number(fd.get("id"));
  const nome = s(fd, "nome");
  const data = s(fd, "data");
  if (!id || !nome || !data) return { erro: "Nome e data do evento são obrigatórios." };
  const gdRaw = s(fd, "gd_id");
  await q(
    `UPDATE eventos SET nome=$1, data=$2, horario=$3, cidade=$4, local=$5, marca=$6, speaker=$7, gd_id=$8, observacoes=$9, status=$10
     WHERE id=$11`,
    [
      nome,
      data,
      s(fd, "horario") || null,
      s(fd, "cidade") || null,
      s(fd, "local") || null,
      s(fd, "marca") || null,
      s(fd, "speaker") || null,
      gdRaw ? Number(gdRaw) : null,
      s(fd, "observacoes") || null,
      s(fd, "status") || "planejamento",
      id,
    ]
  );
  void eu;
  revalidatePath(`/eventos/${id}`);
  revalidatePath("/eventos");
  redirect(`/eventos/${id}`);
}

export async function excluirEvento(fd: FormData): Promise<void> {
  const eu = await exigirUsuario();
  if (eu.papel !== "GR") return;
  const id = Number(fd.get("id"));
  if (!id) return;
  await q("DELETE FROM eventos WHERE id = $1", [id]);
  revalidatePath("/eventos");
  redirect("/eventos");
}

// ---------------- ITENS DO CHECKLIST ----------------
export async function marcarItem(itemId: number, concluido: boolean): Promise<void> {
  const eu = await exigirUsuario();
  const it = await one<{ evento_id: number }>("SELECT evento_id FROM evento_itens WHERE id = $1", [itemId]);
  if (!it) return;
  if (concluido) {
    await q("UPDATE evento_itens SET concluido = TRUE, concluido_por = $1, concluido_em = NOW() WHERE id = $2", [
      eu.id,
      itemId,
    ]);
  } else {
    await q("UPDATE evento_itens SET concluido = FALSE, concluido_por = NULL, concluido_em = NULL WHERE id = $1", [
      itemId,
    ]);
  }
  revalidatePath(`/eventos/${it.evento_id}`);
  revalidatePath("/eventos");
}

export async function salvarDetalhesItem(itemId: number, dados: { responsavel: string; prazo: string; observacao: string }): Promise<void> {
  await exigirUsuario();
  const it = await one<{ evento_id: number }>("SELECT evento_id FROM evento_itens WHERE id = $1", [itemId]);
  if (!it) return;
  await q("UPDATE evento_itens SET responsavel = $1, prazo = $2, observacao = $3 WHERE id = $4", [
    dados.responsavel.trim() || null,
    dados.prazo || null,
    dados.observacao.trim() || null,
    itemId,
  ]);
  revalidatePath(`/eventos/${it.evento_id}`);
}
