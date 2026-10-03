import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import type { RequestHistoryEntry } from "../../../../lib/history";
import { HISTORY_MAX_ITEMS, HISTORY_RESPONSE_PREVIEW_LIMIT, HISTORY_RESPONSE_SUMMARY_LIMIT } from "../../../../lib/history";

const HISTORY_SESSION_JSON_LIMIT = 2400;

const truncate = (value: string, limit: number) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
};

const sanitizeEntry = (entry: RequestHistoryEntry): RequestHistoryEntry => ({
  id: truncate(String(entry.id || ""), 100),
  endpointId: truncate(String(entry.endpointId || ""), 100),
  endpointLabel: truncate(String(entry.endpointLabel || ""), 160),
  endpointGroup: entry.endpointGroup ? truncate(entry.endpointGroup, 100) : undefined,
  method: truncate(String(entry.method || ""), 20),
  url: truncate(String(entry.url || ""), 300),
  requestBody: entry.requestBody ? truncate(entry.requestBody, HISTORY_RESPONSE_PREVIEW_LIMIT) : null,
  responseSummary: truncate(entry.responseSummary, HISTORY_RESPONSE_SUMMARY_LIMIT),
  responsePreview: truncate(entry.responsePreview, HISTORY_RESPONSE_PREVIEW_LIMIT),
  responseTruncated: Boolean(entry.responseTruncated),
  status: entry.status,
  timestamp: truncate(String(entry.timestamp || ""), 40),
  completedAt: entry.completedAt ? truncate(entry.completedAt, 40) : undefined,
  latencyMs: entry.latencyMs,
  variantKey: entry.variantKey ? truncate(entry.variantKey, 100) : undefined,
});

const trimToSessionBudget = (entries: RequestHistoryEntry[]) => {
  let trimmed: RequestHistoryEntry[] = [];

  for (let index = entries.length - 1; index >= 0 && trimmed.length < HISTORY_MAX_ITEMS; index -= 1) {
    const candidate = [entries[index], ...trimmed];
    if (Buffer.byteLength(JSON.stringify(candidate), "utf8") > HISTORY_SESSION_JSON_LIMIT) break;
    trimmed = candidate;
  }

  return trimmed;
};

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
  const existingHistory = Array.isArray(session.requestHistory)
    ? session.requestHistory.map(sanitizeEntry)
    : [];
  const nextHistory = trimToSessionBudget([...existingHistory, sanitizeEntry(incoming)]);
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