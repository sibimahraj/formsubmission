describe('documentList', () => {
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
});
