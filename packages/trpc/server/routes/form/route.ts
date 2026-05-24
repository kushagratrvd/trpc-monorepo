import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import {
    createFormInputModel,
    createFormOutputModel,
    listFormsOutputModel,
    getFieldsInputModel,
    getFieldsOutputModel,
    createFieldInputModel,
    createFieldOutputModel,
    deleteFieldInputModel,
    deleteFieldOutputModel,
    updateFieldInputModel,
    updateFieldOutputModel,
    getFormInputModel,
    getFormOutputModel,
} from "./model";
import { generatePath } from "../../utils/path-generator";
import { formService, formFieldService } from "../../services";
import { z } from "zod";

const TAGS = ["form"];
const getPath = generatePath("/form");

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("createForm"), tags: TAGS, protect: true } })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { title, description } = input;
            
            const { id } = await formService.createForm({
                title,
                description,
                createdBy: ctx.user.id,
            });

            return { id };
        }),

    listForms: authenticatedProcedure.meta({
        openapi: { method: "POST", path: getPath("listForms"), tags: TAGS, protect: true }
    })
    .input(z.undefined())
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
        const {forms} = await formService.listFormsByUserId({userId: ctx.user.id})
        return forms
    }),

    getFields: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/getFields'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(getFieldsInputModel)
        .output(getFieldsOutputModel)
        .query(async ({ input }) => {
            const { formId } = input
            return formFieldService.getFields({ formId })
        }),

    createField: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/createField'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(createFieldInputModel)
        .output(createFieldOutputModel)
        .mutation(async ({ input }) => {
            const { formId, label, description, placeholder, isRequired, type } = input
            return formFieldService.createField({ formId, label, description, placeholder, isRequired, type })
        }),

    deleteField: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/deleteField'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(deleteFieldInputModel)
        .output(deleteFieldOutputModel)
        .mutation(async ({ input }) => {
            const { fieldId } = input
            return formFieldService.deleteField({ fieldId })
        }),

    updateField: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/updateField'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(updateFieldInputModel)
        .output(updateFieldOutputModel)
        .mutation(async ({ input }) => {
            const { fieldId, label, description, placeholder, isRequired, type } = input
            return formFieldService.updateField({ fieldId, label, description, placeholder, isRequired, type })
        }),

    getForm: publicProcedure.meta({
        openapi: {
            method: 'GET',
            path: getPath('/getForm'),
            tags: TAGS,
        }
    })
        .input(getFormInputModel)
        .output(getFormOutputModel)
        .query(async ({ input }) => {
            const { formId } = input
            return formService.getFormById({ formId })
        }),

    
});