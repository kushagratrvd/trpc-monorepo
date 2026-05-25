import { db, desc, eq, sql } from "@repo/database";
import { formSubmissionTable, formsTable } from "@repo/database/schema";
import { ApiError } from "../errors";

import {
    submitFormInput,
    type SubmitFormInputType,
    type GetFormSubmissionsInputType,
    getFormSubmissionsInput,
} from './model'

class FormSubmissionService {
    public async submitForm(payload: SubmitFormInputType){
        const { formId, values } = await submitFormInput.parseAsync(payload)
        
        const formRow = await db.select({ visibility: formsTable.visibility }).from(formsTable).where(eq(formsTable.id, formId));
        if (formRow.length === 0) {
            throw ApiError.notFound('Form not found', 'FORM_NOT_FOUND')
        }
        
        if (formRow[0]!.visibility === 'UNPUBLISHED') {
            throw ApiError.forbidden('Form is unpublished and cannot accept submissions', 'FORM_UNPUBLISHED')
        }
        
        const result = await db
            .insert(formSubmissionTable)
            .values({ formId, values })
            .returning({ id: formSubmissionTable.id })

        if(!result || result.length === 0 || !result[0]?.id) {
            throw ApiError.internal('Failed to submit form', 'SUBMISSION_FAILED')
        }
        
        return { id: result[0].id }
    }

    public async getFormSubmissions(payload: GetFormSubmissionsInputType) {
        const { formId } = await getFormSubmissionsInput.parseAsync(payload)

        return await db
            .select({
                id: formSubmissionTable.id,
                values: formSubmissionTable.values,
                createdAt: formSubmissionTable.createdAt,
            })
            .from(formSubmissionTable)
            .where(eq(formSubmissionTable.formId, formId))
            .orderBy(desc(formSubmissionTable.createdAt))
    }

    public async getFormAnalytics(payload: { formId: string }) {
        const { formId } = payload;
        
        // 1. Total Submissions Count
        const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(formSubmissionTable)
            .where(eq(formSubmissionTable.formId, formId));
        const totalSubmissions = countResult?.count ?? 0;

        // 2. Response breakdown grouped by field and answer value
        const rawBreakdown = await db.execute(sql`
            SELECT 
                elem->>'formFieldId' AS "fieldId",
                elem->>'value' AS "value",
                COUNT(*)::int AS "count"
            FROM ${formSubmissionTable}
            CROSS JOIN LATERAL json_array_elements(${formSubmissionTable.values}) AS elem
            WHERE ${formSubmissionTable.formId} = ${formId}::uuid
            GROUP BY elem->>'formFieldId', elem->>'value'
            ORDER BY "count" DESC
        `);
        
        // 3. Response timeline grouped by day
        const timelineRaw = await db.execute(sql`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM-DD') AS "date",
                COUNT(*)::int AS "count"
            FROM ${formSubmissionTable}
            WHERE form_id = ${formId}::uuid
            GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
            ORDER BY "date" ASC
        `);

        return {
            totalSubmissions,
            breakdown: (rawBreakdown.rows as any[]) || [],
            timeline: (timelineRaw.rows as any[]) || [],
        };
    }
}

export default FormSubmissionService;