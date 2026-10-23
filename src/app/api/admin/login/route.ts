import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, startSession } from "@/lib/admin/session";

const FAILED_LOGIN_DELAY = 1000;

export async function POST(request: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { password } = (await request.json().catch(() => ({}))) as { password?: unknown };
  if (typeof password !== "string" || !checkPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY));
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await startSession();
  return NextResponse.json({ ok: true });
}
