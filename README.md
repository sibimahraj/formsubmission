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

    import trackEvents from "./track-events"; // Update the path if needed
import { store } from "../utils/store/store";

jest.mock('../utils/store/store', () => ({
    store: {
        getState: jest.fn(),
    },
}));

describe('getFormFields and getLabelName', () => {
    let serviceInstance: any;

    beforeEach(() => {
        serviceInstance = trackEvents;
    });

    describe('getFormFields', () => {
        it('should return an array of form fields when matching stage and logical field names are found', () => {
            const mockStage = {
                stages: {
                    stages: [
                        {
                            stageInfo: {
                                fieldMetaData: {
                                    data: {
                                        stages: [
                                            {
                                                stageId: 'stage1',
                                                fields: [
                                                    {
                                                        logical_field_name: 'field1',
                                                        rwb_label_name: 'Tenor & monthly repayment',
                                                        lov: 'Yes',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                },
            };
            jest.spyOn(serviceInstance, 'getFormFieldValue').mockReturnValue('Mocked Value');
            jest.spyOn(serviceInstance, 'getLabelName').mockReturnValue('Tenor');

            const result = serviceInstance.getFormFields('stage1', mockStage, ['field1']);
            expect(result).toEqual([
                {
                    formFieldValue: 'Mocked Value',
                    formFieldName: 'Tenor',
                },
            ]);
        });

        it('should return an empty array if no matching stage is found', () => {
            const mockStage = {
                stages: {
                    stages: [
                        {
                            stageInfo: {
                                fieldMetaData: {
                                    data: {
                                        stages: [],
                                    },
                                },
                            },
                        },
                    ],
                },
            };
            const result = serviceInstance.getFormFields('stage1', mockStage, ['field1']);
            expect(result).toEqual([]);
        });

        it('should return an empty array if no matching field is found', () => {
            const mockStage = {
                stages: {
                    stages: [
                        {
                            stageInfo: {
                                fieldMetaData: {
                                    data: {
                                        stages: [
                                            {
                                                stageId: 'stage1',
                                                fields: [],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                },
            };
            const result = serviceInstance.getFormFields('stage1', mockStage, ['field1']);
            expect(result).toEqual([]);
        });

        it('should correctly process multiple logical names', () => {
            const mockStage = {
                stages: {
                    stages: [
                        {
                            stageInfo: {
                                fieldMetaData: {
                                    data: {
                                        stages: [
                                            {
                                                stageId: 'stage1',
                                                fields: [
                                                    {
                                                        logical_field_name: 'field1',
                                                        rwb_label_name: 'Tenor & monthly repayment',
                                                        lov: 'Yes',
                                                    },
                                                    {
                                                        logical_field_name: 'field2',
                                                        rwb_label_name: 'Other Label',
                                                        lov: 'No',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                },
            };
            jest.spyOn(serviceInstance, 'getFormFieldValue').mockImplementation((logicalName) => {
                return logicalName === 'field1' ? 'Mocked Value 1' : 'Mocked Value 2';
            });
            jest.spyOn(serviceInstance, 'getLabelName').mockImplementation((label) => {
                return label === 'Tenor & monthly repayment' ? 'Tenor' : label;
            });

            const result = serviceInstance.getFormFields('stage1', mockStage, ['field1', 'field2']);
            expect(result).toEqual([
                {
                    formFieldValue: 'Mocked Value 1',
                    formFieldName: 'Tenor',
                },
                {
                    formFieldValue: 'Mocked Value 2',
                    formFieldName: 'Other Label',
                },
            ]);
        });
    });

    describe('getLabelName', () => {
        it('should return "Tenor" for the "Tenor & monthly repayment" label', () => {
            const result = serviceInstance.getLabelName('Tenor & monthly repayment');
            expect(result).toBe('Tenor');
        });

        it('should return the original label if it does not match a specific case', () => {
            const result = serviceInstance.getLabelName('Some Other Label');
            expect(result).toBe('Some Other Label');
        });
    });
});
