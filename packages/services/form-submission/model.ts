import { z } from 'zod'

export const formSubmissionValueInput = z.object({
    formFieldId: z.string().uuid().describe('UUID of the form field'),
    value: z.string().describe('Value of the form field'),
})

export const submitFormInput = z.object({
    formId: z.string().uuid().describe('UUID of the form being submitted'),
    values: z.array(formSubmissionValueInput).describe('Array of field values'),
    password: z.string().optional().describe('Optional password to unlock the submission'),
})

export const getFormSubmissionsInput = z.object({
    formId: z.string().uuid().describe('UUID of the form to get submissions for'),
})

export type SubmitFormInputType = z.infer<typeof submitFormInput>
export type GetFormSubmissionsInputType = z.infer<typeof getFormSubmissionsInput>