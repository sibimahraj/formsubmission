 getFormFieldsByScreenName = (stage: KeyWithAnyModel) => {
        let formFileds: Array<{}> = [];
            switch (stage.stages.stages[0].stageId.toLowerCase()) {
                case 'ssf-1': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['residency_status', 'ownership_status'])
                    break;
                }
                case 'ssf-2': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['residency_status', 'ownership_status', 'marital_status', 'gender', 'nationality', 'country_of_birth'])
                    break;
                }
                case 'bd-1': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['residency_status', 'ownership_status'])
                    break;
                }
                case 'bd-3': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['work_type', 'job_title', 'nature_of_employer'])
                    break;
                }
                case 'ld-1': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['required_annual_income', 'required_loan_amount', 'loan_tenor'])
                    break;
                }
 
            }
        return formFileds;
    }
