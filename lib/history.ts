export interface RequestHistoryEntry {
  id: string;
  endpointId: string;
  endpointLabel: string;
  endpointGroup?: string;
  method: string;
  url: string;
  requestBody: string | null;
  responseSummary: string;
  responsePreview: string;
  responseTruncated: boolean;
  status: number | null;
  timestamp: string;
  variantKey?: string;
}

export const HISTORY_MAX_ITEMS = 20;
export const HISTORY_RESPONSE_PREVIEW_LIMIT = 1800;
export const HISTORY_RESPONSE_SUMMARY_LIMIT = 320;