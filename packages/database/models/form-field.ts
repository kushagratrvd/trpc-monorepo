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
  jsonb
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const fieldTypeEnum = pgEnum('field_type_enum', [
  'TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD', 'LONG_TEXT', 'SINGLE_SELECT', 'MULTI_SELECT'
])

export const formFieldsTable = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 60 }).notNull(),
  labelKey: varchar("label_key", { length: 100 }).notNull(),
  description: text("description"),
  placeholder: text("placeholder"),

  isRequired: boolean("is_required").default(false).notNull(),
  index: numeric("index", { scale: 2 }).notNull(), //1.2

  type: fieldTypeEnum('type').notNull(),

  options: jsonb('options').$type<string[]>(),

  formId: uuid('form_id').references(() => formsTable.id),


  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => {
  return {
    uniqueFormIdAndIndex: unique().on(table.formId, table.index)
  }
});

