import { z } from 'zod'

export const createFormInputModel = z.object({
    title: z.string().max(55).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
})


export const createFormOutputModel = z.object({
    id: z.string().describe('ID of the created form')
})

export const listFormsOutputModel = z.array(
    z.object({
        id: z.string().uuid().describe('UUID of the form'),
        title: z.string().max(55).describe('Title of the form'),
        description: z.string().max(300).optional().describe('Description of the form'),
        createdAt: z.date().nullable().describe('Creation date of the form'),
        updatedAt: z.date().nullable().describe('Updation date of the form'),
    })
).describe('List of forms')


const fieldType = z.enum(['TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD'])

const formFieldObject = z.object({
    id: z.string().uuid().describe('UUID of the field'),
    label: z.string().describe('Display label'),
    labelKey: z.string().describe('Immutable slug key'),
    type: fieldType,
    description: z.string().nullable().optional().describe('Description of the field'),
    placeholder: z.string().nullable().optional().describe('Placeholder for the field'),
    isRequired: z.boolean().describe('Whether the field is required'),
    index: z.string().describe('Fractional index for ordering'),
})

export const getFieldsInputModel = z.object({
    formId: z.string().uuid().describe('UUID of the form'),
})

export const getFieldsOutputModel = z.object({
    fields: z.array(formFieldObject),
})

export const createFieldInputModel = z.object({
    formId: z.string().uuid().describe('UUID of the form'),
    label: z.string().max(55).describe('Display label'),
    type: fieldType,
    description: z.string().max(300).optional().describe('Description of the field'),
    placeholder: z.string().max(300).optional().describe('Placeholder for the field'),
    isRequired: z.boolean().optional().default(false).describe('Whether the field is required'),
})

export const createFieldOutputModel = z.object({
    id: z.string().describe('UUID of the created field'),
    labelKey: z.string().describe('Generated slug key'),
    index: z.string().describe('Assigned fractional index'),
})

export const deleteFieldInputModel = z.object({
    fieldId: z.string().uuid().describe('UUID of the field to delete'),
})

export const deleteFieldOutputModel = z.object({
    id: z.string().describe('UUID of the deleted field'),
})

export const updateFieldInputModel = z.object({
    fieldId: z.string().uuid().describe('UUID of the field to update'),
    label: z.string().max(55).optional().describe('Display label'),
    labelKey: z.string().optional().describe('Immutable slug key'),
    type: fieldType.optional(),
    description: z.string().max(300).optional().describe('Description of the field'),
    placeholder: z.string().max(300).optional().describe('Placeholder for the field'),
    isRequired: z.boolean().optional().default(false).describe('Whether the field is required'),
})

export const updateFieldOutputModel = z.object({
    id: z.string().describe('UUID of the updated field'),
})

export const getFormInputModel = z.object({
    formId: z.string().uuid().describe('UUID of the form'),
})

export const getFormOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
    fields: z.array(formFieldObject),
}).nullable()

export const submitFormInputModel = z.object({
    formId: z.string().uuid().describe('UUID of the form being submitted'),
    values: z.array(z.object({
        formFieldId: z.string().uuid().describe('UUID of the form field'),
        value: z.string().describe('Value of the form field'),
    })).min(1, 'At least one field is required').describe('Array of form field values'),
})

export const submitFormOutputModel = z.object({
    id: z.string().describe('UUID of the submitted form'),
})

export const getFormSubmissionsInputModel = z.object({
    formId: z.string().uuid().describe('UUID of the form to get submissions for'),
})

export const getFormSubmissionsOutputModel = z.array(
    z.object({
        id: z.string().uuid(),
        values: z.array(
            z.object({
                formFieldId: z.string().uuid(),
                value: z.string(),
            })
        ).nullable(),
        createdAt: z.date().nullable(),
    })
)
