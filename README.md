 Text Component › sets default value for embossed name fields

    TypeError: Cannot read properties of undefined (reading 'map')

      23 |                 <Slider {...settings}>
      24 |                     {
    > 25 |                         stageSelector && stageSelector.products.map((_product: any, index: number) => {
         |                                                                 ^
      26 |                             return (
      27 |                                 <>
      28 |                                     {

const bindHandler = (
    fieldName: string,
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    if (event.target.validity.valid && fieldName !== "name_of_employer") {
      const fieldValue = event.target.value;
      props.handleCallback(props.data, event.target.value);
      dispatch(isFieldValueUpdate(props, stageSelector, fieldValue));
      dispatch(isFieldUpdate(props, fieldValue, fieldName));
      if (fieldName === "tax_id_no") {
        dispatch(stagesAction.updateTaxToggle());
      }
      if (
        fieldName &&
        fieldName.substring(0, 9) === "tax_id_no" &&
        fieldName.length > 9
      ) {
        dispatch(stagesAction.updateAddTaxToggle());
      }
    }
  };

  it("should handle bindHandler correctly", () => {
  const mockHandleCallback = jest.fn();
  const mockDispatch = jest.fn();

  // Mock props
  const props = {
    data: {
      logical_field_name: "tax_id_no", // Change as necessary for different fields
      rwb_label_name: "Tax ID Number",
    },
    handleCallback: mockHandleCallback,
  };

  // Mock stageSelector (assuming it's part of your test setup)
  const stageSelector = [
    {
      stageId: "ssf-2",
      stageInfo: {
        applicants: {
          tax_id_no_a_1: "123456789", // Example field value
        },
      },
    },
  ];

  // Create an event with a valid value
  const event = {
    target: {
      validity: {
        valid: true,
      },
      value: "987654321", // Example value for the tax_id_no
    },
  };

  // Call bindHandler
  bindHandler("tax_id_no", event);

  // Check if handleCallback was called
  expect(mockHandleCallback).toHaveBeenCalledWith(props.data, "987654321");

  // Check if dispatch was called with the correct arguments
  expect(mockDispatch).toHaveBeenCalledWith(isFieldValueUpdate(props, stageSelector, "987654321"));
  expect(mockDispatch).toHaveBeenCalledWith(isFieldUpdate(props, "987654321", "tax_id_no"));
  expect(mockDispatch).toHaveBeenCalledWith(stagesAction.updateTaxToggle());

  // Test for a field that is not "tax_id_no"
  const otherEvent = {
    target: {
      validity: {
        valid: true,
      },
      value: "Some other value",
    },
  };
  bindHandler("name_of_employer", otherEvent);
  // Ensure bindHandler doesn't do anything for "name_of_employer"
  expect(mockDispatch).not.toHaveBeenCalled();

  // Test for tax_id_no with length > 9
  const longTaxIdEvent = {
    target: {
      validity: {
        valid: true,
      },
      value: "98765432101", // Tax ID longer than 9 characters
    },
  };
  bindHandler("tax_id_no_a_1", longTaxIdEvent);
  expect(mockDispatch).toHaveBeenCalledWith(stagesAction.updateAddTaxToggle());
});

it("calls the correct actions and handles input focus event", () => {
  const mockHandleCallback = jest.fn();
  const mockDispatch = jest.fn();
  const mockStageSelector = [
    {
      stageId: "ssf-2",
      stageInfo: {
        applicants: {},
      },
    },
  ];

  const fieldName = "tax_id_no";
  const event = {
    target: {
      value: "987654321",
      validity: { valid: true },
    },
  };

  render(
    <Provider store={store}>
      <Text
        handleFieldDispatch={mockDispatch}
        data={{
          logical_field_name: fieldName,
          rwb_label_name: "Tax ID Number",
          placeholder: "Tax ID Number",
          type: "text",
          min_length: 10,
          length: 15,
          regex: "\\d+",
          editable: true,
        }}
        handleCallback={mockHandleCallback}
      />
    </Provider>
  );

  // Trigger the bindHandler logic
  bindHandler(fieldName, event as any);

  // Ensure handleCallback is called with correct arguments
  expect(mockHandleCallback).toHaveBeenCalledWith({ logical_field_name: fieldName, rwb_label_name: "Tax ID Number" }, "987654321");

  // Ensure actions are dispatched with correct field values
  expect(mockDispatch).toHaveBeenCalledWith(isFieldValueUpdate({ logical_field_name: fieldName }, mockStageSelector, "987654321"));
  expect(mockDispatch).toHaveBeenCalledWith(isFieldUpdate({ logical_field_name: fieldName }, "987654321", fieldName));

  // Ensure specific actions for tax_id_no field are dispatched
  if (fieldName === "tax_id_no") {
    expect(mockDispatch).toHaveBeenCalledWith(stagesAction.updateTaxToggle());
  }

  if (fieldName.substring(0, 9) === "tax_id_no" && fieldName.length > 9) {
    expect(mockDispatch).toHaveBeenCalledWith(stagesAction.updateAddTaxToggle());
  }
});

Text Component › calls the correct actions and handles input focus event

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "tax_id_no", "S1234567A", "tax_id_no", "123456789", "tax_id_no"
    Received
           1: "tax_id_no", "S1234567A"
           2: "tax_id_no", "123456789"

    Number of calls: 2

      701 |     // "tax_id_no", "123456789"
      702 |     // );
    > 703 |     expect(mockDispatch).toHaveBeenCalledWith( "tax_id_no", "S1234567A" , "tax_id_no", "123456789" ,  fieldName);
          |                          ^
      704 |
      705 |     // Ensure specific actions for tax_id_no field are dispatched
      706 |     if (fieldName === "tax_id_no") {

      at Object.toHaveBeenCalledWith (src/shared/components/text/text.test.tsx:703:26)
