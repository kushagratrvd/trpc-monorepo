import { z } from 'zod'

export const submitFormInput = z.object({
    formId: z.string().uuid().describe('UUID of the form being submitted'),
    values: z.array(z.object({
        formFieldId: z.string().uuid().describe('UUID of the form field'),
        value: z.string().describe('Value of the form field'),
    })).min(1, 'At least one field is required').describe('Array of form field values'),
})

export type SubmitFormInputType = z.infer<typeof submitFormInput>