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


    describe('getFormFieldValue', () => {
    let serviceInstance: any;

    beforeEach(() => {
        serviceInstance = trackEvents;
    });

    it('should return "na" when no value is found in userInput or stageInfo', () => {
        const mockStage = {
            stages: {
                userInput: {
                    applicants: {},
                },
                stages: [
                    {
                        stageInfo: {
                            applicants: {},
                        },
                    },
                ],
            },
            lov: {
                lov: [],
            },
        };
        const result = serviceInstance.getFormFieldValue('residency_status', mockStage, 'Yes');
        expect(result).toEqual('na');
    });

    it('should return the correct CODE_DESC from lov when a match is found and lov is "Yes"', () => {
        const mockStage = {
            stages: {
                userInput: {
                    applicants: {
                        residency_status_a_1: 'value2',
                    },
                },
                stages: [
                    {
                        stageInfo: {
                            applicants: {},
                        },
                    },
                ],
            },
            lov: {
                lov: [
                    {
                        label: 'residency_status',
                        value: [
                            {
                                CODE_VALUE: 'value2',
                                CODE_DESC: 'Description 2',
                            },
                        ],
                    },
                ],
            },
        };
        const result = serviceInstance.getFormFieldValue('residency_status', mockStage, 'Yes');
        expect(result).toEqual('Description 2');
    });

    it('should return the value directly when lov is "No"', () => {
        const mockStage = {
            stages: {
                userInput: {
                    applicants: {
                        residency_status_a_1: 'value3',
                    },
                },
                stages: [
                    {
                        stageInfo: {
                            applicants: {},
                        },
                    },
                ],
            },
            lov: {
                lov: [],
            },
        };
        const result = serviceInstance.getFormFieldValue('residency_status', mockStage, 'No');
        expect(result).toEqual('value3');
    });

    it('should fallback to stageInfo value if userInput value is not available', () => {
        const mockStage = {
            stages: {
                userInput: {
                    applicants: {},
                },
                stages: [
                    {
                        stageInfo: {
                            applicants: {
                                residency_status_a_1: 'value4',
                            },
                        },
                    },
                ],
            },
            lov: {
                lov: [],
            },
        };
        const result = serviceInstance.getFormFieldValue('residency_status', mockStage, 'No');
        expect(result).toEqual('value4');
    });

    it('should return "na" if no matching label is found in lov', () => {
        const mockStage = {
            stages: {
                userInput: {
                    applicants: {
                        residency_status_a_1: 'value5',
                    },
                },
                stages: [
                    {
                        stageInfo: {
                            applicants: {},
                        },
                    },
                ],
            },
            lov: {
                lov: [
                    {
                        label: 'non_matching_label',
                        value: [
                            {
                                CODE_VALUE: 'value5',
                                CODE_DESC: 'Description 5',
                            },
                        ],
                    },
                ],
            },
        };
        const result = serviceInstance.getFormFieldValue('residency_status', mockStage, 'Yes');
        expect(result).toEqual('na');
    });

    it('should return "na" if lovData is null or undefined', () => {
        const mockStage = {
            stages: {
                userInput: {
                    applicants: {
                        residency_status_a_1: 'value6',
                    },
                },
                stages: [
                    {
                        stageInfo: {
                            applicants: {},
                        },
                    },
                ],
            },
            lov: {
                lov: null,
            },
        };
        const result = serviceInstance.getFormFieldValue('residency_status', mockStage, 'Yes');
        expect(result).toEqual('na');
    });
});
