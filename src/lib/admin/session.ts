import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 30;

/** The admin only exists once both secrets are set on the host (or in .env.local). */
export const adminConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);

const sign = (value: string) =>
  createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(value).digest("base64url");

const digest = (value: string) => createHash("sha256").update(value).digest();

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkPassword(input: string) {
  if (!adminConfigured()) return false;
  return timingSafeEqual(digest(input), digest(process.env.ADMIN_PASSWORD ?? ""));
}

export async function startSession() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Changing ADMIN_SESSION_SECRET logs every device out. */
export async function isAdmin() {
  if (!adminConfigured()) return false;
  const [expires, signature] = (await cookies()).get(COOKIE)?.value.split(".") ?? [];
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return same(signature, sign(expires));
}
