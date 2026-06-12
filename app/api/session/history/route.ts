import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import type { RequestHistoryEntry } from "../../../../lib/history";
import { HISTORY_MAX_ITEMS, HISTORY_RESPONSE_PREVIEW_LIMIT, HISTORY_RESPONSE_SUMMARY_LIMIT } from "../../../../lib/history";

const truncate = (value: string, limit: number) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
};

const sanitizeEntry = (entry: RequestHistoryEntry): RequestHistoryEntry => ({
  ...entry,
  requestBody: entry.requestBody ? truncate(entry.requestBody, HISTORY_RESPONSE_PREVIEW_LIMIT) : null,
  responseSummary: truncate(entry.responseSummary, HISTORY_RESPONSE_SUMMARY_LIMIT),
  responsePreview: truncate(entry.responsePreview, HISTORY_RESPONSE_PREVIEW_LIMIT),
});

const readHistory = async () => {
  const session = await getSession() as any;
  return Array.isArray(session.requestHistory) ? (session.requestHistory as RequestHistoryEntry[]) : [];
};

export async function GET() {
  const history = await readHistory();
  return NextResponse.json({ history });
}

export async function POST(req: Request) {
  const session = await getSession() as any;
  const incoming = (await req.json()) as RequestHistoryEntry;
  const nextHistory = [...(Array.isArray(session.requestHistory) ? session.requestHistory : []), sanitizeEntry(incoming)].slice(-HISTORY_MAX_ITEMS);
  session.requestHistory = nextHistory;
  await session.save();
  return NextResponse.json({ history: nextHistory });
}

export async function DELETE() {
  const session = await getSession() as any;
  session.requestHistory = [];
  await session.save();
  return NextResponse.json({ success: true });
}