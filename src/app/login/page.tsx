import { redirect } from "next/navigation";
import { usuarioAtual, DOMINIO_PERMITIDO } from "@/lib/auth";
import LoginForm from "./LoginForm";
import Logo from "@/components/Logo";
import { Blobs } from "@/components/Blobs";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await usuarioAtual()) redirect("/eventos");
  const { next } = await searchParams;
  return (
    <div className="login-wrap">
      <Blobs />
      <div className="login-marca">
        <Logo className="grande" />
        <div className="pontilhada" />
        <p>Eventos médicos</p>
      </div>
      <div className="login-card">
        <h1>Acesso</h1>
        <p className="suave" style={{ marginTop: 0 }}>
          Checklist de organização de eventos médicos. Acesso com seu email @{DOMINIO_PERMITIDO}.
        </p>
        <LoginForm next={next ?? ""} dominio={DOMINIO_PERMITIDO} />
      </div>
    </div>
  );
}
