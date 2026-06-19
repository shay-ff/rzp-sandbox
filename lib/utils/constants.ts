export const ENDPOINT_METHOD_FILTERS = ["ALL", "GET", "POST", "PUT", "PATCH", "DELETE", "CHECKOUT"] as const;
export type EndpointMethodFilter = (typeof ENDPOINT_METHOD_FILTERS)[number];

export const HISTORY_GROUPING_OPTIONS = ["group", "method"] as const;
export type HistoryGrouping = (typeof HISTORY_GROUPING_OPTIONS)[number];
