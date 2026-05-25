import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import {
    createFormInputModel,
    createFormOutputModel,
    listFormsOutputModel,
    listPublicFormsOutputModel,
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
    getFormForEditorOutputModel,
    submitFormInputModel,
    submitFormOutputModel,
    getFormSubmissionsOutputModel,
    getFormSubmissionsInputModel,
    updateFormVisibilityInputModel,
    updateFormVisibilityOutputModel,
    getFormAnalyticsInputModel,
    getFormAnalyticsOutputModel,
} from "./model";
import { generatePath } from "../../utils/path-generator";
import { formService, formFieldService, formSubmissionService, userService } from "../../services";
import { z } from "zod";
import { getAuthenticationCookie } from "../../utils/cookie";

const TAGS = ["form"];
const getPath = generatePath("/form");

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("createForm"), tags: TAGS, protect: true } })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { title, description, visibility } = input;
            
            const { id } = await formService.createForm({
                title,
                description,
                visibility,
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

    listPublicForms: publicProcedure.meta({
        openapi: { method: "GET", path: getPath("listPublicForms"), tags: TAGS }
    })
    .input(z.undefined())
    .output(listPublicFormsOutputModel)
    .query(async () => {
        return formService.listPublicForms();
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
            const form = await formService.getFormById({ formId })
            
            if (form?.visibility === 'UNPUBLISHED') {
                return null;
            }
            
            return form;
        }),

    getFormForEditor: authenticatedProcedure.meta({
        openapi: {
            method: 'GET',
            path: getPath('/getFormForEditor'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(getFormInputModel)
        .output(getFormForEditorOutputModel)
        .query(async ({ input }) => {
            const { formId } = input
            return formService.getFormById({ formId })
        }),

    updateFormVisibility: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/updateFormVisibility'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(updateFormVisibilityInputModel)
        .output(updateFormVisibilityOutputModel)
        .mutation(async ({ input }) => {
            return formService.updateFormVisibility(input)
        }),

    submitForm: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/submitForm'),
            tags: TAGS,
        }
    })
        .input(submitFormInputModel)
        .output(submitFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            let userId: string | undefined = undefined;
            const userToken = getAuthenticationCookie(ctx);
            if (userToken) {
                try {
                    const { id } = await userService.verifyAndDecodeUserToken(userToken);
                    userId = id;
                } catch (e) {
                    // Token expired or invalid, treat as anonymous
                }
            }
            return formSubmissionService.submitForm({ ...input, userId })
        }),

    getFormSubmissions: authenticatedProcedure.meta({
        openapi: {
            method: 'GET',
            path: getPath('/getFormSubmissions'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(getFormSubmissionsInputModel)
        .output(getFormSubmissionsOutputModel)
        .query(async ({ input }) => {
            const { formId } = input
            return formSubmissionService.getFormSubmissions({ formId })
        }),

    getFormAnalytics: authenticatedProcedure.meta({
        openapi: {
            method: 'GET',
            path: getPath('/getFormAnalytics'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(getFormAnalyticsInputModel)
        .output(getFormAnalyticsOutputModel)
        .query(async ({ input, ctx }) => {
            const { formId } = input
            
            // Ownership check
            const form = await formService.getFormById({ formId })
            if (!form) {
                throw new Error("Form not found")
            }
            if (form.createdBy !== ctx.user.id) {
                throw new Error("Unauthorized access to form analytics")
            }
            
            return formSubmissionService.getFormAnalytics({ formId })
        }),
});