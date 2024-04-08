import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { error } from "console";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/events",
    {
      schema: {
        summary: "Creates a register from an attendee for an event",
        tags: ["event"],
        body: z.object({
          name: z.string(),
          email: z.string().email(),
        }),

        params: z.object({
          eventId: z.string().uuid(),
        }),

        response: {
          201: z.object({
            attendeeId: z.number().int(),
          }),
        },
      },
    },
    async (request, response) => {
      const { eventId } = request.params;
      const { name, email } = request.body;

      //verifica se email igual já foi registrado no evento
      const attendeeFromEmail = await prisma.attendees.findUnique({
        where: {
          eventId_email: {
            email,
            eventId,
          },
        },
      });

      if (attendeeFromEmail !== null) {
        throw new BadRequest("This email is already registered for this event.");
      }

      //verifica se o número máximo de participantes do evento já foi atingido
      const amountOfAttendesOnEvent = await prisma.attendees.count({
        where: {
          eventId,
        },
      });

      const event = await prisma.events.findUnique({
        where: {
          id: eventId,
        },
      });

      if (
        event?.maximumAttendees &&
        amountOfAttendesOnEvent >= event?.maximumAttendees
      ) {
        throw new BadRequest(
          "The limit of attendees for this event has been reached."
        );
      }

      //cria o participante no evento e retorna a response 201 com o id do participante
      const attendees = await prisma.attendees.create({
        data: {
          email,
          name,
          eventId: eventId,
        },
      });
      return response.status(201).send({ attendeeId: attendees.id });
    }
  );
}
