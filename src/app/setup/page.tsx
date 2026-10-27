import { redirect } from "next/navigation";
import { existeAlgumUsuario } from "@/lib/auth";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await existeAlgumUsuario()) redirect("/login");
  return (
    <div className="login-wrap">
      <div className="login-card">
        <span className="logo-grande">EMS</span>
        <h1>Primeiro acesso</h1>
        <p className="suave" style={{ marginTop: 0 }}>
          Crie a conta do Gerente Regional. Ela será a administradora do sistema e cadastrará os demais usuários.
        </p>
        <SetupForm />
      </div>
    </div>
  );
}
