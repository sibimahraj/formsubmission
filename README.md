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
        global.window.adobeDataLayer = [];
    });

    afterEach(() => {
        jest.clearAllMocks();
        global.window.adobeDataLayer = [];
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

        it('should return "na" when document options are empty', () => {
            const mockResponse = [
                {
                    document_list: [
                        {
                            document_category: "Category 1",
                            document_options: [],
                        },
                    ],
                },
            ];
            const result = serviceInstance.documentList(mockResponse);
            expect(result).toEqual([
                {
                    formFieldName: "Category 1 Uploaded",
                    formFieldValue: "na",
                },
            ]);
        });

        it('should handle missing document list correctly', () => {
            const mockResponse = [{}]; // Missing document_list
            const result = serviceInstance.documentList(mockResponse);
            expect(result).toEqual([
                {
                    formFieldName: "na",
                    formFieldValue: "na",
                },
            ]);
        });

        it('should handle missing document options correctly', () => {
            const mockResponse = [
                {
                    document_list: [
                        {
                            document_category: "Category 1",
                        },
                    ],
                },
            ];
            const result = serviceInstance.documentList(mockResponse);
            expect(result).toEqual([
                {
                    formFieldName: "Category 1 Uploaded",
                    formFieldValue: "na",
                },
            ]);
        });

        it('should handle missing category name correctly', () => {
            const mockResponse = [
                {
                    document_list: [
                        {
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
                    formFieldName: "na",
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

        it('should return the correct value when the stage does not contain the field', () => {
            const mockStage = {
                stages: {
                    userInput: {
                        applicants: {},
                    },
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

        it('should handle missing lov gracefully', () => {
            const mockStage = {
                stages: {
                    userInput: {
                        applicants: {
                            residency_status_a_1: "value3",
                        },
                    },
                },
            };
            const result = serviceInstance.getFormFieldValue("residency_status", mockStage, "Yes");
            expect(result).toEqual("na");
        });

        it('should handle missing stages gracefully', () => {
            const mockStage = {
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

        it('should handle unexpected stage structure gracefully', () => {
            const mockStage = {
                stages: [],
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

        it('should return "na" if there is no CODE_VALUE in lov', () => {
            const mockStage = {
                stages: {
                    userInput: {
                        applicants: {
                            residency_status_a_1: "value3",
                        },
                    },
                },
                lov: {
                    lov: [
                        {
                            label: "residency_status",
                            value: [{}], // Missing CODE_VALUE
                        },
                    ],
                },
            };
            const result = serviceInstance.getFormFieldValue("residency_status", mockStage, "Yes");
            expect(result).toEqual("na");
        });
    });
});
