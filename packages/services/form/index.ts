import { asc, desc, db, eq, sql, and } from '@repo/database'
import { formFieldsTable, formsTable } from '@repo/database/schema'
import { createFormInput, listFormsByUserIdInput, ListFormsByUserIdInputType, type CreateFormInputType, getFormByIdInput, type GetFormByIdInputType, updateFormVisibilityInput, type UpdateFormVisibilityInputType, updateFormSettingsInput, type UpdateFormSettingsInputType, updateFormInput, type UpdateFormInputType, getDashboardStatsInput, type GetDashboardStatsInputType, cloneFormInput, type CloneFormInputType } from './model'
import { formSubmissionTable } from '@repo/database/schema'
import { ApiError } from "../errors"

class FormService {
    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy, visibility, theme } = await createFormInput.parseAsync(payload)

        const result = await db.insert(formsTable).values({
            title,
            description,
            createdBy,
            visibility,
            theme,
        }).returning({ id: formsTable.id, })

        if(!result || result.length === 0 || !result[0]?.id) {
            throw ApiError.internal("Failed to create form", "FORM_CREATION_FAILED")
        }
        
        return { id: result[0].id }
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType){
        const { userId } = await listFormsByUserIdInput.parseAsync(payload)

        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            visibility: formsTable.visibility,
            theme: formsTable.theme,
            createdAt: formsTable.createdAt,
            updatedAt: formsTable.updatedAt,
        }).from(formsTable).where(eq(formsTable.createdBy, userId))

        return { forms } 
    }

    public async listPublicForms() {
        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            visibility: formsTable.visibility,
            theme: formsTable.theme,
            createdAt: formsTable.createdAt,
            fieldCount: sql<number>`count(${formFieldsTable.id})::int`
        }).from(formsTable)
          .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
          .where(eq(formsTable.visibility, 'PUBLIC'))
          .groupBy(formsTable.id)
          .orderBy(desc(formsTable.createdAt));
        
        return forms;
    }

    public async getFormById(payload: GetFormByIdInputType & { requestUserId?: string }) {
        const { formId, requestUserId } = payload

        const rows = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            visibility: formsTable.visibility,
            theme: formsTable.theme,
            createdBy: formsTable.createdBy,
            createdAt: formsTable.createdAt,
            updatedAt: formsTable.updatedAt,
            password: formsTable.password,
            field: {
                id: formFieldsTable.id,
                label: formFieldsTable.label,
                labelKey: formFieldsTable.labelKey,
                type: formFieldsTable.type,
                description: formFieldsTable.description,
                isRequired: formFieldsTable.isRequired,
                placeholder: formFieldsTable.placeholder,
                index: formFieldsTable.index,
            }
        }).from(formsTable)
            .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
            .where(eq(formsTable.id, formId))
            .orderBy(asc(formFieldsTable.index))

        if (rows.length === 0) {
            return null
        }

        const { id, title, description, visibility, theme, createdBy, createdAt, updatedAt, password } = rows[0]!
        const hasPassword = !!password

        let fields: NonNullable<typeof rows[0]['field']>[] = []
        // Only return fields if there's no password, OR if the requester is the creator
        if (!hasPassword || requestUserId === createdBy) {
            fields = rows
                .filter(r => r.field?.id !== null)
                .map(r => r.field as NonNullable<typeof r.field>)
        }

        return { id, title, description, visibility, theme, createdBy, createdAt, updatedAt, fields, hasPassword }
    }

    public async updateFormVisibility(payload: UpdateFormVisibilityInputType) {
        const { formId, visibility } = await updateFormVisibilityInput.parseAsync(payload)
        
        await db.update(formsTable)
            .set({ visibility })
            .where(eq(formsTable.id, formId))
            
        return { success: true }
    }

    public async updateFormSettings(payload: UpdateFormSettingsInputType) {
        const { formId, password } = await updateFormSettingsInput.parseAsync(payload)
        
        await db.update(formsTable)
            .set({ password: password || null })
            .where(eq(formsTable.id, formId))
            
        return { success: true }
    }

    public async updateForm(payload: UpdateFormInputType) {
        const { formId, title, description, theme } = await updateFormInput.parseAsync(payload)

        const updates: Record<string, any> = {}
        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description
        if (theme !== undefined) updates.theme = theme

        if (Object.keys(updates).length === 0) {
            return { success: true }
        }

        await db.update(formsTable)
            .set(updates)
            .where(eq(formsTable.id, formId))

        return { success: true }
    }

    public async getDashboardStats(payload: GetDashboardStatsInputType) {
        const { userId } = await getDashboardStatsInput.parseAsync(payload)

        const [formsCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(formsTable)
            .where(eq(formsTable.createdBy, userId))
        const totalForms = formsCount?.count ?? 0

        const [publicCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(formsTable)
            .where(and(eq(formsTable.createdBy, userId), eq(formsTable.visibility, 'PUBLIC')))
        const activePublicForms = publicCount?.count ?? 0

        const { rows } = await db.execute(sql`
            SELECT COUNT(*)::int AS count
            FROM form_submissions fs
            WHERE fs.form_id IN (
                SELECT id FROM forms WHERE created_by = ${userId}::uuid
            )
        `)
        const subsCount = rows[0]
        const totalSubmissions = (subsCount as any)?.count ?? 0

        const recentForms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            visibility: formsTable.visibility,
            theme: formsTable.theme,
            createdAt: formsTable.createdAt,
        }).from(formsTable)
            .where(eq(formsTable.createdBy, userId))
            .orderBy(desc(formsTable.createdAt))
            .limit(5)

        return {
            totalForms,
            totalSubmissions,
            activePublicForms,
            recentForms,
        }
    }

    public async cloneForm(payload: CloneFormInputType) {
        const { formId, userId } = await cloneFormInput.parseAsync(payload)

        const sourceForm = await db.select().from(formsTable).where(eq(formsTable.id, formId)).then(r => r[0])
        if (!sourceForm) {
            throw ApiError.notFound("Form not found", "FORM_NOT_FOUND")
        }

        if (sourceForm.createdBy !== userId) {
            throw ApiError.forbidden("You can only clone your own forms", "FORBIDDEN")
        }

        const suffix = " (Copy)"
        const newTitle = sourceForm.title.slice(0, 55 - suffix.length) + suffix

        const sourceFields = await db.select()
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(asc(formFieldsTable.index))

        // Transaction: insert form + duplicate all fields atomically
        const result = await db.transaction(async (tx) => {
            const [newForm] = await tx.insert(formsTable).values({
                title: newTitle,
                description: sourceForm.description,
                password: sourceForm.password,
                visibility: 'UNPUBLISHED',
                theme: sourceForm.theme,
                createdBy: userId,
            }).returning({ id: formsTable.id })

            if (!newForm?.id) {
                throw ApiError.internal("Failed to clone form", "CLONE_FAILED")
            }

            if (sourceFields.length > 0) {
                await tx.insert(formFieldsTable).values(
                    sourceFields.map(f => ({
                        formId: newForm.id,
                        label: f.label,
                        labelKey: f.labelKey,
                        type: f.type,
                        description: f.description,
                        placeholder: f.placeholder,
                        isRequired: f.isRequired,
                        index: f.index,
                        options: f.options,
                    }))
                )
            }

            return { id: newForm.id }
        })

        return result
    }
}

export default FormService
