import { asc, desc, db, eq, sql } from '@repo/database'
import { formFieldsTable, formsTable } from '@repo/database/schema'
import { createFormInput, listFormsByUserIdInput, ListFormsByUserIdInputType, type CreateFormInputType, getFormByIdInput, type GetFormByIdInputType, updateFormVisibilityInput, type UpdateFormVisibilityInputType, updateFormSettingsInput, type UpdateFormSettingsInputType } from './model'
import { ApiError } from "../errors"

class FormService {
    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy, visibility } = await createFormInput.parseAsync(payload)

        const result = await db.insert(formsTable).values({
            title,
            description,
            createdBy,
            visibility,
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

        const { id, title, description, visibility, createdBy, createdAt, updatedAt, password } = rows[0]!
        const hasPassword = !!password

        let fields: NonNullable<typeof rows[0]['field']>[] = []
        // Only return fields if there's no password, OR if the requester is the creator
        if (!hasPassword || requestUserId === createdBy) {
            fields = rows
                .filter(r => r.field?.id !== null)
                .map(r => r.field as NonNullable<typeof r.field>)
        }

        return { id, title, description, visibility, createdBy, createdAt, updatedAt, fields, hasPassword }
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
}

export default FormService