import { endpointGroups } from "@/lib/endpoint";

export const endpointMetaById = endpointGroups.reduce<Record<string, { group: string }>>(
  (acc, group) => {
    group.endpoints.forEach((endpoint) => {
      acc[endpoint.id] = { group: group.group };
    });
    return acc;
  },
  {}
);

export const groupSlugMap: Record<string, string> = {};
export const slugGroupMap: Record<string, string> = {};

endpointGroups.forEach((g) => {
  const slug = g.group
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  groupSlugMap[g.group] = slug;
  slugGroupMap[slug] = g.group;
});

export const getGroupSlug = (groupName: string) => groupSlugMap[groupName] || "";
export const getGroupBySlug = (slug: string) => slugGroupMap[slug] || null;
