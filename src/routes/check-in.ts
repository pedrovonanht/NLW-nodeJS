import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function checkIn(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:attendeeId/check-in",
    {
      schema: {
        summary: "Creates check-in to an attendee.",
        tags: ["check-ins"],
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
      },
    },
    async (request, response) => {
      const { attendeeId } = request.params;

      const attendeeCheckIn = await prisma.checkIn.findUnique({
        where: {
          attendeesId: attendeeId,
        },
      });

      if (attendeeCheckIn !== null) {
        throw new Error("User already checked in.");
      }

      const attendeeExists = await prisma.attendees.findUnique({
        where: {
          id: attendeeId,
        },
      });

      if (attendeeExists === null) {
        throw new BadRequest("Attende not found.");
      }

      const createCheckIn = await prisma.checkIn.create({
        data: {
          attendeesId: attendeeId,
        },
      });
      return response.status(201).send(`User ${attendeeId} create successfuly`);
    }
  );
}
