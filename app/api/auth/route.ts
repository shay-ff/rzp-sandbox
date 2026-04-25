import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (
    username === process.env.TOOL_USERNAME &&
    password === process.env.TOOL_PASSWORD
  ) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("rzp-authed", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1, // 1 hours
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}