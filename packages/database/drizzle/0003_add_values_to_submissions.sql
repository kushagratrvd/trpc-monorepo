ALTER TABLE "form_submissions" ADD COLUMN "values" json NOT NULL;--> statement-breakpoint
ALTER TABLE "form_submissions" DROP COLUMN IF EXISTS "value";--> statement-breakpoint
ALTER TABLE "form_submissions" DROP COLUMN IF EXISTS "updated_at";
