import { getSession } from "../../../lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession() as any;
  return NextResponse.json({
    keyId: session.keyId || null,
    keySecret: session.keySecret || null,
  });
}

export async function POST(req: Request) {
  const { keyId, keySecret } = await req.json();
  const session = await getSession();
  session.keyId = keyId;
  session.keySecret = keySecret;
  await session.save();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getSession();
  delete session.keyId;
  delete session.keySecret;
  await session.save();
  return NextResponse.json({ success: true });
}