import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { key_id, key_secret, endpoint, method, body } = await req.json()

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64")

    const res = await fetch(`https://api.razorpay.com/v1/${endpoint}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    })

    const data = await res.json()

    return NextResponse.json({
      status: res.status,
      data,
    })
  } catch (err) {
    return NextResponse.json({ error: "Request failed", err })
  }
}