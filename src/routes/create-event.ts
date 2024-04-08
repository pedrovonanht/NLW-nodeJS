import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { generateSlug } from "../utils/generate-slug";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { BadRequest } from "./_errors/bad-request";

export async function createEvent (app:FastifyInstance) {
  app
  .withTypeProvider<ZodTypeProvider>()
  .post("/events/", {
    schema: {
        summary: "Creates a event.",
        tags: ["event"],
        body: z.object({
            title: z.string().min(4),
            details: z.string().nullable(),
            maximumAttendees: z.number().int().positive().nullable(),
          }),
        response: {
            201: z.object({
                eventId: z.string().uuid()
            })
        }
    }
  }, 
  async (request, response) => {
    
    const { maximumAttendees, details, title } = request.body


    const slug = generateSlug(title);

    const eventWithSameSlug = await prisma.events.findUnique({
      where: {
        slug,
      },
    });

    if (eventWithSameSlug !== null) {
      throw new BadRequest("Another event with same title alredy exists.");
    }

    const event = await prisma.events.create({
      data: {
        title,
        details,
        maximumAttendees,
        slug,
      },
    });

    return response.status(201).send({ eventId: event.id });
  });

}

