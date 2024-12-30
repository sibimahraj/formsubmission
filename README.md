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







triggerAdobeEvent = (eventName: string, buttonName?: string, docResponse?: KeyWithAnyModel, errType?: string) => {
        if(getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload){
        const stage = store.getState();
        const appRefNo = getUrl.getChannelRefNo().applicationRefNo;
        if (stage && stage.stages && stage.stages.stages && stage.stages.stages.length > 0 && stage.stages.stages[0].stageInfo) {
            let stepName = getStepName(stage);
            let dataLayer: KeyWithAnyModel = this.getAdobeDataLayer(eventName, stage, stepName);
            if (eventName === 'formStart') {
                dataLayer.page.attributes.pfm = loginval();
                if (!(window.sessionStorage.isFromFFF === "true")) {
                    const aggregator_code = (stage.urlParam && stage.urlParam.aggregators && stage.urlParam.aggregators.aggregator_code) ? stage.urlParam.aggregators.aggregator_code : 'na';
                    const aggregator_type = (stage.urlParam && stage.urlParam.aggregators && stage.urlParam.aggregators.aggregator_type) ? stage.urlParam.aggregators.aggregator_type : 'na';
                    const aggregator_instance = (stage.urlParam && stage.urlParam.aggregators && stage.urlParam.aggregators.aggregator_instance) ? stage.urlParam.aggregators.aggregator_instance : 'na';
                    const intcid = localStorage.getItem("intcid") ? localStorage.getItem("intcid") : 'na';
                    if (intcid !== 'na') {
                        localStorage.removeItem("intcid");
                    }
                    const subchancode = 'na'
                    const refid = 'na'
                    const referId = 'na'
                    const instance = 'na'
                    const camp_id = 'na'
                    const pid = 'na'
                    const promoCode = 'na'
                    const promo = 'na'
                    const state = 'na'
                    dataLayer.campaign = {
                        internal: {
                            campaignName: 'aggregator_code:aggregator_type:aggregator_instance:intcid:subchancode:refid:referId:instance:camp_id:pid:promoCode:promo:state',
                            campaignValue: aggregator_code + ':' + aggregator_type + ':' + aggregator_instance + ':' + intcid + ':' + subchancode + ':' + refid + ':' + referId + ':' + instance + ':' + camp_id + ':' + pid + ':' + promoCode + ':' + promo + ':' + state
                        }
                    }
                } else {
                    delete window.sessionStorage.isFromFFF;
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'ctaClick') {
                const popupName = errType;
                if (buttonName === 'Continue') {
                    const stageId = stage.stages.stages[0].stageId;
                    if (stageId !== 'doc') {
                        dataLayer.form.formFields = this.getFormFieldsByScreenName(stage)
                    } else if (stageId === 'doc' && docResponse) {
                        dataLayer.form.formFields = this.documentList(docResponse);
                    }
                    if (stageId === 'rp') {
                        buttonName = 'Agree and Submit';
                    }
                }
                dataLayer.customLinkClick = {
                    'customLinkText': buttonName,
                    'customLinkRegion': buttonName === 'Login' ? 'top' : 'bottom',
                    'customLinkType': 'button'
                }
                if(popupName){
                    dataLayer.form.popupName = popupName;
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formStepCompletions') {
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                dataLayer.form.formFields = [
                    {
                        formFieldValue: 'na',
                        formFieldName: 'na'
                    }];
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formSubmit' && !window.adobeDataLayer.find((eachEvent: KeyWithAnyModel) => eachEvent.event === 'formSubmit')) {
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                dataLayer.form.appStatus = 'Complete';
                if (stage.stages.userInput.applicants.insurance_consent_a_1) {
                    dataLayer.form.formFields = [
                        {
                            formFieldValue: stage.stages.userInput.applicants.insurance_consent_a_1 === 'Y' ? 'Yes' : 'No',
                            formFieldName: 'Insurance product selected'
                        }];
                }
                else {
                    dataLayer.form.formFields = [
                        {
                            formFieldValue: 'na',
                            formFieldName: 'na'
                        }];
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formAbandonment' && !window.adobeDataLayer.find((eachEvent: KeyWithAnyModel) => ( eachEvent.event === 'formSubmit' || eachEvent.event === 'formAbandonment'))) {
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                dataLayer.form.formLastAccessedField = stage.lastAccessed.fieldFocused ? stage.lastAccessed.fieldFocused : 'na';
                dataLayer.form.formFields = [
                    {
                        formFieldValue: 'na',
                        formFieldName: 'na'
                    }];
                dataLayer.customLinkClick = {
                    'customLinkText': buttonName,
                    'customLinkRegion': buttonName === 'Login' ? 'top' : 'bottom',
                    'customLinkType': 'button'
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formError') {
                const error = store.getState().error.errors;
                const exception: KeyWithAnyModel = store.getState().error.exceptionList;
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                if (error.length > 0) {
                    dataLayer.error = [{
                        errorCode: error[0].statusCode ? error[0].statusCode : exception[0].error_type ? exception[0].error_type : 'na',
                        errorField: stepName,
                        errorDescription: error[0].statusText ? error[0].statusText : exception[0].status ? exception[0].status : 'na'
                    }]
                } 
                else if(exception && exception.errorList && exception.errorList.errors && exception.errorList.errors.length > 0){
                    dataLayer.error = [{
                        errorCode: exception.errorList.errors[0].code ? exception.errorList.errors[0].code : 'na',
                        errorField: stepName,
                        errorDescription: exception.errorList.errors[0].detail ? exception.errorList.errors[0].detail : exception.error_header
                    }]
                }  else {
                    dataLayer.error = [{
                        errorCode: 'na',
                        errorField: stepName,
                        errorDescription: 'na'
                    }]
                }
                dataLayer.customLinkClick = {
                    customLinkText: errType ? getErrorType(errType.toUpperCase()) : 'na',
                    customLinkRegion: 'bottom',
                    customLinkType: 'button'
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'popupViewed') {
                const lastEvent: KeyWithAnyModel =  window.adobeDataLayer[window.adobeDataLayer.length-1];
                if (!lastEvent || (lastEvent && lastEvent.event !== 'popupViewed')) {
                    dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                    dataLayer.form.formFields = [{
                        formFieldValue: 'na',
                        formFieldName: 'na'
                    }];
                    dataLayer.form.popupName = buttonName ? buttonName : 'na'
                    window.adobeDataLayer.push(dataLayer);
                }
            }
           
        }
    }
}


import trackEvents from './track-events';
import { store } from '../utils/store/store';
import { getUrl } from '../utils/common/change.utils';

jest.mock('../utils/store/store', () => ({
    store: {
        getState: jest.fn(),
    },
}));
jest.mock('../utils/common/change.utils', () => ({
    getUrl: {
        getParameterByName: jest.fn(),
        getChannelRefNo: jest.fn(),
    },
}));

describe('triggerAdobeEvent', () => {
    let serviceInstance: any;

    beforeEach(() => {
        serviceInstance = new trackEvents();
        global.window.adobeDataLayer = [];
        jest.clearAllMocks();
    });

    afterEach(() => {
        global.window.adobeDataLayer = [];
    });

    const mockStage = {
        stages: {
            isDocumentUpload: false,
            stages: [
                {
                    stageId: 'doc',
                    stageInfo: {},
                },
            ],
            userInput: {
                applicants: {
                    insurance_consent_a_1: 'Y',
                },
            },
        },
        lastAccessed: {
            fieldFocused: 'someField',
        },
        error: {
            errors: [{ statusCode: 400, statusText: 'Bad Request' }],
            exceptionList: {
                errorList: {
                    errors: [{ code: 'ERR01', detail: 'Invalid Data' }],
                },
                error_header: 'Validation Error',
            },
        },
    };

    const mockUrl = {
        applicationRefNo: '12345',
    };

    beforeEach(() => {
        getUrl.getParameterByName.mockReturnValue('value');
        getUrl.getChannelRefNo.mockReturnValue(mockUrl);
        store.getState.mockReturnValue(mockStage);
    });

    it('should handle "formStart" event', () => {
        serviceInstance.triggerAdobeEvent('formStart');
        expect(global.window.adobeDataLayer.length).toBe(1);
        expect(global.window.adobeDataLayer[0]).toHaveProperty('campaign');
    });

    it('should handle "ctaClick" event with Continue button', () => {
        serviceInstance.triggerAdobeEvent('ctaClick', 'Continue');
        expect(global.window.adobeDataLayer.length).toBe(1);
        expect(global.window.adobeDataLayer[0]).toHaveProperty('customLinkClick');
    });

    it('should handle "formSubmit" event', () => {
        serviceInstance.triggerAdobeEvent('formSubmit');
        expect(global.window.adobeDataLayer.length).toBe(1);
        expect(global.window.adobeDataLayer[0].form.appStatus).toBe('Complete');
    });

    it('should handle "formAbandonment" event', () => {
        serviceInstance.triggerAdobeEvent('formAbandonment');
        expect(global.window.adobeDataLayer.length).toBe(1);
        expect(global.window.adobeDataLayer[0].form.formLastAccessedField).toBe('someField');
    });

    it('should handle "formError" event with error data', () => {
        serviceInstance.triggerAdobeEvent('formError');
        expect(global.window.adobeDataLayer.length).toBe(1);
        expect(global.window.adobeDataLayer[0].error[0].errorCode).toBe('400');
    });

    it('should handle "formError" event with exception data', () => {
        mockStage.error.errors = [];
        serviceInstance.triggerAdobeEvent('formError');
        expect(global.window.adobeDataLayer.length).toBe(1);
        expect(global.window.adobeDataLayer[0].error[0].errorCode).toBe('ERR01');
    });

    it('should handle "popupViewed" event', () => {
        serviceInstance.triggerAdobeEvent('popupViewed', 'Sample Popup');
        expect(global.window.adobeDataLayer.length).toBe(1);
        expect(global.window.adobeDataLayer[0].form.popupName).toBe('Sample Popup');
    });

    it('should skip event when "auth" is "upload"', () => {
        getUrl.getParameterByName.mockReturnValue('upload');
        serviceInstance.triggerAdobeEvent('formStart');
        expect(global.window.adobeDataLayer.length).toBe(0);
    });

    it('should skip event when "isDocumentUpload" is true', () => {
        mockStage.stages.isDocumentUpload = true;
        serviceInstance.triggerAdobeEvent('formStart');
        expect(global.window.adobeDataLayer.length).toBe(0);
    });
});

 TypeError: _change.getUrl.getParameterByName.mockReturnValue is not a function

      72 |
      73 |     beforeEach(() => {
    > 74 |        (getUrl.getParameterByName as jest.Mock).mockReturnValue('value');
         |                                                 ^
      75 |        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue(mockUrl);
      76 |         (store.getState as jest.Mock).mockReturnValue(mockStage);
      77 |     });

      at Object.mockReturnValue (src/services/track-events.test.ts:74:49)
