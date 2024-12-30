 documentList = (docResponse: KeyWithAnyModel) => {
        let fields = [];
        if (docResponse.length > 0) {
            docResponse.forEach((docResp: KeyWithAnyModel) => {
                Eif(docResp && docResp.document_list){
                    docResp.document_list.forEach((document_list: KeyWithAnyModel) => {
                        Eif(document_list && document_list.document_options){
                            document_list.document_options.forEach((document_options: KeyWithAnyModel) => {
                                Eif(document_options && document_options.document_types){
                                    document_options.document_types.forEach((document_types: KeyWithAnyModel) => {
                                        Eif(document_types.uploaded_documents){
                                            fields.push({
                                                formFieldName: `${document_list.document_category} Uploaded`,
                                                formFieldValue: (document_types.uploaded_documents.length > 0) ? 'Yes' : 'No'
                                            }) 
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            fields.push({
                formFieldName: 'na',
                formFieldValue: "na"
            })
        }
        return fields;
    }
