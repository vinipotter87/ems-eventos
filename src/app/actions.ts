"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q, one } from "@/lib/db";
import {
  criarSessao,
  encerrarSessao,
  conferirSenha,
  hashSenha,
  existeAlgumUsuario,
  exigirUsuario,
  type Papel,
} from "@/lib/auth";
import { ITENS, TEMPLATE_VERSAO } from "@/lib/checklist";

type Resultado = { erro?: string } | undefined;

function s(fd: FormData, k: string): string {
  return String(fd.get(k) ?? "").trim();
}

function emailValido(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// ---------------- SETUP (primeiro acesso) ----------------
export async function setupInicial(_prev: Resultado, fd: FormData): Promise<Resultado> {
  if (await existeAlgumUsuario()) return { erro: "O sistema já foi configurado." };
  const nome = s(fd, "nome");
  const email = s(fd, "email").toLowerCase();
  const senha = s(fd, "senha");
  if (!nome || !emailValido(email)) return { erro: "Informe nome e um email válido." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  const hash = await hashSenha(senha);
  const u = await one<{ id: number }>(
    "INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1,$2,$3,'GR') RETURNING id",
    [nome, email, hash]
  );
  await criarSessao(u!.id);
  redirect("/eventos");
}

// ---------------- LOGIN / LOGOUT ----------------
export async function login(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const email = s(fd, "email").toLowerCase();
  const senha = s(fd, "senha");
  const next = s(fd, "next") || "/eventos";
  const u = await one<{ id: number; senha_hash: string; ativo: boolean }>(
    "SELECT id, senha_hash, ativo FROM usuarios WHERE email = $1",
    [email]
  );
  if (!u || !u.ativo || !(await conferirSenha(senha, u.senha_hash))) {
    return { erro: "Email ou senha incorretos." };
  }
  await criarSessao(u.id);
  redirect(next.startsWith("/") ? next : "/eventos");
}

export async function logout(): Promise<void> {
  await encerrarSessao();
  redirect("/login");
}

// ---------------- USUARIOS (somente GR) ----------------
export async function criarUsuario(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const eu = await exigirUsuario();
  if (eu.papel !== "GR") return { erro: "Apenas o Gerente Regional cadastra usuários." };
  const nome = s(fd, "nome");
  const email = s(fd, "email").toLowerCase();
  const senha = s(fd, "senha");
  const papel = s(fd, "papel") as Papel;
  if (!nome || !emailValido(email)) return { erro: "Informe nome e um email válido." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (!["GR", "GD", "STAFF"].includes(papel)) return { erro: "Papel inválido." };
  const existe = await one("SELECT 1 FROM usuarios WHERE email = $1", [email]);
  if (existe) return { erro: "Já existe usuário com esse email." };
  await q("INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1,$2,$3,$4)", [
    nome,
    email,
    await hashSenha(senha),
    papel,
  ]);
  revalidatePath("/usuarios");
  return {};
}

export async function alternarAtivo(fd: FormData): Promise<void> {
  const eu = await exigirUsuario();
  if (eu.papel !== "GR") return;
  const id = Number(fd.get("id"));
  if (!id || id === eu.id) return;
  await q("UPDATE usuarios SET ativo = NOT ativo WHERE id = $1", [id]);
  revalidatePath("/usuarios");
}

export async function redefinirSenha(_prev: Resultado, fd: FormData): Promise<Resultado> {
  const eu = await exigirUsuario();
  if (eu.papel !== "GR") return { erro: "Apenas o Gerente Regional redefine senhas." };
  const id = Number(fd.get("id"));
  const senha = s(fd, "senha");
  if (!id) return { erro: "Usuário inválido." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  await q("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [await hashSenha(senha), id]);
  revalidatePath("/usuarios");
  return {};
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
