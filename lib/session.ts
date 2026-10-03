import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { RequestHistoryEntry } from "./history";

export interface SessionData {
  authenticated?: boolean;
  keyId?: string;
  keySecret?: string;
  credentialsExpiresAt?: number;
  requestHistory?: RequestHistoryEntry[];
}

export const CREDENTIALS_TTL_SECONDS = 60 * 60;

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "rzp-tool-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: CREDENTIALS_TTL_SECONDS,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export function expireCredentialsIfNeeded(session: IronSession<SessionData>) {
  if (
    session.credentialsExpiresAt &&
    session.credentialsExpiresAt <= Date.now()
  ) {
    delete session.keyId;
    delete session.keySecret;
    delete session.credentialsExpiresAt;
    return true;
  }
  return false;
}