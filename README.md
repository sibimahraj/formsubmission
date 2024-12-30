 getFormFields(stageId: string, stage: KeyWithAnyModel, logicalNames: Array<string>){
        let formFields: Array<{}> = [];
        logicalNames.forEach(logicalName => {
            const currentStage = stage.stages.stages[0].stageInfo.fieldMetaData.data.stages.find((stage : KeyWithAnyModel) => stage.stageId === stageId);
            if(currentStage){
               const field = currentStage.fields.find( (field : KeyWithAnyModel) => field.logical_field_name === logicalName)
                if(field){
                    formFields.push({
                        formFieldValue : this.getFormFieldValue(logicalName, stage, field.lov),
                        formFieldName : this.getLabelName(field.rwb_label_name)
                    })
                }
            }
        })
        return formFields ;
    }
 
    getLabelName(label: string) {
        switch (label) {
            case 'Tenor & monthly repayment': {
                return 'Tenor';
            }
            default: {
                return label;
            }
        }
    }
