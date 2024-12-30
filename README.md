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

describe("getFormFieldsByScreenName", () => {
    let serviceInstance: any;

    beforeEach(() => {
        serviceInstance = new trackEvents(); // Replace with the correct class/instance initialization
        jest.spyOn(serviceInstance, "getFormFields").mockImplementation(() => []);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call getFormFields with correct arguments for 'ssf-1'", () => {
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageId: "SSF-1",
                    },
                ],
            },
        };
        serviceInstance.getFormFieldsByScreenName(mockStage);
        expect(serviceInstance.getFormFields).toHaveBeenCalledWith(
            "ssf-1",
            mockStage,
            ["residency_status", "ownership_status"]
        );
    });

    it("should call getFormFields with correct arguments for 'ssf-2'", () => {
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageId: "SSF-2",
                    },
                ],
            },
        };
        serviceInstance.getFormFieldsByScreenName(mockStage);
        expect(serviceInstance.getFormFields).toHaveBeenCalledWith(
            "ssf-2",
            mockStage,
            [
                "residency_status",
                "ownership_status",
                "marital_status",
                "gender",
                "nationality",
                "country_of_birth",
            ]
        );
    });

    it("should call getFormFields with correct arguments for 'bd-1'", () => {
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageId: "BD-1",
                    },
                ],
            },
        };
        serviceInstance.getFormFieldsByScreenName(mockStage);
        expect(serviceInstance.getFormFields).toHaveBeenCalledWith(
            "bd-1",
            mockStage,
            ["residency_status", "ownership_status"]
        );
    });

    it("should call getFormFields with correct arguments for 'bd-3'", () => {
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageId: "BD-3",
                    },
                ],
            },
        };
        serviceInstance.getFormFieldsByScreenName(mockStage);
        expect(serviceInstance.getFormFields).toHaveBeenCalledWith(
            "bd-3",
            mockStage,
            ["work_type", "job_title", "nature_of_employer"]
        );
    });

    it("should call getFormFields with correct arguments for 'ld-1'", () => {
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageId: "LD-1",
                    },
                ],
            },
        };
        serviceInstance.getFormFieldsByScreenName(mockStage);
        expect(serviceInstance.getFormFields).toHaveBeenCalledWith(
            "ld-1",
            mockStage,
            ["required_annual_income", "required_loan_amount", "loan_tenor"]
        );
    });

    it("should return an empty array for unknown stageId", () => {
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageId: "UNKNOWN",
                    },
                ],
            },
        };
        const result = serviceInstance.getFormFieldsByScreenName(mockStage);
        expect(result).toEqual([]);
        expect(serviceInstance.getFormFields).not.toHaveBeenCalled();
    });
});
