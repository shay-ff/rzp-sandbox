import { NextResponse } from "next/server";
import { expireCredentialsIfNeeded, getSession } from "../../../../lib/session";

export async function POST() {
  const session = await getSession();

  if (expireCredentialsIfNeeded(session)) {
    await session.save();
  }

  if (!session.keyId || !session.keySecret) {
    return NextResponse.json({ error: "Credentials are not available" }, { status: 404 });
  }

  return NextResponse.json({
    credentials: `${session.keyId}:${session.keySecret}`,
  });
}
