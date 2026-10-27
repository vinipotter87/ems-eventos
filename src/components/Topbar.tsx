import Link from "next/link";
import type { Usuario } from "@/lib/auth";
import { PAPEL_LABEL } from "@/lib/auth";
import { logout } from "@/app/actions";
import Logo from "@/components/Logo";

export default function Topbar({ usuario }: { usuario: Usuario }) {
  return (
    <header className="topbar">
      <Link href="/eventos" className="marca">
        <Logo />
        <span className="produto">Eventos</span>
      </Link>
      <nav>
        <Link href="/eventos">Eventos</Link>
        <Link href="/eventos/novo">Novo evento</Link>
        {usuario.papel === "GR" && <Link href="/usuarios">Usuários</Link>}
        <span className="quem">
          {usuario.nome} · {PAPEL_LABEL[usuario.papel]}
        </span>
        <form action={logout}>
          <button type="submit">Sair</button>
        </form>
      </nav>
    </header>
  );
}
