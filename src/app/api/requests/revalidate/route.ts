import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import type { SessionUser } from "@/lib/types";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  
  // If user has a site, only revalidate their site's requests
  if (user.site) {
    revalidatePath(`/requests?site=${user.site.id}`);
  } else {
    revalidatePath("/requests");
  }
  
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
