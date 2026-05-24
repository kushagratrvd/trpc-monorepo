import { z } from 'zod'

const fieldTypeEnum = z.enum(['TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD'])

export const createFieldInput = z.object({
    label: z.string().max(100).describe('Display label for the field'),
    type: fieldTypeEnum.describe('Type of the field'),
    formId: z.string().uuid().describe('UUID of the form that this field belongs to'),
    description: z.string().optional().describe('Helper text shown below the field'),
    placeholder: z.string().optional().describe('Placeholder text shown inside the field'),
    isRequired: z.boolean().optional().default(false).describe('Whether the field is required'),
})

export type CreateFieldInputType = z.infer<typeof createFieldInput>

export const updateFieldInput = z.object({
    fieldId: z.string().uuid().describe('UUID of the field to update'),
    label: z.string().max(100).optional().describe('Display label for the field'),
    type: fieldTypeEnum.optional().describe('Type of the field'),
    description: z.string().optional().describe('Helper text shown below the field'),
    placeholder: z.string().optional().describe('Placeholder text shown inside the field'),
    isRequired: z.boolean().optional().default(false).describe('Whether the field is required'),
})

export type updateFieldInputType = z.infer<typeof updateFieldInput>

export const getFieldsInput = z.object({
    formId: z.string().uuid().describe('UUID of the form to fetch fields for'),
})

export type getFieldsInputType = z.infer<typeof getFieldsInput>

export const deleteFormFieldInput = z.object({
    fieldId: z.string().uuid().describe('UUID of the field to delete'),
})

export type deleteFormFieldInputType = z.infer<typeof deleteFormFieldInput>