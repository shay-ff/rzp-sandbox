import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    keyId: session.keyId || null,
    keySecret: session.keySecret || null,
  });
}

export async function POST(req) {
  const { keyId, keySecret } = await req.json();
  const session = await getSession();
  session.keyId = keyId;
  session.keySecret = keySecret;
  await session.save();
  return NextResponse.json({ success: true });
}