import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __emsPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __emsSchemaReady: Promise<void> | undefined;
}

function connectionString(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL não configurada. Na Vercel, conecte um banco Neon em Storage.");
  return url;
}

export function pool(): Pool {
  if (!global.__emsPool) {
    const cs = connectionString();
    const isLocal = /localhost|127\.0\.0\.1/.test(cs);
    global.__emsPool = new Pool({
      connectionString: cs,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return global.__emsPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('GR','GD','STAFF')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  horario TEXT,
  cidade TEXT,
  local TEXT,
  marca TEXT,
  speaker TEXT,
  gd_id INTEGER REFERENCES usuarios(id),
  status TEXT NOT NULL DEFAULT 'planejamento' CHECK (status IN ('planejamento','realizado','encerrado','cancelado')),
  observacoes TEXT,
  template_versao INTEGER NOT NULL,
  criado_por INTEGER REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evento_itens (
  id SERIAL PRIMARY KEY,
  evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  fase TEXT NOT NULL,
  grupo TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  critico BOOLEAN NOT NULL DEFAULT FALSE,
  concluido BOOLEAN NOT NULL DEFAULT FALSE,
  concluido_por INTEGER REFERENCES usuarios(id),
  concluido_em TIMESTAMPTZ,
  responsavel TEXT,
  prazo DATE,
  observacao TEXT,
  UNIQUE (evento_id, item_key)
);

CREATE INDEX IF NOT EXISTS evento_itens_evento_idx ON evento_itens(evento_id);
CREATE INDEX IF NOT EXISTS eventos_data_idx ON eventos(data);
`;

export async function ensureSchema(): Promise<void> {
  if (!global.__emsSchemaReady) {
    global.__emsSchemaReady = pool()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((e) => {
        global.__emsSchemaReady = undefined;
        throw e;
      });
  }
  return global.__emsSchemaReady;
}

export async function q<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const res = await pool().query<T>(text, params);
  return res.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}
