import { redirect } from "next/navigation";
import { existeAlgumUsuario, usuarioAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await existeAlgumUsuario())) redirect("/setup");
  const u = await usuarioAtual();
  redirect(u ? "/eventos" : "/login");
}
