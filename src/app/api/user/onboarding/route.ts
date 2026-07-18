import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { goals, cefrLevel } = await req.json();

  await db
    .update(users)
    .set({
      goals,
      cefrLevel,
      onboardingComplete: true,
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
