import { db, eq } from "@repo/database";
import { formSubmissionTable } from "@repo/database/schema";

import {
    submitFormInput,
    type SubmitFormInputType
} from './model'

class FormSubmissionService {
    public async submitForm(payload: SubmitFormInputType){
        const { formId, values } = await submitFormInput.parseAsync(payload)
        
        const result = await db
            .insert(formSubmissionTable)
            .values({ formId, values })
            .returning({ id: formSubmissionTable.id })

        if(!result || result.length === 0 || !result[0]?.id) {
            throw new Error('Failed to submit form')
        }
        
        return { id: result[0].id }
    }
}

export default FormSubmissionService