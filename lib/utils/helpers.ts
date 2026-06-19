export const truncateText = (value: string, limit: number) =>
  value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;

export const safeJsonStringify = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const normalizeJsonText = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return null;
  }
};

export const shellEscape = (value: string) => `'${value.replace(/'/g, `'\''`)}'`;

export const createHistoryId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const METHOD_COLORS = {
  GET: "text-success bg-success-bg border-success/30",
  POST: "text-primary bg-primary-bg border-primary/30",
  PUT: "text-amber bg-amber-bg border-amber/30",
  PATCH: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  DELETE: "text-error bg-error-bg border-error/30",
  CHECKOUT: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
} as const;

export const STATUS_COLOR = (status: number | null) => {
  if (!status) return "text-text-low";
  if (status < 300) return "text-success";
  if (status < 500) return "text-amber";
  return "text-error";
};

export const getResponseSummaryText = (response: any) => {
  if (response?.error) {
    return `Error: ${response.error}`;
  }

  const lines: string[] = [];
  if (typeof response?.status === "number") lines.push(`Status: ${response.status}`);
  if (response?.contentType) lines.push(`Content-Type: ${response.contentType}`);

  if (response?.isJson === false) {
    const rawText = String(response.raw || "");
    lines.push(`Body: ${truncateText(rawText.replace(/\s+/g, " "), 240)}`);
    return lines.join("\n");
  }

  const payload = response?.data || response;
  if (Array.isArray(payload)) {
    lines.push(`Items: ${payload.length}`);
    lines.push(`Preview: ${truncateText(safeJsonStringify(payload), 320)}`);
    return lines.join("\n");
  }

  if (payload && typeof payload === "object") {
    const keys = Object.keys(payload);
    lines.push(`Keys: ${truncateText(keys.join(", "), 140)}`);
    lines.push(`Preview: ${truncateText(safeJsonStringify(payload), 320)}`);
    return lines.join("\n");
  }

  lines.push(`Value: ${String(payload)}`);
  return lines.join("\n");
};

export const getResponsePreviewText = (response: any) => {
  if (response?.error) return response.error;
  if (response?.isJson === false) return String(response.raw || "");
  return safeJsonStringify(response?.data || response);
};

export const getResponseRawCopyText = (response: any) => {
  if (response?.isJson === false) {
    return String(response.raw || "");
  }
  return safeJsonStringify(response?.data || response);
};

export const getResponseCopyText = (response: any) => {
  if (response?.isJson === false) {
    return String(response.raw || "");
  }
  return JSON.stringify(response?.data || response, null, 2);
};

export const getCheckoutFieldHint = (field: string) => {
  switch (field) {
    case "key":
      return "Prefilled from the saved session key";
    case "order_id":
      return "Paste the order_id from a Create Order response";
    case "customer_id":
      return "Paste the customer_id from a saved customer response";
    case "name":
      return "Customer name shown in checkout";
    case "email":
      return "Receipt and customer email";
    case "contact":
      return "Customer phone number";
    default:
      return "Required for checkout";
  }
};

export const getEndpointDefaultBodyText = (endpoint: any, selectedVariants: Record<string, string>) => {
  if (!endpoint.defaultBody) return "";
  if (endpoint.variants?.length) {
    const variantKey = selectedVariants[endpoint.id] || endpoint.variants[0].key;
    const variantBody = (endpoint.defaultBody as Record<string, any>)[variantKey] ?? endpoint.defaultBody;
    return safeJsonStringify(variantBody);
  }
  return safeJsonStringify(endpoint.defaultBody);
};

export const isEndpointBodyDirty = (endpoint: any, bodyValues: Record<string, string>, selectedVariants: Record<string, string>) => {
  const defaultBodyText = getEndpointDefaultBodyText(endpoint, selectedVariants).trim();
  const currentBodyText = (bodyValues[endpoint.id] || "").trim();

  if (!defaultBodyText) return Boolean(currentBodyText);
  if (!currentBodyText) return true;

  const normalizedCurrent = normalizeJsonText(currentBodyText);
  const normalizedDefault = normalizeJsonText(defaultBodyText);
  if (normalizedCurrent && normalizedDefault) {
    return normalizedCurrent !== normalizedDefault;
  }

  return currentBodyText !== defaultBodyText;
};
