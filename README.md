 getFormFieldValue = (labelName: string, stage: KeyWithAnyModel, lov: string) => {
        let finalValue = 'na';
        let stageApplicant = labelName.concat('_a_1')
        let value = (stage.stages.userInput && stage.stages.userInput.applicants) ? stage.stages.userInput.applicants[stageApplicant] : null;
        Iif (!value) {
            value = (stage.stages.stages[0].stageInfo.applicants) ? stage.stages.stages[0].stageInfo.applicants[stageApplicant] : null;
        }
        Eif (value) {
            if (lov === 'Yes') {
                const lovData = stage.lov.lov;
                Eif (lovData) {
                    const lovValues = lovData.find((lovs: KeyWithAnyModel) => lovs.label === labelName);
                    if (lovValues) {
                        const lovValue = lovValues.value.find((lov: KeyWithAnyModel) => lov.CODE_VALUE === value)
                        Iif (lovValue) {
                            finalValue = lovValue.CODE_DESC;
                        }
                    }
                }
            } else Eif (lov === 'No') {
                finalValue = value;
            }
 
        }
        return finalValue;
    }
