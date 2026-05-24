import { asc, db } from '@repo/database'
import { formFieldsTable, formsTable } from '@repo/database/schema'
import { createFormInput, listFormsByUserIdInput, ListFormsByUserIdInputType, type CreateFormInputType, getFormByIdInput, type GetFormByIdInputType } from './model'
import { eq } from '@repo/database'

class FormService {
    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy } = await createFormInput.parseAsync(payload)

        const result = await db.insert(formsTable).values({
            title,
            description,
            createdBy
        }).returning({ id: formsTable.id, })

        if(!result || result.length === 0 || !result[0]?.id) {
            throw new Error('Failed to create form')
        }
        
        return { id: result[0].id }
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType){
        const { userId } = await listFormsByUserIdInput.parseAsync(payload)

        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            createdAt: formsTable.createdAt,
            updatedAt: formsTable.updatedAt,
        }).from(formsTable).where(eq(formsTable.createdBy, userId))

        return { forms } 
    }

    public async getFormById(payload: GetFormByIdInputType) {
        const { formId } = await getFormByIdInput.parseAsync(payload)

        const rows = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            createdAt: formsTable.createdAt,
            updatedAt: formsTable.updatedAt,
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

        const { id, title, description, createdAt, updatedAt } = rows[0]!
        const fields = rows
            .filter(r => r.field?.id !== null)
            .map(r => r.field as NonNullable<typeof r.field>)

        return { id, title, description, createdAt, updatedAt, fields }
    }
}

export default FormService