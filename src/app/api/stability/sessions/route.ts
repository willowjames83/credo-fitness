import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  STABILITY_TYPES,
  type StabilitySessionDTO,
  type StabilityType,
} from "@/components/pillars/dto";

const createSessionSchema = z.object({
  type: z.enum(STABILITY_TYPES, {
    errorMap: () => ({ message: "Unknown stability session type" }),
  }),
  minutes: z
    .number()
    .int("Minutes must be a whole number")
    .min(1, "Minutes must be at least 1")
    .max(180, "Minutes must be 180 or less"),
  date: z.string().datetime({ offset: true }).nullish(),
  notes: z.string().trim().max(280).nullish(),
});

interface SessionRow {
  id: string;
  date: Date;
  type: string;
  minutes: number;
  notes: string | null;
}

function toDTO(row: SessionRow): StabilitySessionDTO {
  return {
    id: row.id,
    date: row.date.toISOString(),
    type: row.type as StabilityType,
    minutes: row.minutes,
    notes: row.notes,
  };
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { type, minutes, date, notes } = parsed.data;
    const when = date ? new Date(date) : new Date();
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const session = await prisma.stabilitySession.create({
      data: {
        userId,
        type,
        minutes,
        date: when,
        notes: notes && notes.length > 0 ? notes : null,
      },
    });

    return NextResponse.json({ data: { session: toDTO(session) } });
  } catch (error) {
    console.error("Create stability session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limitRaw = Number(url.searchParams.get("limit") ?? 20);
    const offsetRaw = Number(url.searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(100, Math.max(1, Math.floor(limitRaw)))
      : 20;
    const offset = Number.isFinite(offsetRaw)
      ? Math.max(0, Math.floor(offsetRaw))
      : 0;

    const [rows, total] = await Promise.all([
      prisma.stabilitySession.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.stabilitySession.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      data: { sessions: rows.map(toDTO), total },
    });
  } catch (error) {
    console.error("List stability sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
