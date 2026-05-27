import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formVisibilityEnum = pgEnum('form_visibility', [
  'PUBLIC', 'UNLISTED', 'UNPUBLISHED'
]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 55 }).notNull(),

  description: varchar("description", { length: 300 }),
  createdBy: uuid('created_by').references(() => usersTable.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  password: varchar("password", { length: 255 }),
  visibility: formVisibilityEnum("visibility").default("UNPUBLISHED").notNull(),
  theme: varchar("theme", { length: 255 }).default('blank'),
});
