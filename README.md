import React from "react";
export const DocumentUploadRadioButton = (props:any) => {
  return (
    <>
      <div className="document-upload__file-upload">
        <div className="radioWithLabel">
          <div key={props.documentList.document_types[0].document_type_code}>
            <label htmlFor={props.documentList.document_types[0].document_type_code}>
              <input
                type="radio"
                name={props.documentTypes.document_category_code}
                id={props.documentList.document_types[0].document_type_code}
                onClick={() => {
                    props.setCheckedFlag(
                    props.documentTypes.document_category_code,
                    props.documentList.document_types[0].document_type_code
                  );
                  props.documentList.document_types[0].uploaded_documents = [
                    {
                      document_type_code:
                      props.documentList.document_types[0].document_type_code,
                      document_status: "UPLOAD",
                    },
                  ];
                }}
              />
              <span>{props.documentList.document_types[0].document_type}</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentUploadRadioButton;


import { render, screen, fireEvent } from "@testing-library/react";
import DocumentUploadRadioButton from "./DocumentUploadRadioButton";

describe("DocumentUploadRadioButton Component", () => {
  const mockSetCheckedFlag = jest.fn();

  const mockProps = {
    documentList: {
      document_types: [
        {
          document_type_code: "DOC_TYPE_1",
          document_type: "Passport",
          uploaded_documents: [],
        },
      ],
    },
    documentTypes: {
      document_category_code: "CATEGORY_1",
    },
    setCheckedFlag: mockSetCheckedFlag,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the radio button with the correct label", () => {
    render(<DocumentUploadRadioButton {...mockProps} />);

    // Assert that the radio button and its label are rendered
    expect(screen.getByLabelText("Passport")).toBeInTheDocument();
    expect(screen.getByLabelText("Passport")).toHaveAttribute("type", "radio");
  });

  it("should call setCheckedFlag and update uploaded_documents on click", () => {
    render(<DocumentUploadRadioButton {...mockProps} />);

    // Simulate clicking the radio button
    const radioButton = screen.getByLabelText("Passport");
    fireEvent.click(radioButton);

    // Assert that setCheckedFlag was called with the correct arguments
    expect(mockSetCheckedFlag).toHaveBeenCalledWith(
      "CATEGORY_1",
      "DOC_TYPE_1"
    );

    // Assert that the uploaded_documents array was updated
    expect(
      mockProps.documentList.document_types[0].uploaded_documents
    ).toEqual([
      {
        document_type_code: "DOC_TYPE_1",
        document_status: "UPLOAD",
      },
    ]);
  });

  export const DocumentFileUpload = (props: any) => {
    return (
      <>
        <div className="document-upload__file-upload__upload-section">
          <div className="documentavatar">
            <span></span>
          </div>
          <div className="document-details">
            <span className="document-title">
              {props.documentHeaders(props.docType.document_type)}
            </span>
            <span className="document-description">
              {props.documentHeaders(props.docType.selectDocument)}
            </span>
          </div>
          <input
            type="file"
            name="file"
            onChange={(event) => {
              props.changeHandler(
                props.uploadingDocument,
                props.documentTypes,
                event,
                props.index
              );
            }}
            accept=".pdf,.jpeg,.jpg,.png,.PNG"
            id={
              "upload-photo__" +
              props.documentTypes.document_category +
              "_" +
              props.index
            }
            className="document-upload__file-upload__hide-upload"
          />
          <label
            className="upload-icon"
            htmlFor={
              "upload-photo__" +
              props.documentTypes.document_category +
              "_" +
              props.index
            }
          >
            <span></span>
          </label>
        </div>
      </>
    );
  };
  
  export default DocumentFileUpload;

  it("should not call setCheckedFlag if the radio button is not clicked", () => {
    render(<DocumentUploadRadioButton {...mockProps} />);

    // Assert that setCheckedFlag is not called initially
    expect(mockSetCheckedFlag).not.toHaveBeenCalled();
  });
});


import { render, screen, fireEvent } from "@testing-library/react";
import DocumentFileUpload from "./DocumentFileUpload";

describe("DocumentFileUpload Component", () => {
  const mockChangeHandler = jest.fn();
  const mockDocumentHeaders = jest.fn((key) => `Mocked ${key}`);

  const mockProps = {
    documentHeaders: mockDocumentHeaders,
    docType: {
      document_type: "ID Proof",
      selectDocument: "Upload your ID proof",
    },
    documentTypes: {
      document_category: "CATEGORY_1",
    },
    uploadingDocument: "mockUploadingDocument",
    changeHandler: mockChangeHandler,
    index: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the document details with correct headers", () => {
    render(<DocumentFileUpload {...mockProps} />);

    // Assert that the document title and description are rendered
    expect(screen.getByText("Mocked ID Proof")).toBeInTheDocument();
    expect(screen.getByText("Mocked Upload your ID proof")).toBeInTheDocument();
  });

  it("should call changeHandler when a file is selected", () => {
    render(<DocumentFileUpload {...mockProps} />);

    // Simulate file upload
    const fileInput = screen.getByRole("textbox", { hidden: true });
    const testFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // Assert that changeHandler is called with the correct arguments
    expect(mockChangeHandler).toHaveBeenCalledWith(
      "mockUploadingDocument",
      mockProps.documentTypes,
      expect.any(Object), // The event object
      0
    );
  });

  it("should render the input and label with correct IDs", () => {
    render(<DocumentFileUpload {...mockProps} />);

    const fileInput = screen.getByRole("textbox", { hidden: true });
    const label = screen.getByLabelText(/upload-photo__CATEGORY_1_0/i);

    // Assert input and label IDs
    expect(fileInput).toHaveAttribute(
      "id",
      "upload-photo__CATEGORY_1_0"
    );
    expect(label).toHaveAttribute("htmlFor", "upload-photo__CATEGORY_1_0");
  });
});

import React, { useEffect, useState } from "react";
import "./dropdown-model.scss";
import {
  KeyWithAnyModel,
  LovInputValModel,
  StoreModel,
} from "../../../utils/model/common-model";
import { AccountList } from "../selection-box/selection-box.utils";
import { useDispatch, useSelector } from "react-redux";
import renderComponent from "../../../modules/dashboard/fields/renderer";
import { getFields } from "../selection-box/selection-box.util";
import { isFieldUpdate } from "../../../utils/common/change.utils";

const DropDownModel = (props: KeyWithAnyModel) => {
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const applicantsSelector = useSelector(
    (state: StoreModel) => state.stages.userInput.applicants
  );
  const [isEligible, setIsEligible] = useState(false);
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [field, setField] = useState([]);
  const [otherBankradiodisplay, setotherBankradiodisplay] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.logicalFieldName === 'credit_into' && props.selectedOption.length <= 1) {
      setotherBankradiodisplay('radio-hidden');
    }
  }, []);
  useEffect(() => {
    if (props.logicalFieldName === 'credit_into') {
      const stageComponents = dispatch(
        getFields(stageSelector, props.selectedValue[0].CODE_VALUE, props.logicalFieldName)
      );
      setField(stageComponents);
    }
  }, [props.selectedValue]);


  useEffect(() => {
    if (stageSelector && stageSelector.length > 0) {
      const prouctCode = stageSelector[0].stageInfo.products[0].product_type;
      setIsLabelVisible(prouctCode === '601');
    }
  }, []);

  const itemList = (item: any, index: number) => {
    if (props.logicalFieldName === "loan_account_list") {
      return <AccountList show={'true'} addUserInputFun={props.addUserInput} item={item} logical_field_name={props.logicalFieldName} />;
    }
    else {
      return (
        <div>
          {props.logicalFieldName !== 'credit_into' && <div key={index} className="dropdown-select__item">
            <input
              type="radio"
              checked={item.checked}
              onClick={() => props.addUserInput(item)}
              onChange={() => {
                //do nothing
              }}
              value={item.CODE_VALUE}
              id={item.CODE_VALUE}
            />
            <label htmlFor={item.CODE_VALUE}>{item.CODE_DESC}</label>
          </div>}
          {props.logicalFieldName === 'credit_into' && <div key={index} className={`dropdown-select__item credit_into_dropdown ${otherBankradiodisplay}`}>
            <input
              type="radio"
              checked={item.checked}
              onClick={() => props.addUserInput(item)}
              onChange={() => {
                //do nothing
              }}
              value={item.CODE_VALUE}
              id={item.CODE_VALUE}
            />
            <div className="label-content">
              <label htmlFor={item.CODE_VALUE}>
                {item.CODE_DESC}
              </label>
              {props.logicalFieldName === 'credit_into' && item.CODE_VALUE !== 'Other Bank Account' &&
                <div className="for-credit-into">{item.CODE_VALUE}
                </div>}
            </div>
          </div>}

        </div>
      );
    }
  };

  return (
    <div>
      <div className="dropdown-select__background">
        <div className="dropdown-select__bg-curve"></div>
        <div
          className={`dropdown-select__popup ${props.logicalFieldName === "maturity_amount" ? "dropdown-select--tenor" : ""
            }`}
        >
          <div className="dropdown-select__header">
            <div>{props.label}</div>
            <div className="close" onClick={props.close}></div>
          </div>

          <div className="dropdown-select__expand">
            <>
              {props.selectedOption.map(
                (item: LovInputValModel, index: number) => {
                  return <>{itemList(item, index)}</>;
                }
              )}
            </>
            {props.logicalFieldName === 'credit_into' && field &&
              field.map((currentSection: KeyWithAnyModel, index: number) => {
                return renderComponent(
                  currentSection,
                  index,
                  props.handleCallback,
                  props.handleFieldDispatch,
                  props.value
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropDownModel;


import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import DropDownModel from "./DropDownModel";

// Mock dependencies
jest.mock("../../../modules/dashboard/fields/renderer", () => jest.fn(() => <div>Rendered Component</div>));
jest.mock("../../../utils/common/change.utils", () => ({
  isFieldUpdate: jest.fn(),
}));
jest.mock("../selection-box/selection-box.utils", () => ({
  AccountList: jest.fn(() => <div>Account List Component</div>),
}));

describe("DropDownModel Component", () => {
  const mockStore = configureStore([]);
  let store: any;

  const defaultProps = {
    label: "Dropdown Label",
    logicalFieldName: "credit_into",
    selectedOption: [
      { CODE_VALUE: "Option1", CODE_DESC: "Option 1", checked: false },
      { CODE_VALUE: "Option2", CODE_DESC: "Option 2", checked: false },
    ],
    selectedValue: [{ CODE_VALUE: "Option1" }],
    addUserInput: jest.fn(),
    close: jest.fn(),
    handleCallback: jest.fn(),
    handleFieldDispatch: jest.fn(),
    value: "",
  };

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageInfo: {
              products: [{ product_type: "601" }],
            },
          },
        ],
        userInput: { applicants: [] },
      },
    });
  });

  it("renders the dropdown model with the provided label", () => {
    render(
      <Provider store={store}>
        <DropDownModel {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText("Dropdown Label")).toBeInTheDocument();
  });

  it("displays the options provided in selectedOption", () => {
    render(
      <Provider store={store}>
        <DropDownModel {...defaultProps} />
      </Provider>
    );

    expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
  });

  it("handles user input selection", () => {
    render(
      <Provider store={store}>
        <DropDownModel {...defaultProps} />
      </Provider>
    );

    const option1 = screen.getByLabelText("Option 1");
    fireEvent.click(option1);

    expect(defaultProps.addUserInput).toHaveBeenCalledWith(defaultProps.selectedOption[0]);
  });

  it("renders additional fields for logicalFieldName 'credit_into'", () => {
    render(
      <Provider store={store}>
        <DropDownModel {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText("Rendered Component")).toBeInTheDocument();
  });

  it("calls the close function when close button is clicked", () => {
    render(
      <Provider store={store}>
        <DropDownModel {...defaultProps} />
      </Provider>
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(defaultProps.close).toHaveBeenCalled();
  });
});
