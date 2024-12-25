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
