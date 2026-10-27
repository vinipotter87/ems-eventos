import Link from "next/link";
export default function NotFound() {
  return (
    <main className="conteudo">
      <div className="card vazio">Página não encontrada. <Link href="/eventos">Voltar aos eventos</Link>.</div>
    </main>
  );
}
