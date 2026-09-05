import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const expectedEmail = process.env.NUTRITIONIST_EMAIL;
  const expectedPassword = process.env.NUTRITIONIST_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json(
      { error: "Credenziali di accesso non configurate." },
      { status: 500 },
    );
  }

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json(
      { error: "Email o password non corretti." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
