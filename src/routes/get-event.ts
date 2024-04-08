import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId",
    {
      schema: {
        summary: "Gets a especific event information.",
        tags: ["event"],
        params: z.object({
          eventId: z.string().uuid(),
        }),

        response: {
          200: z.object({
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              details: z.string().nullable(),
              slug: z.string(),
              maximumAtteendes: z.number().nullable(),
              attendeesCount: z.number(),
            }),
          }),
        },
      },
    },
    async (request, response) => {
      const { eventId } = request.params;

      const event = await prisma.events.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          slug: true,
          maximumAttendees: true,
          details: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });

      if (event === null) {
        throw new BadRequest("Event not found.");
      }

      return response.send({
        event: {
          id: event.id,
          title: event.title,
          details: event.details,
          slug: event.slug,
          maximumAtteendes: event.maximumAttendees,
          attendeesCount: event._count.attendees,
        },
      });
    }
  );
}
