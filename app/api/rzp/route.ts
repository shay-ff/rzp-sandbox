import { getSession } from "../../../lib/session";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req : Request) {
  const session = await getSession() as any;

  if (!session.keyId || !session.keySecret) {
    return NextResponse.json({ error: "No credentials in session" }, { status: 401 });
  }

  const rzp = new Razorpay({
    key_id: session.keyId,
    key_secret: session.keySecret,
  });

  const { method, url, body } = await req.json();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${session.keyId}:${session.keySecret}`).toString("base64"),
      },
      ...(method !== "GET" && { body: JSON.stringify(body) }),
    });

    const contentType = response.headers.get("content-type") || "";
    const isJsonResponse = contentType.includes("application/json");

    if (isJsonResponse) {
      const data = await response.json();
      return NextResponse.json({
        status: response.status,
        contentType,
        isJson: true,
        data,
      });
    }

    const text = await response.text();
    return NextResponse.json({
      status: response.status,
      contentType,
      isJson: false,
      raw: text,
    });
  } catch (err: any) {
    return NextResponse.json({ error : err.message }, { status: 500 });
  }
}