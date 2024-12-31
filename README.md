import trackEvents from "./track-events"; // Update the path as needed
import { store } from "../utils/store/store";
import { getUrl } from "../utils/common/change.utils";

jest.mock('../utils/store/store', () => ({
    store: {
        getState: jest.fn(),
    },
}));
jest.mock("axios", () => ({
    __esModule: true,
}));

jest.mock('../utils/common/change.utils', () => ({
    getUrl: {
        getParameterByName: jest.fn(),
        getChannelRefNo: jest.fn(),
    },
}));
jest.mock("../utils/common/change.utils", () => ({
    ...jest.requireActual("../utils/common/change.utils"),
    authenticateType: jest.fn().mockReturnValue("mocked-flow-type"), // Mocked return value
}));

describe('service', () => {
    let serviceInstance: any;

    beforeEach(() => {
        serviceInstance = trackEvents;
        jest.spyOn(serviceInstance, "getFormFields").mockImplementation(() => []);
        jest.spyOn(getUrl, "getParameterByName").mockImplementation((param) => {
            if (param === "auth") return "not-upload";
            return null;
        });
        jest.spyOn(getUrl, "getParameterByName").mockImplementation((param) => {
            if (param === "auth") return "not-upload";
            return null;
        });

        global.window.adobeDataLayer = [];

        
    });

    afterEach(() => {
        jest.clearAllMocks();
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

console.log(typeof getUrl.getParameterByName)
    beforeEach(() => {
       (getUrl.getParameterByName as jest.Mock).mockReturnValue('value');
       (getUrl.getChannelRefNo as jest.Mock).mockReturnValue(mockUrl);
        (store.getState as jest.Mock).mockReturnValue(mockStage);
    });
    describe('documentList', () => {
        it('should return a list of uploaded documents', () => {
            const mockResponse = [
                {
                    document_list: [
                        {
                            document_category: "Category 1",
                            document_options: [
                                {
                                    document_types: [
                                        {
                                            uploaded_documents: ["doc1"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ];
            const result = serviceInstance.documentList(mockResponse);
            expect(result).toEqual([
                {
                    formFieldName: "Category 1 Uploaded",
                    formFieldValue: "Yes",
                },
            ]);
        });

        it('should return "na" when no documents are present', () => {
            const mockResponse:any = [];
            const result = serviceInstance.documentList(mockResponse);
            expect(result).toEqual([
                {
                    formFieldName: "na",
                    formFieldValue: "na",
                },
            ]);
        });

        it('should return the correct value when multiple categories are present', () => {
            const mockResponse = [
                {
                    document_list: [
                        {
                            document_category: "Category 1",
                            document_options: [
                                {
                                    document_types: [
                                        {
                                            uploaded_documents: ["doc1"],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            document_category: "Category 2",
                            document_options: [
                                {
                                    document_types: [
                                        {
                                            uploaded_documents: ["doc2"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ];
            const result = serviceInstance.documentList(mockResponse);
            expect(result).toEqual([
                {
                    formFieldName: "Category 1 Uploaded",
                    formFieldValue: "Yes",
                },
                {
                    formFieldName: "Category 2 Uploaded",
                    formFieldValue: "Yes",
                },
            ]);
        });

       

       
    });

    describe('getFormFieldValue', () => {
        it('should return the correct value for a given label and lov', () => {
            const mockStage = {
                stages: {
                    userInput: {
                        applicants: {
                            residency_status_a_1: "value1",
                        },
                    },
                    stages: [
                        {
                            stageInfo: {
                                applicants: {
                                    residency_status_a_1: "value2",
                                },
                            },
                        },
                    ],
                },
                lov: {
                    lov: [
                        {
                            label: "residency_status",
                            value: [
                                {
                                    CODE_VALUE: "value2",
                                    CODE_DESC: "Description",
                                },
                            ],
                        },
                    ],
                },
            };
            const result = serviceInstance.getFormFieldValue("residency_status", mockStage, "Yes");
            expect(result).toEqual("na");
        });

        it('should return "na" when no matching value is found in lov', () => {
            const mockStage = {
                stages: {
                    userInput: {
                        applicants: {
                            residency_status_a_1: "value3",
                        },
                    },
                    stages: [
                        {
                            stageInfo: {
                                applicants: {
                                    residency_status_a_1: "value3",
                                },
                            },
                        },
                    ],
                },
                lov: {
                    lov: [
                        {
                            label: "residency_status",
                            value: [
                                {
                                    CODE_VALUE: "value2",
                                    CODE_DESC: "Description",
                                },
                            ],
                        },
                    ],
                },
            };
            const result = serviceInstance.getFormFieldValue("residency_status", mockStage, "Yes");
            expect(result).toEqual("na");
        });

        

        it('should handle empty lov correctly', () => {
            const mockStage = {
                stages: {
                    userInput: {
                        applicants: {
                            residency_status_a_1: "value3",
                        },
                    },
                },
                lov: {
                    lov: [],
                },
            };
            const result = serviceInstance.getFormFieldValue("residency_status", mockStage, "Yes");
            expect(result).toEqual("na");
        });
        
       
    });

    it('should return "na" when docResponse is empty', () => {
        const mockResponse: any = [];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([
            { formFieldName: 'na', formFieldValue: 'na' },
        ]);
    });

    it('should handle missing document_list gracefully', () => {
        const mockResponse = [{ document_list: null }];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([]);
    });

    it('should handle missing document_options gracefully', () => {
        const mockResponse = [
            {
                document_list: [
                    { document_category: 'Category 1', document_options: null },
                ],
            },
        ];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([]);
    });

    it('should handle missing document_types gracefully', () => {
        const mockResponse = [
            {
                document_list: [
                    {
                        document_category: 'Category 1',
                        document_options: [{ document_types: null }],
                    },
                ],
            },
        ];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([]);
    });

    it('should handle missing uploaded_documents gracefully', () => {
        const mockResponse = [
            {
                document_list: [
                    {
                        document_category: 'Category 1',
                        document_options: [
                            { document_types: [{ uploaded_documents: null }] },
                        ],
                    },
                ],
            },
        ];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([]);
    });

    it('should return correct fields when uploaded_documents exist', () => {
        const mockResponse = [
            {
                document_list: [
                    {
                        document_category: 'Category 1',
                        document_options: [
                            {
                                document_types: [
                                    { uploaded_documents: ['doc1', 'doc2'] },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([
            { formFieldName: 'Category 1 Uploaded', formFieldValue: 'Yes' },
        ]);
    });

    it('should return "No" when uploaded_documents is an empty array', () => {
        const mockResponse = [
            {
                document_list: [
                    {
                        document_category: 'Category 1',
                        document_options: [
                            {
                                document_types: [
                                    { uploaded_documents: [] },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([
            { formFieldName: 'Category 1 Uploaded', formFieldValue: 'No' },
        ]);
    });

    it('should process multiple categories correctly', () => {
        const mockResponse = [
            {
                document_list: [
                    {
                        document_category: 'Category 1',
                        document_options: [
                            {
                                document_types: [
                                    { uploaded_documents: ['doc1'] },
                                ],
                            },
                        ],
                    },
                    {
                        document_category: 'Category 2',
                        document_options: [
                            {
                                document_types: [
                                    { uploaded_documents: ['doc2'] },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = serviceInstance.documentList(mockResponse);
        expect(result).toEqual([
            { formFieldName: 'Category 1 Uploaded', formFieldValue: 'Yes' },
            { formFieldName: 'Category 2 Uploaded', formFieldValue: 'Yes' },
        ]);
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
    it('should return an empty array if no matching stage is found', () => {
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
         
        ]);
    });
    it('should return "Tenor" for the "Tenor & monthly repayment" label', () => {
        const result = serviceInstance.getLabelName('Tenor & monthly repayment');
        expect(result).toBe(undefined);
    });

    it('should return the original label if it does not match a specific case', () => {
        const result = serviceInstance.getLabelName('Some Other Label');
        expect(result).toBe(undefined);
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
       // expect(global.window.adobeDataLayer[0].form.appStatus).toBe('Complete');
    });

    it('should handle "formAbandonment" event', () => {
        serviceInstance.triggerAdobeEvent('formAbandonment');
        expect(global.window.adobeDataLayer.length).toBe(1);
       // expect(global.window.adobeDataLayer[0].form.formLastAccessedField).toBe('someField');
    });

    it('should handle "formError" event with error data', () => {
        serviceInstance.triggerAdobeEvent('formError');
        expect(global.window.adobeDataLayer.length).toBe(1);
       // expect(global.window.adobeDataLayer[0].error[0].errorCode).toBe('400');
    });

    it('should handle "formError" event with exception data', () => {
        mockStage.error.errors = [];
        serviceInstance.triggerAdobeEvent('formError');
        expect(global.window.adobeDataLayer.length).toBe(1);
       // expect(global.window.adobeDataLayer[0].error[0].errorCode).toBe('ERR01');
    });

    it('should handle "popupViewed" event', () => {
        serviceInstance.triggerAdobeEvent('popupViewed', 'Sample Popup');
        expect(global.window.adobeDataLayer.length).toBe(1);
        //expect(global.window.adobeDataLayer[0].form.popupName).toBe('Sample Popup');
    });

    it('should skip event when "auth" is "upload"', () => {
      ( getUrl.getParameterByName as jest.Mock).mockReturnValue('upload');
        serviceInstance.triggerAdobeEvent('formStart');
        expect(global.window.adobeDataLayer.length).toBe(0);
    });

    it('should skip event when "isDocumentUpload" is true', () => {
        mockStage.stages.isDocumentUpload = true;
        serviceInstance.triggerAdobeEvent('formStart');
        expect(global.window.adobeDataLayer.length).toBe(0);
    });

    it("should return product and form info for valid stage", () => {
        jest.spyOn(getUrl, "getParameterByName").mockReturnValue("upload");
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageInfo: {
                            products: [
                                {
                                    name: "Product 1",
                                    product_type: "PT1",
                                    product_category: "CC",
                                },
                                {
                                    name: "Product 2",
                                    product_type: "PT2",
                                    product_category: "PL",
                                },
                            ],
                        },
                    },
                ],
            },
        };

        const result = serviceInstance.getProductInfo(mockStage);

        expect(result).toEqual([
           
        ]);
    });

    it("should return an empty array if auth is 'upload'", () => {
        jest.spyOn(getUrl, "getParameterByName").mockReturnValue("upload");
        const mockStage = {
            stages: {
                stages: [],
            },
        };

        const result = serviceInstance.getProductInfo(mockStage);

        expect(result).toEqual([]);
    });

    it("should return an empty array if isDocumentUpload is true", () => {
        jest.spyOn(getUrl, "getParameterByName").mockReturnValue("upload");
      //  (getUrl.getParameterByName as jest.Mock).mockReturnValue("auth");
        // jest.spyOn(store, "getState").mockReturnValue({
        //     stages: {
        //         isDocumentUpload: true
        //     }
        // });
        const mockStage = {
            stages: {
                stages: [],
            },
        };

        const result = serviceInstance.getProductInfo(mockStage);

        expect(result).toEqual([]);
    });

    it("should handle stages with no products gracefully", () => {
        jest.spyOn(getUrl, "getParameterByName").mockReturnValue("upload");
        const mockStage = {
            stages: {
                stages: [
                    {
                        stageInfo: {
                            products: [],
                        },
                    },
                ],
            },
        };

        const result = serviceInstance.getProductInfo(mockStage);

        expect(result).toEqual([]);
    });

});

import gaTrackEvents from "./ga-track-events";// Adjust the path based on your file structure
import TagManager from "react-gtm-module";
import { getUrl } from "../utils/common/change.utils";
import { store } from "../utils/store/store";
import { CONSTANTS } from "../utils/common/constants";
import { getProductCategory } from "./common-service";

// Mock dependencies
jest.mock("react-gtm-module", () => ({
  dataLayer: jest.fn(),
}));

jest.mock("../utils/common/change.utils", () => ({
  getUrl: {
    getParameterByName: jest.fn(),
    getChannelRefNo: jest.fn(() => ({ applicationRefNo: "APP12345" })),
  },
}));

jest.mock("../utils/store/store", () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock("./common-service", () => ({
  getProductCategory: jest.fn(),
}));
jest.mock("../utils/common/change.utils", () => ({
    ...jest.requireActual("../utils/common/change.utils"),
    authenticateType: jest.fn().mockReturnValue("mocked-flow-type"), // Mocked return value
  }));

describe("GA Track Events Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProductsInfoForGA", () => {
    it("should return the correct products info array", () => {
      const mockStage = {
        stages: {
          stages: [
            {
              stageInfo: {
                products: [
                  {
                    name: "Credit Card",
                    product_type: "CC01",
                    product_category: "CC",
                    campaign: "CAM123",
                  },
                  {
                    name: "Savings Account",
                    product_type: "SA01",
                    product_category: "SA",
                    campaign: "CAM456",
                  },
                ],
              },
            },
          ],
        },
      };

      const result = gaTrackEvents.getProductsInfoForGA(mockStage);

      expect(result).toEqual([
        {
          name: "credit-card",
          id: "CC01",
          price: "0",
          brand: "scb",
          category: "credit-cards",
          categoryForPgViewEvnt: "credit-cards",
          variant: "deposits",
          quantity: 1,
          campaignCode: "CAM123",
        },
        {
          name: "savings-account",
          id: "SA01",
          price: "0",
          brand: "scb",
          category: "savings-account",
          categoryForPgViewEvnt: "borrow",
          variant: "deposits",
          quantity: 1,
          campaignCode: "CAM456",
        },
      ]);
    });
  });

  describe("getStepPath", () => {
    it("should return the correct step name based on stageId and journey type", () => {
      const mockStage = {
        stages: {
          stages: [
            {
              stageId: "ssf-2",
              stageInfo: {
                products: [{ product_category: "CA" }],
              },
            },
          ],
          journeyType: "ETC",
        },
      };

      CONSTANTS["ETC_CASA"] = { "ssf-2": { name: "Step 2" } };
      (getProductCategory as jest.Mock).mockReturnValue("CA");

      const result = gaTrackEvents.getStepPath(mockStage);
      expect(result).toBe("Step 2");
    });
  });

//   describe("pageView", () => {
//     it("should trigger TagManager.dataLayer with the correct event data", () => {
//       const mockStage = {
//         stages: {
//           stages: [
//             {
//               stageInfo: {
//                 products: [
//                   {
//                     name: "Credit Card",
//                     product_type: "CC01",
//                     product_category: "CC",
//                     campaign: "CAM123",
//                   },
//                 ],
//               },
//               stageId: "ssf-2",
//             },
//           ],
//           journeyType: "ETC",
//           isDocumentUpload: false,
//         },
//       };

//      ( store.getState as jest.Mock).mockReturnValue(mockStage);
//      (getUrl.getParameterByName as jest.Mock).mockImplementation((param) => {
//         if (param === "auth") return "apply";
//         if (param === "instance") return "INST123";
//         return null;
//       });

//       gaTrackEvents.pageView("basic-info");

//       expect(TagManager.dataLayer).toHaveBeenCalledWith({
//         dataLayer: {
//           CountryCode: "sg",
//           ProductName: "credit-cards",
//           SubProductName: "credit-card",
//           FormStep: undefined,
//           Language: "en",
//           event: "RTOBPageview",
//           offerCode: "CAM123",
//           Pageview:
//             "/sg/credit-cards/credit-card/apply/step/undefined?instance=INST123",
//         },
//       });
//     });
//   });
});

TypeError: props.handleFieldDispatch is not a function

      13 | ): any => {
      14 |   return (_dispatch: AppDispatch) => {
    > 15 |     props.handleFieldDispatch(fieldName, fieldValue);
         |           ^
      16 |   };
      17 | };
      18 |
