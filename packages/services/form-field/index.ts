import { db, eq, asc, sql, max } from '@repo/database'
import { formFieldsTable } from '@repo/database/schema'
import {
    createFieldInput, type CreateFieldInputType,
    updateFieldInput, type updateFieldInputType,
    getFieldsInput, type getFieldsInputType,
    deleteFormFieldInput, type deleteFormFieldInputType,
} from './model'
import { ApiError } from "../errors"

function toLabelKey(label: string): string {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
}

class FormFieldService {

    private async getNextIndex(formId: string): Promise<string> {
        const result = await db
            .select({ maxIndex: max(formFieldsTable.index) })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
        
        const current = result[0]?.maxIndex
        const next = current ? parseFloat(current) + 1 : 1
        return next.toFixed(2)
    }

    public async createField(payload: CreateFieldInputType) {
        const { label, type, formId, description, placeholder, isRequired } =
            await createFieldInput.parseAsync(payload)

        const labelKey = toLabelKey(label)
        const index = await this.getNextIndex(formId)

        const result = await db.insert(formFieldsTable).values({
            label,
            labelKey,
            type,
            formId,
            description,
            placeholder,
            isRequired,
            index,
        }).returning({ id: formFieldsTable.id })

        if (!result || result.length === 0 || !result[0]?.id) {
            throw ApiError.internal('Failed to create form field', 'FIELD_CREATION_FAILED')
        }

        return { id: result[0].id, labelKey, index }
    }

    public async updateField(payload: updateFieldInputType) {
        const { fieldId, ...updates } =
            await updateFieldInput.parseAsync(payload)

        const patch: Partial<typeof formFieldsTable.$inferInsert> = {}
        if (updates.label !== undefined) patch.label = updates.label
        if (updates.type !== undefined) patch.type = updates.type
        if ('description' in updates) patch.description = updates.description ?? null
        if ('placeholder' in updates) patch.placeholder = updates.placeholder ?? null
        if (updates.isRequired !== undefined) patch.isRequired = updates.isRequired

        if (Object.keys(patch).length === 0) {
            throw ApiError.badRequest('No fields to update', 'NO_FIELDS_TO_UPDATE')
        }

        const result = await db
            .update(formFieldsTable)
            .set(patch)
            .where(eq(formFieldsTable.id, fieldId))
            .returning({ id: formFieldsTable.id })

        if (!result || result.length === 0 || !result[0]?.id) {
            throw ApiError.notFound(`Field with ID ${fieldId} not found or update failed.`, 'FIELD_NOT_FOUND')
        }

        return { id: result[0].id }
    }

    public async getFields(payload: getFieldsInputType) {
        const { formId } = await getFieldsInput.parseAsync(payload)

        const fields = await db
            .select({
                id: formFieldsTable.id,
                label: formFieldsTable.label,
                labelKey: formFieldsTable.labelKey,
                type: formFieldsTable.type,
                description: formFieldsTable.description,
                placeholder: formFieldsTable.placeholder,
                isRequired: formFieldsTable.isRequired,
                index: formFieldsTable.index,
                createdAt: formFieldsTable.createdAt,
                updatedAt: formFieldsTable.updatedAt,
            })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(asc(formFieldsTable.index))

        return { fields }
    }

    public async deleteField(payload: deleteFormFieldInputType) {
        const { fieldId } = await deleteFormFieldInput.parseAsync(payload)

        const result = await db
            .delete(formFieldsTable)
            .where(eq(formFieldsTable.id, fieldId))
            .returning({ id: formFieldsTable.id })

        if (!result || result.length === 0 || !result[0]?.id) {
            throw ApiError.notFound(`Field with ID ${fieldId} not found or delete failed.`, 'FIELD_NOT_FOUND')
        }

        return { id: result[0].id }
    }
}

export default FormFieldService
