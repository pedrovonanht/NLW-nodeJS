-- CreateTable
CREATE TABLE "attendees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created-at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event-id" TEXT NOT NULL,
    CONSTRAINT "attendees_event-id_fkey" FOREIGN KEY ("event-id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
