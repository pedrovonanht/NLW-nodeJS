import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { title } from "process";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeBadge(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:attendeeId/badge",
    {
      schema: {
        summary: "Gets informations about an attendee",
        tags: ["attendees"],
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),

        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string().email(),
              title: z.string(),
              checkInURL: z.string().url(),
            })
          })
        }
      },
    },
    async (request, response) => {
      const { attendeeId } = request.params;

      const attendee = await prisma.attendees.findUnique({
        select: {
          name: true,
          email: true,
          event: {
            select: {
                title: true,
            }
          }
        },
        where: {
          id: attendeeId,
        },
      });
      if (attendee === null) {
        throw new BadRequest("Attendee not found.");
      }

      const baseURL = `${request.protocol}://${request.hostname}`

      const checkInURL = new URL(`/attendee/${attendeeId}/check-in`,baseURL)

      return response.send({ 
        badge: {
          name: attendee.name,
          email: attendee.email,
          title: attendee.event.title,
          checkInURL: checkInURL.toString()
        }
       });
    }
  );
}
