import { prisma } from "../src/lib/prisma"

async function seed() {
    await prisma.events.create({
        data: {
            title: "evento de teste",
            details: "um evento de teste",
            slug: "evento-de-teste"
        }
    })
}

seed().then(() => {
    console.log("Database seeded!")
})