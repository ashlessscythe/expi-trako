import { User as PrismaUser, Site } from "@prisma/client";

// Define the Site type with only the fields we need for display
type SiteDisplay = {
  id: string;
  name: string;
  locationCode: string;
};

// Define UserSite type
type UserSiteDisplay = {
  id: string;
  siteId: string;
  site: SiteDisplay;
};

// Define base User type with nullable siteId, optional site, and userSites
export type User = Omit<PrismaUser, "siteId"> & {
  siteId: string | null;
  site?: SiteDisplay | null;
  userSites?: UserSiteDisplay[];
};
