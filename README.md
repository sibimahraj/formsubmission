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
