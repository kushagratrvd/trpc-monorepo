import { db, desc, eq, sql, and } from "@repo/database";
import { formSubmissionTable, formsTable, formFieldsTable, usersTable } from "@repo/database/schema";
import { ApiError } from "../errors";
import EmailService from "../email";

import {
    submitFormInput,
    type SubmitFormInputType,
    type GetFormSubmissionsInputType,
    getFormSubmissionsInput,
} from './model'

class FormSubmissionService {
    public async submitForm(payload: SubmitFormInputType & { userId?: string }){
        const { formId, values } = await submitFormInput.parseAsync(payload)
        const { userId } = payload;
        
        const formRow = await db.select({ 
            visibility: formsTable.visibility,
            title: formsTable.title,
            creatorId: formsTable.createdBy,
            password: formsTable.password
        }).from(formsTable).where(eq(formsTable.id, formId));
        
        if (formRow.length === 0) {
            throw ApiError.notFound('Form not found', 'FORM_NOT_FOUND')
        }
        
        const visibility = formRow[0]!.visibility;
        
        let creatorEmail: string | undefined;
        if (formRow[0]!.creatorId) {
            const creatorRow = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, formRow[0]!.creatorId));
            creatorEmail = creatorRow[0]?.email;
        }
        
        if (visibility === 'UNPUBLISHED') {
            throw ApiError.forbidden('Form is unpublished and cannot accept submissions', 'FORM_UNPUBLISHED')
        }

        if (visibility === 'UNLISTED' && !userId) {
            throw ApiError.unauthorized('You must be logged in to submit an unlisted form', 'UNAUTHORIZED')
        }

        const dbPassword = formRow[0]!.password;
        if (dbPassword && userId !== formRow[0]!.creatorId) {
            if (!payload.password || payload.password !== dbPassword) {
                throw ApiError.unauthorized('Invalid or missing password for this form', 'INVALID_PASSWORD')
            }
        }

        if (userId) {
            const existingSubmissions = await db.select({ id: formSubmissionTable.id })
                .from(formSubmissionTable)
                .where(and(
                    eq(formSubmissionTable.formId, formId),
                    eq(formSubmissionTable.submittedBy, userId)
                ))
                .limit(1);

            if (existingSubmissions.length > 0) {
                throw ApiError.conflict('You have already submitted a response to this form', 'ALREADY_SUBMITTED')
            }
        }

        // Defense-in-depth: Validate submitted fields against actual form schema
        const formFields = await db.select().from(formFieldsTable).where(eq(formFieldsTable.formId, formId));
        const activeFieldMap = new Map(formFields.map(f => [f.id, f]));
        const submittedValuesMap = new Map(values.map(v => [v.formFieldId, v.value]));

        // Check for unknown fields
        for (const val of values) {
            if (!activeFieldMap.has(val.formFieldId)) {
                throw ApiError.badRequest(`Unknown form field: ${val.formFieldId}`, 'INVALID_FIELD');
            }
        }

        // Enforce required fields and formats
        for (const field of formFields) {
            const val = submittedValuesMap.get(field.id);
            const isProvided = val !== undefined && val.trim() !== '';

            if (field.isRequired && !isProvided) {
                throw ApiError.badRequest(`Field "${field.label}" is required`, 'REQUIRED_FIELD_MISSING');
            }

            if (isProvided) {
                if (field.type === 'EMAIL') {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val!)) {
                        throw ApiError.badRequest(`Field "${field.label}" must be a valid email`, 'INVALID_EMAIL');
                    }
                } else if (field.type === 'NUMBER') {
                    if (isNaN(Number(val))) {
                        throw ApiError.badRequest(`Field "${field.label}" must be a number`, 'INVALID_NUMBER');
                    }
                } else if (field.type === 'YES_NO') {
                    if (val !== 'true' && val !== 'false') {
                        throw ApiError.badRequest(`Field "${field.label}" must be yes or no`, 'INVALID_BOOLEAN');
                    }
                } else if (field.type === 'SINGLE_SELECT') {
                    if (field.options && field.options.length > 0 && !field.options.includes(val!)) {
                        throw ApiError.badRequest(`Field "${field.label}" value must be one of the provided options`, 'INVALID_OPTION');
                    }
                } else if (field.type === 'MULTI_SELECT') {
                    if (field.options && field.options.length > 0) {
                        try {
                            const selectedOptions = JSON.parse(val!);
                            if (!Array.isArray(selectedOptions)) {
                                throw new Error();
                            }
                            for (const selected of selectedOptions) {
                                if (!field.options.includes(selected)) {
                                    throw ApiError.badRequest(`Field "${field.label}" contains an invalid option: ${selected}`, 'INVALID_MULTI_OPTION');
                                }
                            }
                        } catch (e) {
                            if (e instanceof ApiError) throw e;
                            throw ApiError.badRequest(`Field "${field.label}" must be a valid JSON array of options`, 'INVALID_MULTI_SELECT_FORMAT');
                        }
                    }
                }
            }
        }
        
        const result = await db
            .insert(formSubmissionTable)
            .values({ formId, values, submittedBy: userId || null })
            .returning({ id: formSubmissionTable.id })

        if(!result || result.length === 0 || !result[0]?.id) {
            throw ApiError.internal('Failed to submit form', 'SUBMISSION_FAILED')
        }
        
        // Fire and forget email notification
        if (creatorEmail) {
            const prettyValues = formFields.map(f => {
                const val = submittedValuesMap.get(f.id);
                return { label: f.label, value: val || '' };
            });
            EmailService.sendNewSubmissionNotification(creatorEmail, formRow[0]!.title, prettyValues).catch(console.error);
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