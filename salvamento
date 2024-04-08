import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z, { number } from "zod";
import { prisma } from "../lib/prisma";

export async function getEventAttendees(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Gets all attendees from an event.",
        tags: ["attendees"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        querystring: z.object({
          query: z.string().nullish(),
          pageindex: z.string().nullish().default("0").transform(Number),
        }),
        response: {
            200: z.object({
              attendees: z.array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                  email: z.string().email(),
                  createdAt: z.date(),
                  checkedAt: z.date().nullable(),
                })
              ),
            }),
          },
      },
    },
    async (request, response) => {
      const { eventId } = request.params;
      const { pageindex, query } = request.query;

      const attendees = await prisma.attendees.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          eventId: true,
          CheckIn: {
            select: {
              createdAt: true,
            },
          },
        },
        where: query
          ? {
              eventId,
              name: {
                contains: query,
              },
            }
          : {
              eventId,
            },

        take: 10,

        skip: pageindex * 10,

        orderBy: {
          createdAt: "desc",
        },
      });

      return response.send({
        attendees: attendees.map((attendee) => {
          return {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            createdAt: attendee.createdAt,
            checkedAt: attendee.CheckIn?.createdAt ?? null,
          };
        }),
      });
    }
  );
}
