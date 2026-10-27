import { redirect } from "next/navigation";
import { existeAlgumUsuario, usuarioAtual } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!(await existeAlgumUsuario())) redirect("/setup");
  if (await usuarioAtual()) redirect("/eventos");
  const { next } = await searchParams;
  return (
    <div className="login-wrap">
      <div className="login-card">
        <span className="logo-grande">EMS</span>
        <h1>Eventos</h1>
        <p className="suave" style={{ marginTop: 0 }}>Checklist de organização de eventos médicos.</p>
        <LoginForm next={next ?? ""} />
      </div>
    </div>
  );
}
