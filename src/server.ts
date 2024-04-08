import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

import {
  ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeBadge } from "./routes/get-attendee-badge";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import { errorHandler } from "./error-handler";
import { fastifyCors } from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: '*',
})


app.register(fastifySwagger, {
  swagger: {
    consumes: ["aplication/json"],
    produces: ["aplication/json"],
    info: {
      title: "pass.in",
      description: "Especificações da API feita para o back-end da aplicação pass-in desenvolvida durante a NWL-UNITE da rockeatseat",
      version: "1.0.0"
    }
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: "/docs"
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeBadge);
app.register(checkIn);
app.register(getEventAttendees);

app.setErrorHandler(errorHandler)

app.listen({ port: 3334}).then(() => {
  console.log("HTTP server running!");
});
