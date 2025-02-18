import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  revalidatePath("/requests");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
