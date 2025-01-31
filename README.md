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
};

export default Toggle;


                                }


                                import React, { useState, useEffect } from "react";
import "./toggle.scss";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { isFieldUpdate } from "../../../utils/common/change.utils";
import Alias from "../../components/alias/alias";
import SelectionBox from "../selection-box/selection-box";
import { aliasAction } from "../../../utils/store/alias-slice";
import { taxAction } from "../../../utils/store/tax-slice";
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
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (stageSelector?.[0]?.stageInfo?.applicants) {
      if (stageSelector[0].stageId) {
        setStageId(stageSelector[0].stageId);
      }
    }
  }, []);

  // Maintain correct order of fields dynamically
  useEffect(() => {
    const taxCount = userInputSelector.applicants["no_of_tax_residency_country_a_1"];
    const existingFields = [...taxSelector.fields]; 

    if (taxCount) {
      const newFields = [];

      for (let i = 1; i <= parseInt(taxCount); i++) {
        newFields.push(`country_of_tax_residence_${i}`);
      }

      // Only add missing fields, don't remove existing ones incorrectly
      newFields.forEach((field) => {
        if (!existingFields.includes(field)) {
          dispatch(taxAction.addTaxFiled(field));
        }
      });
    }
  }, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);

  useEffect(() => {
    for (let i = 1; i <= 4; i++) {
      const countryField = `country_of_tax_residence_${i}_a_1`;
      if (userInputSelector.applicants[countryField]) {
        dispatch(
          taxAction.updateTax({
            [countryField]: userInputSelector.applicants[countryField],
          })
        );
      }
    }
  }, [
    userInputSelector.applicants["country_of_tax_residence_1_a_1"],
    userInputSelector.applicants["country_of_tax_residence_2_a_1"],
    userInputSelector.applicants["country_of_tax_residence_3_a_1"],
    userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  ]);

  return (
    <>
      {!(stageId === "ssf-2") && (
        <div className="toggle__content">
          <div className="toggle__content__inner">
            <div className="toggle__desc">{props.data.rwb_label_name}</div>
            <div className="toggle__button__block">
              <div className="toggle__button" onClick={() => {}}>
                <input type="checkbox" checked={defaultValue} readOnly />
                <span className="toggle__slider"></span>
              </div>
            </div>
          </div>
        </div>
      )}
      {defaultValue && props.data.logical_field_name === "tax_resident_of_other_country" && (
        <Tax {...props} />
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



import React, { useState, useEffect } from "react";
import "./toggle.scss";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { isFieldUpdate } from "../../../utils/common/change.utils";
import Alias from "../../components/alias/alias";
import SelectionBox from "../selection-box/selection-box";
import { aliasAction } from "../../../utils/store/alias-slice";
import { taxAction } from "../../../utils/store/tax-slice";
import Text from "../text/text";
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
  const aliasSelector = useSelector((state: StoreModel) => state.alias);
  const taxSelector = useSelector((state: StoreModel) => state.tax);
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const journeyType = useSelector(
    (state: StoreModel) => state.stages.journeyType
  );
  const dispatch = useDispatch();

  const handlePopupBackButton = () => {
    setShowInfoPopup(false);
  };

  useEffect(() => {
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      if (
        props.data.logical_field_name === "cheque_book_request" ||
        props.data.logical_field_name === "other_name_or_alias"
      ) {
        const storeVal =
          stageSelector[0].stageInfo.applicants[
            props.data.logical_field_name + "_a_1"
          ];

        if (storeVal) {
          dispatch(
            isFieldUpdate(props, storeVal, props.data.logical_field_name)
          );
        }

        setDefaultValue(storeVal === "Y");
      }

      if (
        stageSelector &&
        stageSelector.length > 0 &&
        stageSelector[0].stageId
      ) {
        setStageId(stageSelector[0].stageId);
      }
    }
  }, []);

  const onToggle = () => {
    dispatch(lastAction.getField(props.data.logical_field_name));

    if (defaultValue) {
      setDefaultValue(false);
      dispatch(isFieldUpdate(props, "N", props.data.logical_field_name));

      if (
        props.data.logical_field_name === "other_name_or_alias" &&
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

      if (props.data.logical_field_name === "tax_resident_of_other_country") {
        dispatch(fieldErrorAction.removeMandatoryFields(taxSelector.fields));
        dispatch(
          stagesAction.removeAddToggleField({
            removeFields: taxSelector.fields,
            newFields: [],
          })
        );
        dispatch(taxAction.resetTaxField([]));
      }
    } else {
      setDefaultValue(true);
      dispatch(isFieldUpdate(props, "Y", props.data.logical_field_name));

      if (
        props.data.logical_field_name === "other_name_or_alias" &&
        aliasSelector.count < 1
      ) {
        dispatch(fieldErrorAction.getMandatoryFields(["alias_1"]));
        dispatch(aliasAction.addAliasField("alias_1"));
        dispatch(aliasAction.updateCount(1));
      } else if (
        props.data.logical_field_name === "tax_resident_of_other_country"
      ) {
        dispatch(
          fieldErrorAction.getMandatoryFields(["no_of_tax_residency_country"])
        );
        dispatch(taxAction.addTaxFiled("no_of_tax_residency_country"));
        dispatch(taxAction.updateCount(1));
      }
    }
  };

  useEffect(() => {
    const taxCount =
      userInputSelector.applicants["no_of_tax_residency_country_a_1"];

    if (taxCount) {
      const fieldsToAdd = [];
      for (let i = 1; i <= Number(taxCount); i++) {
        fieldsToAdd.push(`country_of_tax_residence_${i}`);
      }

      const currentFields = new Set(taxSelector.fields);
      const fieldsToRemove = taxSelector.fields.filter(
        (field) =>
          field !== "no_of_tax_residency_country" &&
          !fieldsToAdd.includes(field)
      );

      fieldsToRemove.forEach((field) => dispatch(taxAction.removeTaxField(field)));
      fieldsToAdd.forEach((field) => {
        if (!currentFields.has(field)) dispatch(taxAction.addTaxFiled(field));
      });
    }
  }, [userInputSelector.applicants["no_of_tax_residency_country_a_1"]]);

  useEffect(() => {
    const taxFields = ["country_of_tax_residence_1_a_1", "country_of_tax_residence_2_a_1", "country_of_tax_residence_3_a_1", "country_of_tax_residence_4_a_1"];
    
    taxFields.forEach((field, index) => {
      const value = userInputSelector.applicants[field];

      if (value) {
        dispatch(
          taxAction.updateTax({
            [`country_of_tax_residence_${index + 1}_a_1`]: value,
          })
        );
      }
    });
  }, [
    userInputSelector.applicants["country_of_tax_residence_1_a_1"],
    userInputSelector.applicants["country_of_tax_residence_2_a_1"],
    userInputSelector.applicants["country_of_tax_residence_3_a_1"],
    userInputSelector.applicants["country_of_tax_residence_4_a_1"],
  ]);

  return (
    <>
      {!(stageId === "ssf-2" && journeyType) && (
        <div className="toggle__content">
          <div className="toggle__content__inner">
            <div className="toggle__desc">{props.data.rwb_label_name}</div>
            <div className="toggle__button__block">
              <div className="toggle__button" onClick={onToggle}>
                <input
                  onChange={() => {}}
                  type="checkbox"
                  checked={defaultValue}
                />
                <span className="toggle__slider"></span>
              </div>
            </div>
            <span className="radio__header">
              {props.data.info_tooltips === "Yes" &&
                props.data.logical_field_name !== "casa_fatca_declaration" && (
                  <div className="tool-tip__icon">
                    <span
                      className="tool-tip"
                      onClick={() => setShowInfoPopup(true)}
                    ></span>
                  </div>
                )}
            </span>
          </div>
        </div>
      )}
      {defaultValue &&
        props.data.logical_field_name === "tax_resident_of_other_country" && (
          <Tax {...props} />
        )}
      {showInfoPopup && (
        <Model
          name={props.data.logical_field_name}
          isTooltip={true}
          data={props.data.details}
          handlebuttonClick={handlePopupBackButton}
        />
      )}
    </>
  );
};

export default Toggle;


useEffect(() => {
  const updatedFields = [...taxSelector.fields];

  ["1", "2", "3", "4"].forEach((index) => {
    const countryKey = `country_of_tax_residence_${index}_a_1`;
    if (userInputSelector.applicants[countryKey]) {
      const taxIdKey = `tax_id_no_${index}`;
      const reasonKey = `crs_reason_code_${index}`;

      const countryFieldIndex = updatedFields.indexOf(`country_of_tax_residence_${index}`);

      if (countryFieldIndex !== -1) {
        // Ensure Tax ID and Reason appear right after the respective country field
        if (!updatedFields.includes(taxIdKey)) {
          updatedFields.splice(countryFieldIndex + 1, 0, taxIdKey);
        }
        if (!updatedFields.includes(reasonKey)) {
          updatedFields.splice(countryFieldIndex + 2, 0, reasonKey);
        }
      }
    } else {
      // Remove Tax ID and Reason if the country is deselected
      updatedFields.splice(updatedFields.indexOf(`tax_id_no_${index}`), 1);
      updatedFields.splice(updatedFields.indexOf(`crs_reason_code_${index}`), 1);
    }
  });

  dispatch(taxAction.resetTaxField(updatedFields));
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"]
]);

useEffect(() => {
  const updatedFields = [...taxSelector.fields];

  ["1", "2", "3", "4"].forEach((index) => {
    const countryKey = `country_of_tax_residence_${index}_a_1`;
    const taxIdKey = `tax_id_no_${index}`;
    const reasonKey = `crs_reason_code_${index}`;

    const countryFieldIndex = updatedFields.indexOf(`country_of_tax_residence_${index}`);

    if (userInputSelector.applicants[countryKey]) {
      // Ensure the country field exists in the array
      if (countryFieldIndex === -1) {
        updatedFields.push(`country_of_tax_residence_${index}`);
      }

      // Ensure Tax ID and Reason appear **right after** their respective country field
      if (!updatedFields.includes(taxIdKey) && countryFieldIndex !== -1) {
        updatedFields.splice(countryFieldIndex + 1, 0, taxIdKey);
      }
      if (!updatedFields.includes(reasonKey) && countryFieldIndex !== -1) {
        updatedFields.splice(countryFieldIndex + 2, 0, reasonKey);
      }
    } else {
      // Remove dependent fields if the country is deselected
      const taxIdIndex = updatedFields.indexOf(taxIdKey);
      if (taxIdIndex !== -1) updatedFields.splice(taxIdIndex, 1);

      const reasonIndex = updatedFields.indexOf(reasonKey);
      if (reasonIndex !== -1) updatedFields.splice(reasonIndex, 1);
    }
  });

  dispatch(taxAction.resetTaxField(updatedFields));
}, [
  userInputSelector.applicants["country_of_tax_residence_1_a_1"],
  userInputSelector.applicants["country_of_tax_residence_2_a_1"],
  userInputSelector.applicants["country_of_tax_residence_3_a_1"],
  userInputSelector.applicants["country_of_tax_residence_4_a_1"]
]);
      
