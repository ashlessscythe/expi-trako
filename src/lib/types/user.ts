import { User as PrismaUser, Site } from "@prisma/client";

// Define the Site type with only the fields we need for display
type SiteDisplay = {
  id: string;
  name: string;
  locationCode: string;
};

// Define base User type with nullable siteId and optional site
export type User = Omit<PrismaUser, "siteId"> & {
  siteId: string | null;
  site?: SiteDisplay | null;
};
