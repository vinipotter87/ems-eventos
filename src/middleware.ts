import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLICAS = ["/login", "/setup"];
const RAIZ = "/";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === RAIZ || PUBLICAS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get("ems_sessao")?.value;
  const s = process.env.AUTH_SECRET;
  if (token && s) {
    try {
      await jwtVerify(token, new TextEncoder().encode(s));
      return NextResponse.next();
    } catch {
      // token invalido ou expirado: cai para o login
    }
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)"],
};
