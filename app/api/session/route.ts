import {
  CREDENTIALS_TTL_SECONDS,
  expireCredentialsIfNeeded,
  getSession,
} from "../../../lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  const expired = expireCredentialsIfNeeded(session);
  if (expired) await session.save();
  return NextResponse.json({
    keyId: session.keyId || null,
    keySecret: session.keySecret || null,
    hasCredentials: Boolean(session.keyId && session.keySecret),
  });
}

export async function POST(req: Request) {
  const { keyId, keySecret } = await req.json();
  const session = await getSession();
  expireCredentialsIfNeeded(session);
  session.keyId = keyId;
  session.keySecret = keySecret;
  session.credentialsExpiresAt = Date.now() + CREDENTIALS_TTL_SECONDS * 1000;
  await session.save();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getSession();
  delete session.keyId;
  delete session.keySecret;
  delete session.credentialsExpiresAt;
  await session.save();
  return NextResponse.json({ success: true });
}