import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { healingJourneys, healingJourneyEntries } from "@/db/schema";
import { healingJourneySchema } from "@/lib/validations";
import { eq, and, desc, count, sql } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id: clientId } = await params;
    const tenantId = session.user.tenantId;

    const entriesCountSubquery = db
      .select({
        journeyId: healingJourneyEntries.journeyId,
        count: count().as("entries_count"),
      })
      .from(healingJourneyEntries)
      .where(eq(healingJourneyEntries.tenantId, tenantId))
      .groupBy(healingJourneyEntries.journeyId)
      .as("entries_count_sq");

    const data = await db
      .select({
        id: healingJourneys.id,
        clientId: healingJourneys.clientId,
        title: healingJourneys.title,
        description: healingJourneys.description,
        status: healingJourneys.status,
        startDate: healingJourneys.startDate,
        endDate: healingJourneys.endDate,
        primaryServiceId: healingJourneys.primaryServiceId,
        createdById: healingJourneys.createdById,
        consentStatus: healingJourneys.consentStatus,
        signatureUrl: healingJourneys.signatureUrl,
        consentSignedAt: healingJourneys.consentSignedAt,
        consentRequestedAt: healingJourneys.consentRequestedAt,
        createdAt: healingJourneys.createdAt,
        updatedAt: healingJourneys.updatedAt,
        entriesCount: sql<number>`COALESCE(${entriesCountSubquery.count}, 0)`.as("entries_count"),
      })
      .from(healingJourneys)
      .leftJoin(entriesCountSubquery, eq(healingJourneys.id, entriesCountSubquery.journeyId))
      .where(
        and(
          eq(healingJourneys.tenantId, tenantId),
          eq(healingJourneys.clientId, clientId)
        )
      )
      .orderBy(desc(healingJourneys.createdAt));

    return success(data);
  } catch (error) {
    console.error("GET /api/clients/[id]/healing-journeys error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id: clientId } = await params;
    const body = await req.json();
    const result = healingJourneySchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [created] = await db
      .insert(healingJourneys)
      .values({
        tenantId: session.user.tenantId,
        clientId,
        title: validated.title,
        description: validated.description,
        status: validated.status,
        startDate: validated.startDate,
        endDate: validated.endDate,
        primaryServiceId: validated.primaryServiceId,
        createdById: session.user.id,
      })
      .returning();

    return success(created, 201);
  } catch (error) {
    console.error("POST /api/clients/[id]/healing-journeys error:", error);
    return serverError();
  }
}
