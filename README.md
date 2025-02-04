import React, { useState, useEffect } from "react";
import "./toggle.scss";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { isFieldUpdate } from "../../../utils/common/change.utils";
import Alias from "../../components/alias/alias";
import SelectionBox from "../selection-box/selection-box";
import { aliasAction } from "../../../utils/store/alias-slice";
import tax, { taxAction } from "../../../utils/store/tax-slice";
import Text from "../text/text";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import { lastAction } from "../../../utils/store/last-accessed-slice";
import Model from "../model/model";
 import "../information/information.scss";
import Tax from "../../tax/tax";

const Toggle = (props: KeyWithAnyModel) => {
  const [defaultValue, setDefaultValue] = useState(false);
  const [defaultTaxValue, setDefaultTaxValue] = useState("");
  const [stageId, setStageId] = useState("");
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const aliasSelector = useSelector((state: StoreModel) => state.alias);
  const taxSelector =useSelector((state:StoreModel)=>state.tax);
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  console.log("country",userInputSelector.applicants["no_of_tax_residency_country_a_1"])
  const journeyType = useSelector(
    (state: StoreModel) => state.stages.journeyType
  );
  const dispatch = useDispatch();
  const handlePopupBackButton = () => {
    setShowInfoPopup(false);
  };

  useEffect(() => {
    /*istanbul ignore else */
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
       /*istanbul ignore else */
      if (
        props.data.logical_field_name === "cheque_book_request" ||
        props.data.logical_field_name === "other_name_or_alias"
      ) {
        const storeVal =
          stageSelector[0].stageInfo.applicants[
            props.data.logical_field_name + "_a_1"
          ];
           /*istanbul ignore else */
        if (storeVal) {
          dispatch(
            isFieldUpdate(props, storeVal, props.data.logical_field_name)
          );
        }

        if (
          stageSelector[0].stageInfo.applicants[
            props.data.logical_field_name + "_a_1"
          ] === "Y"
        ) {
          setDefaultValue(true);
        } else if (
          stageSelector[0].stageInfo.applicants[
            props.data.logical_field_name + "_a_1"
          ] === "N"
        ) {
          setDefaultValue(false);
        } else {
          setDefaultValue(false);
          if (props.data.logical_field_name !== "other_name_or_alias") {
            dispatch(isFieldUpdate(props, "N", props.data.logical_field_name));
          }
        }
      }
       /*istanbul ignore else */
      if (
        stageSelector &&
        stageSelector.length > 0 &&
        stageSelector[0].stageId
      ) {
        setStageId(stageSelector[0].stageId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggle = () => {
    dispatch(lastAction.getField(props.data.logical_field_name));
    if (defaultValue) {
      debugger
      setDefaultValue(false);
      dispatch(isFieldUpdate(props, "N", props.data.logical_field_name));
      /*istanbul ignore else */
      if (
        props.data.logical_field_name === "other_name_or_alias" &&
        aliasSelector &&
        aliasSelector.fields.length > 0
      ) {
        dispatch(fieldErrorAction.removeMandatoryFields(aliasSelector.fields));
        dispatch(
          stagesAction.removeAddToggleField({
            removeFields: aliasSelector.fields,
            newFields: [],
          })
        );
        dispatch(aliasAction.resetAliasField([]));
      }
      if (
        props.data.logical_field_name === "tax_resident_of_other_country" 
        ) {
          debugger
        dispatch(fieldErrorAction.removeMandatoryFields(taxSelector.fields));
        dispatch(
          stagesAction.removeAddToggleField({
            removeFields: taxSelector.fields,
            newFields: [],
          })
        );
        dispatch(taxAction.resetTaxField([]));
        setDefaultTaxValue("");
      }
    } else {
      debugger
      setDefaultValue(true);
      dispatch(isFieldUpdate(props, "Y", props.data.logical_field_name));
       /*istanbul ignore else */
      if (
        props.data.logical_field_name === "other_name_or_alias" &&
        aliasSelector &&
        aliasSelector.count < 1
      ) {
        dispatch(fieldErrorAction.getMandatoryFields(["alias_1"]));
        dispatch(aliasAction.addAliasField("alias_1"));
        dispatch(aliasAction.updateCount(1));
      }
      else if(props.data.logical_field_name === "tax_resident_of_other_country"
      ){
        dispatch(fieldErrorAction.getMandatoryFields(["no_of_tax_residency_country"]));
        dispatch(taxAction.addTaxFiled("no_of_tax_residency_country"));
        dispatch(taxAction.updateCount(1));
        }
        }
  };
  useEffect(()=>{
if(userInputSelector.applicants["no_of_tax_residency_country_a_1"]==="1"){
      debugger
      const taxSelectorFields=taxSelector.fields;
      console.log("taxfiels",taxSelectorFields)
      if(taxSelectorFields.length ===1){
        dispatch(taxAction.addTaxFiled("country_of_tax_residence_1"));
         
      }
      else{
      const updatedTaxSelectorField =taxSelectorFields.filter((field)=>(field!=="no_of_tax_residency_country"))
      updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.removeTaxField(field))));
      dispatch(taxAction.addTaxFiled("country_of_tax_residence_1"));
      }
    }
    else if(userInputSelector.applicants["no_of_tax_residency_country_a_1"]==="2"){
      debugger
      const taxSelectorFields=taxSelector.fields;
      console.log("taxfiels",taxSelectorFields)
      if(taxSelectorFields.length ===1){
        dispatch(taxAction.addTaxFiled("country_of_tax_residence_1"));
         dispatch(taxAction.addTaxFiled("country_of_tax_residence_2"));
      }
      else{
      const updatedTaxSelectorField =taxSelectorFields.filter((field)=>(field!=="country_of_tax_residence_1")&&(field!=="no_of_tax_residency_country"))
      updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.removeTaxField(field))));
      dispatch(taxAction.addTaxFiled("country_of_tax_residence_2"));
      }

     // updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.addTaxFiled(field))));
   }
    else if(userInputSelector.applicants["no_of_tax_residency_country_a_1"]==="3"){
      const taxSelectorFields=taxSelector.fields;
      debugger
      console.log("taxfiels3",taxSelectorFields)
      if(taxSelectorFields.length ===1){
        dispatch(taxAction.addTaxFiled("country_of_tax_residence_1"));
         dispatch(taxAction.addTaxFiled("country_of_tax_residence_2"));
         dispatch(taxAction.addTaxFiled("country_of_tax_residence_3"));
      }
    else{
      const updatedTaxSelectorField =taxSelectorFields.filter((field)=>(field!=="country_of_tax_residence_1")&&(field!=="no_of_tax_residency_country")&&(field!=="country_of_tax_residence_2"))
      updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.removeTaxField(field))));
      dispatch(taxAction.addTaxFiled("country_of_tax_residence_3"));
    }
    }
    else if(userInputSelector.applicants["no_of_tax_residency_country_a_1"]==="4"){
     
      dispatch(taxAction.addTaxFiled("country_of_tax_residence_1"));
      dispatch(taxAction.addTaxFiled("country_of_tax_residence_2"));
      dispatch(taxAction.addTaxFiled("country_of_tax_residence_3"));
      dispatch(taxAction.addTaxFiled("country_of_tax_residence_4"))

    }
    },[userInputSelector.applicants["no_of_tax_residency_country_a_1"]])
 useEffect(()=>{
  if(userInputSelector.applicants["country_of_tax_residence_1_a_1"]){
    debugger
    const taxSelectorFields=taxSelector.fields;
    console.log("coufiels1",taxSelectorFields)
   const updatedTaxSelectorField =taxSelectorFields.filter((field)=>(field!=="country_of_tax_residence_1")&&(field!=="no_of_tax_residency_country"))
    const countryOfTaxResidence =userInputSelector.applicants["country_of_tax_residence_1_a_1"]
    updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.removeTaxField(field))));
    dispatch(taxAction.updateTax({'country_of_tax_residence_1_a_1':countryOfTaxResidence}))
    updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.addTaxFiled(field))));
  }
 else if(userInputSelector.applicants["country_of_tax_residence_2_a_1"]){
    debugger
    const taxSelectorFields=taxSelector.fields;
    console.log("coufiels",taxSelectorFields)
    const updatedTaxSelectorField =taxSelectorFields.filter((field)=>(field!=="country_of_tax_residence_1")&&(field!=="no_of_tax_residency_country")&&(field!=="country_of_tax_residence_2"))
    const countryOfTaxResidence =userInputSelector.applicants["country_of_tax_residence_2_a_1"]
    updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.removeTaxField(field))));
    dispatch(taxAction.updateTax({"country_of_tax_residence_2_a_1": countryOfTaxResidence}))
    updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.addTaxFiled(field))));
  }
  else if(userInputSelector.applicants["country_of_tax_residence_3_a_1"]){
    debugger
    const taxSelectorFields=taxSelector.fields;
    console.log("coufiels3",taxSelectorFields)
    const updatedTaxSelectorField =taxSelectorFields.filter((field)=>(field!=="country_of_tax_residence_1")&&(field!=="no_of_tax_residency_country")&&(field!=="country_of_tax_residence_2")&&(field!=="country_of_tax_residence_3"))
    const countryOfTaxResidence =userInputSelector.applicants["country_of_tax_residence_3_a_1"]
    updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.removeTaxField(field))));
    dispatch(taxAction.updateTax({"country_of_tax_residence_3_a_1": countryOfTaxResidence}))
    updatedTaxSelectorField.forEach((field)=>(dispatch(taxAction.addTaxFiled(field))))
  }
  else if(userInputSelector.applicants["country_of_tax_residence_4_a_1"]){
    debugger
    const countryOfTaxResidence =userInputSelector.applicants["country_of_tax_residence_4_a_1"]
    dispatch(taxAction.updateTax({"country_of_tax_residence_4_a_1": countryOfTaxResidence}))
  }
  
},[userInputSelector.applicants["country_of_tax_residence_1_a_1"]||userInputSelector.applicants["country_of_tax_residence_2_a_1"]||userInputSelector.applicants["country_of_tax_residence_3_a_1"]||userInputSelector.applicants["country_of_tax_residence_4_a_1"]])

  return (
    <>
      {!(stageId === "ssf-2" && journeyType) && (
        <div className="toggle__content">
          <div className="toggle__content__inner">
            <div className="toggle__desc">{props.data.rwb_label_name}</div>
            <div className="toggle__button__block">
              <div className="toggle__button" onClick={() => onToggle()}>
                <input
                  onChange={() => {
                    // do nothing
                  }}
                  type="checkbox"
                  checked={defaultValue}
                />
                <span className="toggle__slider"></span>
              </div>
            </div>
            <span className="radio__header">
        {props.data.info_tooltips === "Yes" &&
           props.data.logical_field_name !== "casa_fatca_declaration" && (
            <div  className="tool-tip__icon">
             <span
               className=" tool-tip"
               onClick={() => setShowInfoPopup(true)}
             ></span>
             </div>
           )}
       </span>
          </div>
          <>
         </>
        </div>
       
      )}
      {defaultValue &&
        props.data.logical_field_name === "other_name_or_alias" && (
          <Alias
            handleCallback={props.handleCallback}
            handleFieldDispatch={props.handleFieldDispatch}
            value={props.value}
          />
        )}
        {defaultValue &&
        props.data.logical_field_name === "tax_resident_of_other_country" && (
          
          <Tax
             handleCallback={props.handleCallback}
             handleFieldDispatch={props.handleFieldDispatch}
             props={props}
          />
        )}
       {showInfoPopup && (
        <Model name={props.data.logical_field_name} isTooltip={true} data={props.data.details}  handlebuttonClick={handlePopupBackButton} />
      )}
    </>
  );

  import React, { useState, useEffect } from "react";
import "./toggle.scss";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { isFieldUpdate } from "../../../utils/common/change.utils";
import Alias from "../../components/alias/alias";
import { aliasAction } from "../../../utils/store/alias-slice";
import tax, { taxAction } from "../../../utils/store/tax-slice";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import { lastAction } from "../../../utils/store/last-accessed-slice";
import Model from "../model/model";
import "../information/information.scss";
import Tax from "../../tax/tax";

const Toggle = (props: KeyWithAnyModel) => {
  const [defaultValue, setDefaultValue] = useState(false);
  const [stageId, setStageId] = useState("");
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const taxSelector = useSelector((state: StoreModel) => state.tax);
  const userInputSelector = useSelector((state: StoreModel) => state.stages.userInput);
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      stageSelector &&
      stageSelector.length > 0 &&
      stageSelector[0].stageId
    ) {
      setStageId(stageSelector[0].stageId);
    }
  }, [stageSelector]);

  const onToggle = () => {
    dispatch(lastAction.getField(props.data.logical_field_name));
    setDefaultValue((prev) => !prev);
    if (defaultValue) {
      dispatch(isFieldUpdate(props, "N", props.data.logical_field_name));
    } else {
      dispatch(isFieldUpdate(props, "Y", props.data.logical_field_name));
    }
  };

  useEffect(() => {
    const taxCountryCount = userInputSelector.applicants["no_of_tax_residency_country_a_1"];
    const taxSelectorFields = taxSelector.fields;

    if (taxCountryCount) {
      const requiredFields = Array.from({ length: parseInt(taxCountryCount) }, (_, i) => `country_of_tax_residence_${i + 1}`);

      // Remove extra fields
      taxSelectorFields
        .filter((field) => !requiredFields.includes(field) && field !== "no_of_tax_residency_country")
        .forEach((field) => dispatch(taxAction.removeTaxField(field)));

      // Add missing required fields
      requiredFields.forEach((field) => {
        if (!taxSelectorFields.includes(field)) {
          dispatch(taxAction.addTaxFiled(field));
        }
      });
    }
  }, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], dispatch, taxSelector.fields]);

  useEffect(() => {
    ["country_of_tax_residence_1_a_1", "country_of_tax_residence_2_a_1", "country_of_tax_residence_3_a_1", "country_of_tax_residence_4_a_1"].forEach((field, index) => {
      if (userInputSelector.applicants[field]) {
        const countryValue = userInputSelector.applicants[field];
        dispatch(taxAction.updateTax({ [field]: countryValue }));
      }
    });
  }, [userInputSelector.applicants, dispatch]);

  return (
    <>
      {!(stageId === "ssf-2" && userInputSelector.journeyType) && (
        <div className="toggle__content">
          <div className="toggle__content__inner">
            <div className="toggle__desc">{props.data.rwb_label_name}</div>
            <div className="toggle__button__block">
              <div className="toggle__button" onClick={onToggle}>
                <input type="checkbox" checked={defaultValue} readOnly />
                <span className="toggle__slider"></span>
              </div>
            </div>
          </div>
        </div>
      )}
      {defaultValue &&
        props.data.logical_field_name === "other_name_or_alias" && (
          <Alias
            handleCallback={props.handleCallback}
            handleFieldDispatch={props.handleFieldDispatch}
            value={props.value}
          />
        )}
      {defaultValue &&
        props.data.logical_field_name === "tax_resident_of_other_country" && (
          <Tax
            handleCallback={props.handleCallback}
            handleFieldDispatch={props.handleFieldDispatch}
            props={props}
          />
        )}
      {showInfoPopup && (
        <Model
          name={props.data.logical_field_name}
          isTooltip={true}
          data={props.data.details}
          handlebuttonClick={() => setShowInfoPopup(false)}
        />
      )}
    </>
  );
};

export default Toggle;
};

export default Toggle;
useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    const existingFields = new Set(taxSelector.fields);

    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFields.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], dispatch, taxSelector.fields]);

useEffect(() => {
  for (let i = 1; i <= 4; i++) {
    const countryField = `country_of_tax_residence_${i}_a_1`;
    const taxIdField = `tax_id_${i}`;
    const reasonField = `reason_${i}`;

    if (userInputSelector.applicants[countryField]) {
      // Update Tax ID and Reason for the specific country
      dispatch(taxAction.addTaxFiled(taxIdField));
      dispatch(taxAction.addTaxFiled(reasonField));
    } else {
      // Remove unnecessary fields if country is deselected
      dispatch(taxAction.removeTaxField(taxIdField));
      dispatch(taxAction.removeTaxField(reasonField));
    }
  }
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  dispatch,
  taxSelector.fields,
]);
useEffect(() => {
  const countryFields = [
    "country_of_tax_residence_1_a_1",
    "country_of_tax_residence_2_a_1",
    "country_of_tax_residence_3_a_1",
    "country_of_tax_residence_4_a_1",
  ];

  countryFields.forEach((field, index) => {
    if (userInputSelector.applicants[field]) {
      dispatch(taxAction.addTaxFiled(`tax_id_${index + 1}`));
      dispatch(taxAction.addTaxFiled(`reason_${index + 1}`));
    } else {
      dispatch(taxAction.removeTaxField(`tax_id_${index + 1}`));
      dispatch(taxAction.removeTaxField(`reason_${index + 1}`));
    }
  });
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
]);
                                }

                                useEffect(() => {
  const countryFields = [
    "country_of_tax_residence_1_a_1",
    "country_of_tax_residence_2_a_1",
    "country_of_tax_residence_3_a_1",
    "country_of_tax_residence_4_a_1",
  ];

  countryFields.forEach((field, index) => {
    const countryValue = userInputSelector.applicants[field];
    if (countryValue) {
      dispatch(taxAction.addTaxFiled(`tax_id_${index + 1}`));
      dispatch(taxAction.addTaxFiled(`reason_${index + 1}`));
      dispatch(taxAction.updateTax({ [field]: countryValue }));
    } else {
      dispatch(taxAction.removeTaxField(`tax_id_${index + 1}`));
      dispatch(taxAction.removeTaxField(`reason_${index + 1}`));
    }
  });
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  dispatch,
]);

useEffect(() => {
  const countryFields = [
    "country_of_tax_residence_1_a_1",
    "country_of_tax_residence_2_a_1",
    "country_of_tax_residence_3_a_1",
    "country_of_tax_residence_4_a_1",
  ];

  // For each country field, check if the value exists
  countryFields.forEach((field, index) => {
    const countryValue = userInputSelector.applicants[field];
    
    // Field names for tax_id and reason under each respective country
    const taxIdField = `tax_id_${index + 1}`;
    const reasonField = `reason_${index + 1}`;

    if (countryValue) {
      // Check if tax_id and reason fields are not already added in the state for this country
      const taxSelectorFields = taxSelector.fields;
      if (!taxSelectorFields.includes(taxIdField)) {
        dispatch(taxAction.addTaxFiled(taxIdField)); // Add tax_id field for the respective country
      }
      if (!taxSelectorFields.includes(reasonField)) {
        dispatch(taxAction.addTaxFiled(reasonField)); // Add reason field for the respective country
      }

      // Update the country tax field in the store
      dispatch(taxAction.updateTax({ [taxIdField]: "" }));
      dispatch(taxAction.updateTax({ [reasonField]: "" }));
    } else {
      // If the country value is removed, remove the associated tax_id and reason fields
      dispatch(taxAction.removeTaxField(taxIdField));
      dispatch(taxAction.removeTaxField(reasonField));
    }
  });
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  dispatch,
]);

useEffect(() => {
  const countryFields = [
    "country_of_tax_residence_1_a_1",
    "country_of_tax_residence_2_a_1",
    "country_of_tax_residence_3_a_1",
    "country_of_tax_residence_4_a_1",
  ];

  // Loop through each country field and apply the logic
  countryFields.forEach((field, index) => {
    const countryValue = userInputSelector.applicants[field];

    // If country field is selected, dispatch the corresponding updateTax action
    if (countryValue) {
      // Add tax_id and reason fields for each respective country field
      const taxField = `country_of_tax_residence_${index + 1}_a_1`;
      dispatch(taxAction.updateTax({ [taxField]: countryValue }));

      // For each country, we need to update the tax_id and reason fields
      const taxIdField = `tax_id_${index + 1}`;
      const reasonField = `reason_${index + 1}`;

      // Update the tax fields
      dispatch(taxAction.updateTax({ [taxIdField]: "" }));
      dispatch(taxAction.updateTax({ [reasonField]: "" }));
    } else {
      // If the country is removed, clear the respective fields
      const taxField = `country_of_tax_residence_${index + 1}_a_1`;
      dispatch(taxAction.updateTax({ [taxField]: "" }));

      const taxIdField = `tax_id_${index + 1}`;
      const reasonField = `reason_${index + 1}`;

      dispatch(taxAction.updateTax({ [taxIdField]: "" }));
      dispatch(taxAction.updateTax({ [reasonField]: "" }));
    }
  });
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  dispatch,
]);
updateTax(state, action) {
  const updatedFields = [...state.fields];
  const [field, value] = Object.entries(action.payload)[0];

  const index = updatedFields.findIndex((item) => item === field);

  if (value && index !== -1) {
    // Remove existing tax fields if present to avoid duplicates
    updatedFields.splice(index + 1, 2);

    updatedFields.splice(index + 1, 0, `tax_id_no_${field.split("_")[4]}`, `crs_reason_code_${field.split("_")[4]}`);
  }

  state.fields = updatedFields;
}


useEffect(() => {
  const countryFields = [
    "country_of_tax_residence_1_a_1",
    "country_of_tax_residence_2_a_1",
    "country_of_tax_residence_3_a_1",
    "country_of_tax_residence_4_a_1",
  ];

  countryFields.forEach((field) => {
    const countryValue = userInputSelector.applicants[field];

    if (countryValue) {
      dispatch(taxAction.updateTax({ [field]: countryValue }));
    }
  });
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
]);
updateTax(state, action) {
  const updatedFields = [...state.fields]; // Clone the existing state fields
  const [field, value] = Object.entries(action.payload)[0]; // Extract the key-value pair

  if (value) {
    const index = updatedFields.findIndex(item => item === field);

    if (index !== -1) {
      // Remove existing tax fields for that country to avoid duplicates
      updatedFields.splice(index + 1, 2);

      // Insert tax fields immediately after the country field
      updatedFields.splice(index + 1, 0, `tax_id_no_${field.split("_")[4]}`, `crs_reason_code_${field.split("_")[4]}`);
    }
  }

  state.fields = updatedFields; // Update state fields
}


useEffect(() => {
  ["country_of_tax_residence_1", "country_of_tax_residence_2", "country_of_tax_residence_3", "country_of_tax_residence_4"].forEach((field) => {
    const countryValue = taxDetails[field];

    if (countryValue) {
      const index = state.fields.indexOf(field);

      if (index !== -1) {
        // Ensure tax fields are pushed below the respective country field
        state.fields.splice(index + 1, 2); // Remove existing tax fields if present
        state.fields.splice(index + 1, 0, `tax_id_no_${field.split("_").pop()}`);
        state.fields.splice(index + 2, 0, `crs_reason_code_${field.split("_").pop()}`);

        dispatch(taxAction.updateTax({ [field]: countryValue }));
      } else {
        console.warn(`Field ${field} not found in state.fields`);
      }
    }
  });
}, [taxDetails]);


const normalizeFieldName = (field) => field.replace(/_a_\d+$/, ''); // Remove "_a_1" suffix

const updatedFields = Object.keys(action.payload);

updatedFields.forEach((updatedField) => {
  const normalizedUpdatedField = normalizeFieldName(updatedField);

  // Find the index of the country field
  const index = state.fields.findIndex(
    (field) => normalizeFieldName(field) === normalizedUpdatedField
  );

  if (index !== -1) {
    // Check if tax fields already exist
    const nextFields = state.fields.slice(index + 1, index + 3);
    const isTaxFieldsPresent =
      nextFields.includes(`tax_id_no_${index + 1}`) &&
      nextFields.includes(`crs_reason_code_${index + 1}`);

    if (!isTaxFieldsPresent) {
      // Insert tax fields only if they are missing
      state.fields.splice(index + 1, 0, `tax_id_no_${index + 1}`, `crs_reason_code_${index + 1}`);
    }
  }
});


const updateTax = (state, action) => {
  const normalizeFieldName = (field) => field.replace(/_a_\d+$/, ''); // Remove "_a_1" suffix

  const updatedFields = Object.keys(action.payload);

  updatedFields.forEach((updatedField) => {
    const normalizedUpdatedField = normalizeFieldName(updatedField);

    // Find the index of the country field
    const index = state.fields.findIndex(
      (field) => normalizeFieldName(field) === normalizedUpdatedField
    );

    if (index !== -1) {
      // Extract the field value for the updated country field
      const countryValue = action.payload[updatedField];

      // Update the state with the country value
      state.data[updatedField] = countryValue;

      // Check if tax fields already exist
      const nextFields = state.fields.slice(index + 1, index + 3);
      const isTaxFieldsPresent =
        nextFields.includes(`tax_id_no_${index + 1}`) &&
        nextFields.includes(`crs_reason_code_${index + 1}`);

      if (!isTaxFieldsPresent) {
        // Insert tax fields only if they are missing
        state.fields.splice(index + 1, 0, `tax_id_no_${index + 1}`, `crs_reason_code_${index + 1}`);
      }
    }
  });
};

updateTax: (state, action) => {
  const normalizeFieldName = (field) => field.replace(/_a_\d+$/, "");
  
  Object.keys(action.payload).forEach((updatedField) => {
    const normalizedUpdatedField = normalizeFieldName(updatedField);

    // Find the index of the country field
    const index = state.fields.findIndex(
      (field) => normalizeFieldName(field) === normalizedUpdatedField
    );

    if (index !== -1) {
      // Clear any extra tax fields between current and next country field
      const taxFields = [`tax_id_no_a_${index + 1}`, `crs_reason_code_a_${index + 1}`];

      // Ensure fields are not duplicated
      taxFields.forEach((taxField, i) => {
        if (!state.fields.includes(taxField)) {
          state.fields.splice(index + 1 + i, 0, taxField);
        }
      });
    }
  });
}


updateTax(state, action) {
  const updatedFields = [...state.fields]; // Clone the existing state fields
  const [field, value] = Object.entries(action.payload)[0]; // Extract the key-value pair

  // Normalize field name by removing any suffix (_a_1, etc.)
  const normalizedField = field.replace(/_a_\d+$/, '');

  const index = updatedFields.findIndex(
    (item) => item.replace(/_a_\d+$/, '') === normalizedField
  );

  if (value && index !== -1) {
    // Remove existing tax fields if present to avoid duplicates
    updatedFields.splice(index + 1, 2);

    // Insert tax fields immediately after the country field
    updatedFields.splice(index + 1, 0, `tax_id_no_${field.split("_")[4]}`, `crs_reason_code_${field.split("_")[4]}`);
  }

  state.fields = updatedFields; // Update state fields
}


updateTax(state, action) {
  const updatedFields = [...state.fields]; // Clone the existing state fields
  const [field, value] = Object.entries(action.payload)[0]; // Extract the key-value pair

  // Normalize field name by removing any suffix (_a_1, etc.)
  const normalizedField = field.replace(/_a_\d+$/, '');

  const index = updatedFields.findIndex(
    (item) => item.replace(/_a_\d+$/, '') === normalizedField
  );

  if (value && index !== -1) {
    // Remove existing tax fields for this country if they exist
    const nextFields = updatedFields.slice(index + 1);
    const taxFieldStartIndex = nextFields.findIndex(
      (item) => item.startsWith('tax_id_no_') || item.startsWith('crs_reason_code_')
    );

    if (taxFieldStartIndex !== -1) {
      updatedFields.splice(index + 1, taxFieldStartIndex);
    }

    // Insert tax fields immediately after the country field
    updatedFields.splice(index + 1, 0, `tax_id_no_${field.split("_")[4]}`, `crs_reason_code_${field.split("_")[4]}`);
  }

  state.fields = updatedFields; // Update state fields
}


useEffect(() => {
    const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");
  
    if (taxCountryCount > 0) {
      const existingFields = new Set(taxSelector.fields);
  
      for (let i = 1; i <= taxCountryCount; i++) {
        const countryField = `country_of_tax_residence_${i}`;
        if (!existingFields.has(countryField)) {
          dispatch(taxAction.addTaxFiled(countryField));
        }
      }
    }
  }, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);

  useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    const existingFields = [...taxSelector.fields]; // Clone current fields

    // Add missing fields up to the count
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFields.includes(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra fields beyond the count
    for (let i = taxCountryCount + 1; i <= existingFields.length; i++) {
      const extraField = `country_of_tax_residence_${i}`;
      if (existingFields.includes(extraField)) {
        dispatch(taxAction.removeTaxField(extraField));
      }
    }
  } else {
    // Clear all fields if count is 0
    taxSelector.fields.forEach((field) => {
      if (field.startsWith("country_of_tax_residence")) {
        dispatch(taxAction.removeTaxField(field));
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);
useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  const existingFields = taxSelector.fields.filter(field =>
    field.startsWith("country_of_tax_residence_")
  );

  // Add missing fields
  for (let i = 1; i <= taxCountryCount; i++) {
    const countryField = `country_of_tax_residence_${i}`;
    if (!existingFields.includes(countryField)) {
      dispatch(taxAction.addTaxFiled(countryField));
    }
  }

  // Remove extra fields if the count is reduced
  existingFields.forEach(field => {
    const index = parseInt(field.split("_").pop() || "0");
    if (index > taxCountryCount) {
      dispatch(taxAction.removeTaxField(field));
    }
  });
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);

useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  // Ensure fields are updated based on count
  const currentFields = taxSelector.fields.filter(field => field.startsWith("country_of_tax_residence_"));

  // Add missing fields
  for (let i = currentFields.length + 1; i <= taxCountryCount; i++) {
    const countryField = `country_of_tax_residence_${i}`;
    dispatch(taxAction.addTaxFiled(countryField));
  }

  // Remove extra fields if count is reduced
  currentFields.forEach(field => {
    const index = parseInt(field.split("_").pop() || "0");
    if (index > taxCountryCount) {
      dispatch(taxAction.removeTaxField(field));
    }
  });
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);


useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");
  
  if (taxCountryCount > 0) {
    const existingFields = [...taxSelector.fields].filter(field => field.startsWith("country_of_tax_residence_"));

    // Add missing fields (your logic remains untouched)
    const existingFieldSet = new Set(existingFields);
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFieldSet.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra fields if user selects fewer countries
    existingFields.forEach(field => {
      const fieldIndex = parseInt(field.split("_").pop() || "0");
      if (fieldIndex > taxCountryCount) {
        dispatch(taxAction.removeTaxField(field));
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);

useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");
  
  if (taxCountryCount > 0) {
    const existingFields = [...taxSelector.fields].filter(field =>
      field.startsWith("country_of_tax_residence_") || field.startsWith("tax_id_") || field.startsWith("reason_")
    );

    // Add missing country fields (keep your existing logic intact)
    const existingFieldSet = new Set(existingFields);
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFieldSet.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra country and associated fields
    existingFields.forEach(field => {
      const fieldIndex = parseInt(field.match(/\d+$/)?.[0] || "0");
      if (fieldIndex > taxCountryCount) {
        dispatch(taxAction.removeTaxField(field));
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);


useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    const existingFields = [...taxSelector.fields].filter(field =>
      field.startsWith("country_of_tax_residence_") || 
      field.startsWith("tax_id_") || 
      field.startsWith("reason_")
    );

    // Add missing country fields (keep your existing logic intact)
    const existingFieldSet = new Set(existingFields);
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFieldSet.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra country and associated fields
    existingFields.forEach(field => {
      const fieldIndexMatch = field.match(/_(\d+)$/);
      const fieldIndex = fieldIndexMatch ? parseInt(fieldIndexMatch[1]) : 0;

      if (fieldIndex > taxCountryCount) {
        dispatch(taxAction.removeTaxField(field));
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);


useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    const existingFields = [...taxSelector.fields];

    // Add missing country fields (keep your existing logic intact)
    const existingFieldSet = new Set(existingFields);
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFieldSet.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra country and associated fields
    existingFields.forEach(field => {
      const fieldMatch = field.match(/_(\d+)$/);
      const fieldIndex = fieldMatch ? parseInt(fieldMatch[1]) : 0;

      if (fieldIndex > taxCountryCount) {
        if (field.startsWith("country_of_tax_residence_") || 
            field.startsWith("tax_id_") || 
            field.startsWith("reason_")) {
          dispatch(taxAction.removeTaxField(field));
        }
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);

useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount >= 0) {
    const existingFields = [...taxSelector.fields];
    const fieldsToRemove = [];

    // Add required fields
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFields.includes(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra fields
    existingFields.forEach((field) => {
      const match = field.match(/_(\d+)$/);
      const fieldIndex = match ? parseInt(match[1]) : 0;

      if (fieldIndex > taxCountryCount) {
        if (
          field.startsWith("country_of_tax_residence_") ||
          field.startsWith("tax_id_") ||
          field.startsWith("reason_")
        ) {
          fieldsToRemove.push(field);
        }
      }
    });

    // Dispatch removal for the extra fields
    fieldsToRemove.forEach((field) => {
      dispatch(taxAction.removeTaxField(field));
    });

    // Ensure structure cleanup
    if (fieldsToRemove.length) {
      dispatch(taxAction.updateTax({}));
    }
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], taxSelector.fields]);

useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    const existingFields = [...taxSelector.fields];
    const existingFieldSet = new Set(existingFields);

    // Add required fields
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFieldSet.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra fields beyond the selected count
    existingFields.forEach(field => {
      const fieldMatch = field.match(/_(\d+)$/);
      const fieldIndex = fieldMatch ? parseInt(fieldMatch[1]) : 0;

      if (fieldIndex > taxCountryCount) {
        if (
          field.startsWith("country_of_tax_residence_") ||
          field.startsWith("tax_id_") ||
          field.startsWith("reason_")
        ) {
          dispatch(taxAction.removeTaxField(field));
        }
      }
    });
  } else {
    // Remove all tax-related fields when no country is selected
    taxSelector.fields.forEach(field => {
      if (
        field.startsWith("country_of_tax_residence_") ||
        field.startsWith("tax_id_") ||
        field.startsWith("reason_")
      ) {
        dispatch(taxAction.removeTaxField(field));
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], taxSelector.fields]);

useEffect(() => {
    const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");
   if (taxCountryCount > 0) {
      debugger
      const existingFields = [...taxSelector.fields].filter(field => field.startsWith("country_of_tax_residence_")|| field.startsWith("tax_id_no_") || field.startsWith("crs_reason_code_"));
      const existingFieldSet = new Set(existingFields);
      for (let i = 1; i <= taxCountryCount; i++) {
        const countryField = `country_of_tax_residence_${i}`;
        if (!existingFieldSet.has(countryField)) {
          dispatch(taxAction.addTaxFiled(countryField));
        }
      }
      existingFields.forEach(field => {
        const fieldMatch = field.match(/_(\d+)$/);
        const fieldIndex = fieldMatch ? parseInt(fieldMatch[1]) : 0;
  
        if (fieldIndex > taxCountryCount) {
          if (field.startsWith("country_of_tax_residence_") || 
              field.startsWith("tax_id_") || 
              field.startsWith("crs_reason_code_")) {
            dispatch(taxAction.removeTaxField(field));
          }
        }
      });
    }
    else  {
      debugger
      // Remove all tax-related fields when no country is selected
      taxSelector.fields.forEach(field => {
        if (
          field.startsWith("country_of_tax_residence_") ||
          field.startsWith("tax_id_") ||
          field.startsWith("reason_")
        ) {
          dispatch(taxAction.removeTaxField(field));
        }
      });
    }
  }, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);


useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    debugger;
    // Memoize existing fields
    const existingFields = new Set(
      taxSelector.fields.filter(field =>
        field.startsWith("country_of_tax_residence_") ||
        field.startsWith("tax_id_no_") ||
        field.startsWith("crs_reason_code_")
      )
    );

    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFields.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove excess fields
    taxSelector.fields.forEach(field => {
      const match = field.match(/_(\d+)$/);
      const fieldIndex = match ? parseInt(match[1]) : 0;

      if (fieldIndex > taxCountryCount) {
        dispatch(taxAction.removeTaxField(field));
      }
    });
  } else {
    debugger;
    // Prevent unnecessary removals
    if (taxSelector.fields.length > 0) {
      taxSelector.fields.forEach(field => {
        if (
          field.startsWith("country_of_tax_residence_") ||
          field.startsWith("tax_id_no_") ||
          field.startsWith("reason_")
        ) {
          dispatch(taxAction.removeTaxField(field));
        }
      });
    }
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], taxSelector.fields]);

useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    console.log("Adding fields logic triggered");

    const existingFields = new Set(
      taxSelector.fields.filter(field =>
        field.startsWith("country_of_tax_residence_") ||
        field.startsWith("tax_id_no_") ||
        field.startsWith("crs_reason_code_")
      )
    );

    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFields.has(countryField)) {
        console.log(`Adding Field: ${countryField}`);
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Wait for state update before removing
    setTimeout(() => {
      console.log("Checking for extra fields to remove...");
      taxSelector.fields.forEach(field => {
        const match = field.match(/_(\d+)$/);
        const fieldIndex = match ? parseInt(match[1]) : 0;

        if (fieldIndex > taxCountryCount) {
          console.log(`Removing Field: ${field}`);
          dispatch(taxAction.removeTaxField(field));
        }
      });
    }, 100); // Small delay to ensure state updates first
  } else {
    console.log("Removing all tax fields after confirming state update");

    setTimeout(() => {
      taxSelector.fields.forEach(field => {
        if (
          field.startsWith("country_of_tax_residence_") ||
          field.startsWith("tax_id_no_") ||
          field.startsWith("reason_")
        ) {
          console.log(`Removing Field: ${field}`);
          dispatch(taxAction.removeTaxField(field));
        }
      });
    }, 100);
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], taxSelector.fields]);

const [prevTaxCount, setPrevTaxCount] = useState(0);

useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  // If the count hasn't changed, do nothing (prevents multiple renders)
  if (taxCountryCount === prevTaxCount) return;

  setPrevTaxCount(taxCountryCount); // Update state only when value actually changes

  if (taxCountryCount > 0) {
    console.log("Adding fields logic triggered");

    const existingFields = new Set(
      taxSelector.fields.filter(field =>
        field.startsWith("country_of_tax_residence_") ||
        field.startsWith("tax_id_no_") ||
        field.startsWith("crs_reason_code_")
      )
    );

    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFields.has(countryField)) {
        console.log(`Adding Field: ${countryField}`);
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra fields (if any)
    taxSelector.fields.forEach(field => {
      const match = field.match(/_(\d+)$/);
      const fieldIndex = match ? parseInt(match[1]) : 0;

      if (fieldIndex > taxCountryCount) {
        console.log(`Removing Field: ${field}`);
        dispatch(taxAction.removeTaxField(field));
      }
    });

  } else {
    console.log("Removing all tax fields");

    taxSelector.fields.forEach(field => {
      if (
        field.startsWith("country_of_tax_residence_") ||
        field.startsWith("tax_id_no_") ||
        field.startsWith("reason_")
      ) {
        console.log(`Removing Field: ${field}`);
        dispatch(taxAction.removeTaxField(field));
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], taxSelector.fields]);

const [prevTaxCount, setPrevTaxCount] = useState(-1);

useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  // If the count hasn't changed, do nothing (except when resetting to 0)
  if (taxCountryCount === prevTaxCount) return;

  setPrevTaxCount(taxCountryCount); // Update state to track the latest value

  if (taxCountryCount > 0) {
    console.log("Adding fields logic triggered");

    const existingFields = new Set(
      taxSelector.fields.filter(field =>
        field.startsWith("country_of_tax_residence_") ||
        field.startsWith("tax_id_no_") ||
        field.startsWith("crs_reason_code_")
      )
    );

    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!existingFields.has(countryField)) {
        console.log(`Adding Field: ${countryField}`);
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove extra fields (if any)
    taxSelector.fields.forEach(field => {
      const match = field.match(/_(\d+)$/);
      const fieldIndex = match ? parseInt(match[1]) : 0;

      if (fieldIndex > taxCountryCount) {
        console.log(`Removing Field: ${field}`);
        dispatch(taxAction.removeTaxField(field));
      }
    });

  } else {
    console.log("Removing all tax fields");

    taxSelector.fields.forEach(field => {
      if (
        field.startsWith("country_of_tax_residence_") ||
        field.startsWith("tax_id_no_") ||
        field.startsWith("reason_")
      ) {
        console.log(`Removing Field: ${field}`);
        dispatch(taxAction.removeTaxField(field));
      }
    });
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"], taxSelector.fields]);


useEffect(() => {
  const taxCountryCount = parseInt(userInputSelector.applicants["no_of_tax_residency_country_a_1"] || "0");

  if (taxCountryCount > 0) {
    const existingFields = [...taxSelector.fields].filter(field =>
      field.startsWith("country_of_tax_residence_") || 
      field.startsWith("tax_id_") || 
      field.startsWith("reason_code_")
    );

    const fieldSet = new Set(existingFields);

    // Add country fields
    for (let i = 1; i <= taxCountryCount; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      if (!fieldSet.has(countryField)) {
        dispatch(taxAction.addTaxFiled(countryField));
      }
    }

    // Remove and reassign fields beyond the count
    for (let i = taxCountryCount + 1; i <= existingFields.length; i++) {
      const countryField = `country_of_tax_residence_${i}`;
      const taxField = `tax_id_${i}`;
      const reasonField = `reason_code_${i}`;

      // Remove fields from higher index
      if (fieldSet.has(countryField)) {
        dispatch(taxAction.removeTaxField(countryField));
      }

      // Move tax and reason code fields to the last valid country
      if (fieldSet.has(taxField) || fieldSet.has(reasonField)) {
        const targetCountryIndex = taxCountryCount;
        dispatch(taxAction.removeTaxField(taxField));
        dispatch(taxAction.removeTaxField(reasonField));

        dispatch(taxAction.updateTax({
          [`tax_id_${targetCountryIndex}`]: userInputSelector.applicants[`tax_id_${i}`] || '',
          [`reason_code_${targetCountryIndex}`]: userInputSelector.applicants[`reason_code_${i}`] || ''
        }));
      }
    }
  }
}, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);

useEffect(() => {
  taxSelector.fields.forEach(field => {
    if (field.startsWith("country_of_tax_residence_")) {
      const taxValue = userInputSelector.applicants[`${field}_a_1`];

      if (taxValue && taxValue.length === 9) {
        dispatch(taxAction.removeTaxField(`${field}_reason`));
      }
    }
  });
}, [taxSelector.fields, userInputSelector.applicants]);

useEffect(() => {
  taxSelector.fields.forEach(field => {
    if (field.startsWith("country_of_tax_residence_")) {
      const fieldIndex = field.split("_").pop(); // Extract the dynamic index (1, 2, 3, etc.)
      const taxValue = userInputSelector.applicants[`${field}_a_1`];

      if (taxValue && taxValue.length === 9) {
        const reasonField = `crs_reason_code_${fieldIndex}`; // Dynamically match the tax ID
        if (taxSelector.fields.includes(reasonField)) {
          dispatch(taxAction.removeTaxField(reasonField));
        }
      }
    }
  });
}, [taxSelector.fields, userInputSelector.applicants]);


useEffect(() => {
  const countryFields = [
    "country_of_tax_residence_1_a_1",
    "country_of_tax_residence_2_a_1",
    "country_of_tax_residence_3_a_1",
    "country_of_tax_residence_4_a_1",
  ];

  countryFields.forEach((field) => {
    const countryValue = userInputSelector.applicants[field];

    // Dispatch only if the field has a new value and hasn't already added its related fields
    if (countryValue && !taxSelector.fields.includes(field)) {
      dispatch(taxAction.updateTax({ [field]: countryValue }));
    }
  });
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  dispatch,
  taxSelector.fields,
]);

useEffect(() => {
  const countryFields = [
    "country_of_tax_residence_1_a_1",
    "country_of_tax_residence_2_a_1",
    "country_of_tax_residence_3_a_1",
    "country_of_tax_residence_4_a_1",
  ];

  countryFields.forEach((field) => {
    const countryValue = userInputSelector.applicants[field];

    // Dispatch only if the field has a value and the tax state doesn't already contain it
    if (countryValue) {
      const currentFieldValue = taxSelector.fields.find(
        (item) => item.field === field && item.value === countryValue
      );
      
      if (!currentFieldValue) {
        dispatch(taxAction.updateTax({ [field]: countryValue }));
      }
    }
  });
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  dispatch,
  taxSelector.fields,
]);


updateTax(state, action) {
  const updatedFields = [...state.fields]; // Clone the existing state fields
  const [field, value] = Object.entries(action.payload)[0]; // Extract the key-value pair

  // Normalize field name by removing any suffix (_a_1, etc.)
  const normalizedField = field.replace(/_a_\d+$/, '');

  // Check if the field already exists
  const index = updatedFields.findIndex(
    (item) => item.replace(/_a_\d+$/, '') === normalizedField
  );

  // Avoid re-adding tax and reason fields if already present
  const taxField = `tax_id_no_${field.split("_")[4]}`;
  const reasonField = `crs_reason_code_${field.split("_")[4]}`;

  const alreadyExists = updatedFields.includes(taxField) && updatedFields.includes(reasonField);

  if (value && index !== -1 && !alreadyExists) {
    // Remove existing tax fields if present to avoid duplicates
    updatedFields.splice(index + 1, 2);

    // Insert tax fields immediately after the country field
    updatedFields.splice(index + 1, 0, taxField, reasonField);
  }

  state.fields = updatedFields; // Update state fields
}
