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
