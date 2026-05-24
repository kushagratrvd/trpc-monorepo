import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  numeric,
  pgEnum,
  unique,
  json
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { formFieldsTable } from "./form-field";

export interface FormSubmissionValue {
  formFieldId: string
  value: string
}

export type FormSubmissionValueRow = FormSubmissionValue[]

export const formSubmissionTable = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid('form_id').references(() => formsTable.id),
  formFieldId: uuid('form_field_id').references(() => formFieldsTable.id),

  values: json("values").$type<FormSubmissionValue[]>().notNull(),

  createdAt: timestamp("created_at").defaultNow(),
})

