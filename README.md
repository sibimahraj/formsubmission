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

  it("should not call setCheckedFlag if the radio button is not clicked", () => {
    render(<DocumentUploadRadioButton {...mockProps} />);

    // Assert that setCheckedFlag is not called initially
    expect(mockSetCheckedFlag).not.toHaveBeenCalled();
  });
});
