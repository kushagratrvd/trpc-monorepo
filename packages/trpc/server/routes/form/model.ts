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


