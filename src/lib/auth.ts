import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { one } from "./db";

export const COOKIE = "ems_sessao";
const DIAS = 30;

export type Papel = "GR" | "GD" | "STAFF";
export type Usuario = { id: number; nome: string; email: string; papel: Papel; ativo: boolean };

export function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET não configurada (mínimo 16 caracteres).");
  return new TextEncoder().encode(s);
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function criarSessao(userId: number): Promise<void> {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DIAS}d`)
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function usuarioAtual(): Promise<Usuario | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const uid = Number(payload.uid);
    if (!uid) return null;
    const u = await one<Usuario>(
      "SELECT id, nome, email, papel, ativo FROM usuarios WHERE id = $1 AND ativo = TRUE",
      [uid]
    );
    return u;
  } catch {
    return null;
  }
}

export async function exigirUsuario(): Promise<Usuario> {
  const u = await usuarioAtual();
  if (!u) throw new Error("NAO_AUTENTICADO");
  return u;
}

export async function existeAlgumUsuario(): Promise<boolean> {
  const r = await one<{ n: string }>("SELECT COUNT(*)::text AS n FROM usuarios");
  return Number(r?.n ?? 0) > 0;
}

export const PAPEL_LABEL: Record<Papel, string> = {
  GR: "Gerente Regional",
  GD: "Gerente Distrital",
  STAFF: "Staff",
};
