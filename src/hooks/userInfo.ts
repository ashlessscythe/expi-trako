import { User } from "@/lib/types/user";

export const renderSites = (user: User) => {
  const userSites = [
    ...(user.userSites?.map((us) => us.site) || []),
    ...(user.site ? [user.site] : []),
  ];
  // Remove duplicates based on site id
  const uniqueSites = Array.from(
    new Map(userSites.map((site) => [site.id, site])).values()
  );

  return uniqueSites.length > 0
    ? uniqueSites
        .map((site) => `${site.name} (${site.locationCode})`)
        .join(", ")
    : "No sites assigned";
};
