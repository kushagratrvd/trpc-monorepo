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
    updateFormSettingsInputModel,
    updateFormSettingsOutputModel,
    getFormAnalyticsInputModel,
    getFormAnalyticsOutputModel,
    cloneFormInputModel,
    cloneFormOutputModel,
    updateFormInputModel,
    updateFormOutputModel,
    getDashboardStatsOutputModel,
} from "./model";
import { generatePath } from "../../utils/path-generator";
import { formService, formFieldService, formSubmissionService, userService } from "../../services";
import { AVAILABLE_THEMES } from "@repo/services/form/constants";
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

    getFields: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/getFields'),
            tags: TAGS,
        }
    })
        .input(getFieldsInputModel)
        .output(getFieldsOutputModel)
        .query(async ({ input, ctx }) => {
            let requestUserId: string | undefined = undefined;
            const userToken = getAuthenticationCookie(ctx);
            if (userToken) {
                try {
                    const { id } = await userService.verifyAndDecodeUserToken(userToken);
                    requestUserId = id;
                } catch (e) {
                    // Ignore, anonymous
                }
            }
            const { formId, password } = input
            return formFieldService.getFields({ formId, password, requestUserId })
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
        .query(async ({ input, ctx }) => {
            let requestUserId: string | undefined = undefined;
            const userToken = getAuthenticationCookie(ctx);
            if (userToken) {
                try {
                    const { id } = await userService.verifyAndDecodeUserToken(userToken);
                    requestUserId = id;
                } catch (e) {
                    // Ignore, anonymous
                }
            }
            const { formId } = input
            const form = await formService.getFormById({ formId, requestUserId })
            
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
        .query(async ({ input, ctx }) => {
            const { formId } = input
            return formService.getFormById({ formId, requestUserId: ctx.user.id })
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

    updateFormSettings: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/updateFormSettings'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(updateFormSettingsInputModel)
        .output(updateFormSettingsOutputModel)
        .mutation(async ({ input }) => {
            return formService.updateFormSettings(input)
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

    cloneForm: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/cloneForm'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(cloneFormInputModel)
        .output(cloneFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            return formService.cloneForm({ formId: input.formId, userId: ctx.user.id })
        }),

    updateForm: authenticatedProcedure.meta({
        openapi: {
            method: 'POST',
            path: getPath('/updateForm'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(updateFormInputModel)
        .output(updateFormOutputModel)
        .mutation(async ({ input }) => {
            return formService.updateForm(input)
        }),

    getDashboardStats: authenticatedProcedure.meta({
        openapi: {
            method: 'GET',
            path: getPath('/getDashboardStats'),
            tags: TAGS,
            protect: true,
        }
    })
        .input(z.undefined())
        .output(getDashboardStatsOutputModel)
        .query(async ({ ctx }) => {
            return formService.getDashboardStats({ userId: ctx.user.id })
        }),

    getAvailableThemes: publicProcedure.meta({
        openapi: {
            method: 'GET',
            path: getPath('/getAvailableThemes'),
            tags: TAGS,
        }
    })
        .input(z.undefined())
        .output(z.array(z.string()))
        .query(async () => {
            return [...AVAILABLE_THEMES];
        }),
});