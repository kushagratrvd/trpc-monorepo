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
  json,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { formFieldsTable } from "./form-field";
import { usersTable } from "./user";

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

  submittedBy: uuid('submitted_by').references(() => usersTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    uniqueFormIdAndSubmittedBy: uniqueIndex("form_submissions_form_id_submitted_by_idx").on(table.formId, table.submittedBy)
  }
})

