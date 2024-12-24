import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import {
  fieldError,
  fieldIdAppend,
  getUrl,
  isFieldUpdate,
  isFieldValueUpdate,
} from "../../../utils/common/change.utils";
import "./text.scss";
import validateService from "../../../services/validation-service";
import errorMsg from "../../../assets/_json/error.json";
import { stagesAction } from "../../../utils/store/stages-slice";
import Cards from "../cards/cards";
import { aliasAction } from "../../../utils/store/alias-slice";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { lastAction } from "../../../utils/store/last-accessed-slice";
import ReferralCode from "../../../shared/components/referral-code/referral-code";
import { referralcodeAction } from "../../../utils/store/referral-code-slice";

const Text = (props: KeyWithAnyModel) => {
  const [error, setError] = useState("");
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);

  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  const postalCodeSelector = useSelector(
    (state: StoreModel) => state.postalCode.postalCode
  );
  const referralcodeSelector = useSelector((state: StoreModel) => state.referralcode);
  const resumeSelector = useSelector(
    (state: StoreModel) => state.urlParam.resume
  );
  const dispatch = useDispatch();

  const [defaultValue, setDefaultValue] = useState("");
  const [embossCounter, setEmbossCounter] = useState(0);
  const [postalCode, setPostalCode] = useState<any>({});
  const [showReferralCode, setShowReferralcode] = useState(false);

  const changeHandler = (
    fieldName: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    embossedNameCounter(event.target.value);
    setDefaultValue(event.target.value);
    props.handleCallback(props.data, event.target.value);
    setError("");
    if (props.data.logical_field_name === "referral_id_2") {
      setDefaultValue(
        event.target.value !== ""
          ? event.target.value.toUpperCase()
          : event.target.value
      );
      dispatch(
        referralcodeAction.setReferralId(
          event.target.value !== ""
            ? event.target.value.toUpperCase()
            : event.target.value
        )
      );
      dispatch(referralcodeAction.setReferralErrorMsg(""));
    }
    if (
      (props.data.mandatory === "Yes" ||
        props.data.mandatory === "Conditional") &&
      event.target.value.length < 1 &&
      props.data.logical_field_name !== "referral_id_2"
    ) {
      setError(`${errorMsg.emity} ${props.data.rwb_label_name}`);
    } else if (
      `${event.target.value}`[0] === " " ||
      `${event.target.value}`[`${event.target.value}`.length - 1] === " "
    ) {
      setError(
        `${props.data.rwb_label_name} cannot have leading or trailing spaces`
      );
    } else if (
      props.data.regex &&
      !`${event.target.value}`.match(props.data.regex) &&
      props.data.logical_field_name !== "referral_id_2"
    ) {
      setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);
    } else if (
      props.data.min_length &&
      `${event.target.value}`.length < props.data.min_length &&
      props.data.logical_field_name !== "referral_id_2"
    ) {
      setError(`${errorMsg.minLength} ${props.data.min_length} letters`);
    } else if (
      props.data.logical_field_name === "NRIC" &&
      !validateService.isValidNRIC(event.target.value) &&
      event.target.value
    ) {
      setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);
    } else {
      setError(
        !event.target.validity.valid &&
        props.data.logical_field_name !== "referral_id_2"
          ? `${errorMsg.patterns} ${props.data.rwb_label_name}`
          : ""
      );
    }
    if (
      props.data.logical_field_name === "referral_id_2" &&
      referralcodeSelector &&
      referralcodeSelector.errormsg !== ""
    ) {
      setError("");
    }
  };

  useEffect(() => {
    setPostalCode(postalCodeSelector);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCodeSelector]);

  useEffect(() => {
    let setPostalValue = null;
    if (
      props.data.logical_field_name === "block" ||
      props.data.logical_field_name === "building_name" ||
      props.data.logical_field_name === "street_name"
    ) {
      if (props.data.logical_field_name === "block") {
        setPostalValue = postalCode.block_a_1 || "";
      } else if (props.data.logical_field_name === "building_name") {
        setPostalValue = postalCode.building_name_a_1 || "";
      } else if (props.data.logical_field_name === "street_name") {
        setPostalValue = postalCode.street_name_a_1 || "";
      }
      if (setPostalValue) {
        setDefaultValue(setPostalValue);
        props.handleCallback(props.data, setPostalValue);
        dispatch(isFieldValueUpdate(props, stageSelector, setPostalValue));
        dispatch(
          isFieldUpdate(props, setPostalValue, props.data.logical_field_name)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode]);

  useEffect(() => {
    if (props.data.logical_field_name === "referral_id_2") {
      if ( referralcodeSelector && referralcodeSelector.refer && referralcodeSelector.refer === "true") {
        setShowReferralcode(true);
        if (referralcodeSelector.referId !== null) {
          const getReferralCode =
          referralcodeSelector && referralcodeSelector.referId
            ? referralcodeSelector.referId.toUpperCase()
            : '';
        setDefaultValue(getReferralCode);
        dispatch(referralcodeAction.setReferralId(getReferralCode));
        }
        else{
           setDefaultValue("");
        }
      }
      if (
        getUrl.getParameterByName("auth") === "resume" || resumeSelector
      ) {
        setShowReferralcode(true);
        if(referralcodeSelector && referralcodeSelector.referId){
          setDefaultValue(referralcodeSelector && referralcodeSelector.referId);
        } 
      }
    }
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      const userInputResponse =
        userInputSelector.applicants[fieldIdAppend(props)];

      const stageIndex = getUrl
        .getUpdatedStage()
        .updatedStageInputs.findIndex(
          (ref: any) => ref && ref.stageId === stageSelector[0].stageId
        );
      let updatedVal = null;
      if (stageIndex > -1) {
        updatedVal =
          getUrl.getUpdatedStage().updatedStageInputs[stageIndex].applicants[
            fieldIdAppend(props)
          ];
      }

      let fieldValue = "";
      if (updatedVal) {
        fieldValue = updatedVal;
      } else if (userInputResponse) {
        fieldValue = userInputResponse;
      } else if (
        stageSelector[0].stageInfo.applicants[fieldIdAppend(props)] &&
        updatedVal !== ""
      ) {
        fieldValue =
          stageSelector[0].stageInfo.applicants[fieldIdAppend(props)];
      }
      if (props.data.logical_field_name === "residential_address") {
        let myInfoAddress :string = "";
         if(getUrl.getParameterByName("isMyInfoVirtual") === "true"){
        const block = stageSelector[0].stageInfo.applicants["block_a_1"];
        const building =
          stageSelector[0].stageInfo.applicants["building_name_a_1"];
        const street = stageSelector[0].stageInfo.applicants["street_name_a_1"];
        const unitNo = stageSelector[0].stageInfo.applicants["unit_no_a_1"];
        const postalCode =
          stageSelector[0].stageInfo.applicants["postal_code_a_1"];

        if (block && street && postalCode) {
          myInfoAddress = block +
            (building ? "," + building : "") +
            "," +
            street +
            (unitNo ? "," + unitNo : "") +
            "," +
            postalCode;
        }
      }
        if(myInfoAddress){
        setDefaultValue(myInfoAddress);
        dispatch(
          isFieldUpdate(props, myInfoAddress, props.data.logical_field_name)
          );
        }
      } else if (
        props.data.logical_field_name === "tax_id_no" &&
        stageSelector[0].stageInfo.applicants["casa_fatca_declaration_a_1"] ===
          "Y"
      ) {
        setDefaultValue(stageSelector[0].stageInfo.applicants["NRIC_a_1"]);
        dispatch(
          isFieldUpdate(
            props,
            stageSelector[0].stageInfo.applicants["NRIC_a_1"],
            props.data.logical_field_name
          )
        );
      } else if (
        ((props.data.logical_field_name === "embossed_dc_name" &&
          !stageSelector[0].stageInfo.applicants["embossed_dc_name_a_1"]) ||
          (props.data.logical_field_name === "embossed_name" &&
            !stageSelector[0].stageInfo.applicants["embossed_name_a_1"]) ||
          (props.data.logical_field_name === "embossed_name_2" &&
            !stageSelector[0].stageInfo.applicants["embossed_name_2_a_1"])) &&
        new RegExp(props.data.regex).test(
          stageSelector[0].stageInfo.applicants["full_name_a_1"]
        )
      ) {
        const fullName =
          fieldValue || stageSelector[0].stageInfo.applicants["full_name_a_1"];
        if (fullName && fullName.length >= 19) {
          let firstName = fullName.split(" ")[0];
          firstName = firstName.length >= 19 ? "" : firstName;
          embossedNameCounter(firstName);
          setDefaultValue(firstName);
          dispatch(
            isFieldUpdate(props, firstName, props.data.logical_field_name)
          );
          props.handleCallback(props.data, firstName);
        } else {
          embossedNameCounter(fullName);
          setDefaultValue(fullName);
          dispatch(
            isFieldUpdate(props, fullName, props.data.logical_field_name)
          );
          props.handleCallback(props.data, fullName);
        }
      } else if (
        userInputSelector.applicants[props.data.logical_field_name + "_a_1"] !==
          undefined &&
        props.data.logical_field_name.substring(0, 9) === "tax_id_no"
      ) {
        setDefaultValue(fieldValue);
        dispatch(
          isFieldUpdate(
            props,
            fieldValue ||
              userInputSelector.applicants[
                props.data.logical_field_name + "_a_1"
              ],
            props.data.logical_field_name
          )
        );
        props.handleCallback(
          props.data,
          userInputSelector.applicants[props.data.logical_field_name + "_a_1"]
        );
      } else if (
        stageSelector[0].stageInfo.applicants[
          props.data.logical_field_name + "_a_1"
        ] ||
        fieldValue
      ) {
        setDefaultValue(fieldValue);
        if (
          !(stageSelector[0].stageId === "ssf-2" && getUrl.getJourneyType())
        ) {
          dispatch(
            isFieldUpdate(props, fieldValue, props.data.logical_field_name)
          );
          props.handleCallback(props.data, fieldValue);
        } else {
          dispatch(
            isFieldUpdate(
              props,
              fieldValue ||
                stageSelector[0].stageInfo.applicants[
                  props.data.logical_field_name + "_a_1"
                ],
              props.data.logical_field_name
            )
          );
          props.handleCallback(
            props.data,
            fieldValue ||
              stageSelector[0].stageInfo.applicants[
                props.data.logical_field_name + "_a_1"
              ]
          );
        }
        if (
          props.data.logical_field_name === "embossed_dc_name" ||
          props.data.logical_field_name === "embossed_name" ||
          props.data.logical_field_name === "embossed_name_2"
        ) {
          embossedNameCounter(
            stageSelector[0].stageInfo.applicants[
              props.data.logical_field_name + "_a_1"
            ]
          );
        }
      } else if (props.data.logical_field_name === "passport_no") {
        const passVal =
          userInputSelector.applicants[
            props.data.logical_field_name + "_a_1"
          ] || "";
        setDefaultValue(passVal);
        dispatch(isFieldUpdate(props, passVal, props.data.logical_field_name));
        props.handleCallback(props.data, passVal);
      } else {
        if(props.data.logical_field_name !== "referral_id_2"){
          setDefaultValue(fieldValue);   
        }  
        if (
          !(stageSelector[0].stageId === "ssf-2" && getUrl.getJourneyType())
        ) {
          dispatch(
            isFieldUpdate(props, fieldValue, props.data.logical_field_name)
          );
          props.handleCallback(props.data, fieldValue);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      props.data.logical_field_name === "tax_id_no" &&
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      setError("");
      const stageIndex = getUrl
        .getUpdatedStage()
        .updatedStageInputs.findIndex(
          (ref: any) => ref && ref.stageId === stageSelector[0].stageId
        );
      let updatedVal = null;
      if (stageIndex > -1) {
        updatedVal =
          getUrl.getUpdatedStage().updatedStageInputs[stageIndex].applicants[
            fieldIdAppend(props)
          ];
      }
      let tax_id_value =
        updatedVal ||
        stageSelector[0].stageInfo.applicants[
          `${props.data.logical_field_name}_a_1`
        ];
      if (userInputSelector.applicants["casa_fatca_declaration_a_1"] === "Y") {
        tax_id_value = stageSelector[0].stageInfo.applicants["NRIC_a_1"];
      }
      setDefaultValue(tax_id_value ? tax_id_value : "");
      dispatch(
        isFieldUpdate(props, tax_id_value, props.data.logical_field_name)
      );
      props.handleCallback(props.data, tax_id_value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector.applicants.casa_fatca_declaration_a_1]);

  useEffect(() => {
    if (props.data.logical_field_name === "annual_income") {
      setDefaultValue(userInputSelector.applicants.annual_income_a_1);
    } else if (props.data.logical_field_name === "required_loan_amount") {
      setDefaultValue(userInputSelector.applicants.required_loan_amount_a_1);
    } else if (props.data.logical_field_name === "loan_tenor") {
      setDefaultValue(userInputSelector.applicants.loan_tenor_a_1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userInputSelector.applicants.annual_income_a_1,
    userInputSelector.applicants.required_loan_amount_a_1,
    userInputSelector.applicants.loan_tenor_a_1,
  ]);

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

  useEffect(() => {
    if (fieldError(fieldErrorSelector, props)) {
      setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);
    } else {
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  
  useEffect(() => {
    if (
      props.data.logical_field_name === "referral_id_2" &&
      referralcodeSelector &&
      referralcodeSelector.errormsg !== ""
    ) {
      setError(referralcodeSelector.errormsg);
      if (
        referralcodeSelector &&
        referralcodeSelector.referId !== "" &&
        referralcodeSelector.referId !== null &&
        referralcodeSelector.referId.length === 1
      ) {
        dispatch(referralcodeAction.setReferralId(""));
        setDefaultValue("");
        dispatch(referralcodeAction.setReferralErrorMsg(""));
      }
    } else {
      setError("");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralcodeSelector.errormsg]);

  const embossedNameCounter = (value: string) => {
    setEmbossCounter(value.length);
  };

  const placeHolderText = (fieldName: string) => {
    if (fieldName === "passport_no") {
      return "Enter your passport Number";
    }if (fieldName === "referral_id_2" && stageSelector[0].stageId !== "bd-1") {
      return "Enter referral code here";
    } else {
      return props.data.rwb_label_name;
    }
  };
  const removeAliasField = () => {
    dispatch(aliasAction.removeAliasField(props.data.logical_field_name));
    dispatch(
      fieldErrorAction.removeMandatoryFields([props.data.logical_field_name])
    );
    dispatch(
      stagesAction.removeAddToggleField({
        removeFields: [props.data.logical_field_name],
        newFields: [],
      })
    );
  };
  const focusHandler = (
    fieldName: string,
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    dispatch(lastAction.getField(fieldName));
  };

  const allowNumericCharacter = (
    event: React.KeyboardEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    if(fieldName === 'referral_id_2'){
      validateService.allowOnlyCharacter(event, fieldName);
    } 
  };
  return (
    <>
      {(props.data.logical_field_name === "embossed_dc_name" ||
        props.data.logical_field_name === "embossed_name" ||
        props.data.logical_field_name === "embossed_name_2") && (
        <Cards name={defaultValue} />
      )}
      {(showReferralCode ||
        props.data.logical_field_name !== "referral_id_2") && (
      <div className="text">
        <label htmlFor={props.data.logical_field_name}>
          {props.data.rwb_label_name}
        </label>
        {showReferralCode && stageSelector[0].stageId !== "bd-1" && (
            <ReferralCode />
          )}
        <div
          className={`text__count ${
            (userInputSelector.applicants["casa_fatca_declaration_a_1"] ===
              "Y" &&
              props.data.logical_field_name === "tax_id_no") ||
            (stageSelector[0].stageId === "bd-1" &&
              props.data.logical_field_name.substring(0, 5) === "alias")
              ? "disabled"
              : ""
          }`}
        >
          <input
            type={props.data.type}
            name={props.data.logical_field_name}
            aria-label={props.data.logical_field_name}
            id={fieldIdAppend(props)}
            placeholder={placeHolderText(props.data.logical_field_name)}
            value={defaultValue}
            minLength={props.data.logical_field_name !== "referral_id_2" && props.data.min_length}
            maxLength={props.data.length}
            pattern={props.data.regex}
            onChange={changeHandler.bind(this, props.data.logical_field_name)}
            onBlur={bindHandler.bind(this, props.data.logical_field_name)}
            disabled={
             ((props.data.editable || stageSelector[0].stageId === "bd-1")
              &&
              props.data.logical_field_name !== "referral_id_2") ||
            (stageSelector[0].stageId === "bd-1" &&
              props.data.logical_field_name === "referral_id_2")
            }
            onFocus={focusHandler.bind(this, props.data.logical_field_name)}
            onKeyPress={(event) =>
              allowNumericCharacter(event, props.data.logical_field_name)
            }
          />
          {error && <span className="error-msg">{error}</span>}
          {props.data.logical_field_name &&
            props.data.logical_field_name.split("_")[0] === "alias" &&
            props.data.logical_field_name.split("_")[1] !== "1" &&
            !props.data.hide_remove_btn && (
              <span
                className="text__remove__button"
                onClick={() => removeAliasField()}
              ></span>
            )}
          {(props.data.logical_field_name === "embossed_dc_name" ||
            props.data.logical_field_name === "embossed_name" ||
            props.data.logical_field_name === "embossed_name_2") && (
            <span className="text__count__num">{embossCounter}/19</span>
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default Text;


import React from "react";
import { render, screen, fireEvent, prettyDOM } from "@testing-library/react";
import { Provider, useDispatch, useSelector } from "react-redux";
import configureStore from "redux-mock-store";
import { store } from "../../../utils/store/store";
import Text from "./text"; // Adjust the import as per your file structure
import { fieldIdAppend, getUrl } from "../../../utils/common/change.utils";

let data={
    stages: { 
        stages: {
      "stageId": "bd-1",
      "stageInfo":[ {
          "application": {
              "application_reference": "",
              "request_id": null,
              "channel_reference": "02261e4e9c90712024",
              "branch_code": "330",
              "country_code": "SG",
              "source_system_name": "3",
              "acquisition_channel": "D",
              "referral_id": "",
              "referral": "",
              "sourcing_id": null,
              "application_date": "2024-11-26",
              "priority_flag": "",
              "total_applicants": 1,
              "application_status": null,
              "authentication_flag": null,
              "stage_wise": null,
              "page_wise": "yes",
              "version": "",
              "form_type": null,
              "ext_source": null,
              "ext_source_instance": null,
              "ext_source_type": null,
              "ext_lead_reference_number": null,
              "ext_authentication_reference_number": null,
              "ext_acceptance_reference_number": null,
              "tmxSessionId": "80866c6f-a323-43bc-b30b-a95b874254b6",
              "trueClientIP": "136.226.245.112",
              "applicant_no": 0,
              "total_applicants_gb": 0,
              "is_digital_journey": null,
              "application_sourcing": null
          },
          "applicants": {
              "middle_name_a_1": null,
              "FIN_a_1": null,
              "email_preferred_contact_a_1": null,
              "sales_id_1": null,
              "pass_exp_date_a_1": null,
              "document_no_a_1": null,
              "request_id_dd": null,
              "email_classification_a_1": null,
              "mobile_preferred_contact_a_1": null,
              "last_name_a_1": null,
              "first_name_a_1": null,
              "dedupe_reason": null,
              "source_system_name": null,
              "document_category_a_1": null,
              "existing_relationship_id_a_1": null,
              "date_of_birth_a_1": null,
              "cuco_icm_relid": null,
              "passport_no_a_1": null,
              "service_type_dd": null,
              "arm_code": null,
              "full_name_a_1": null,
              "application_date": null,
              "NRIC_a_1": null,
              "last_updated_credit_limit_date_flag_a_1": null,
              "noa_valid_a_1": null,
              "home_branch_1": null,
              "mobile_classification_a_1": null,
              "dsa_code_a_1": null,
              "contact_preference_casa_a_1": null,
              "contact_preference_a_1": null,
              "mobile_contact_type_a_1": null,
              "name_of_document_a_1": null,
              "channel_reference": null,
              "referral_id_1": null,
              "email_contact_type_a_1": null,
              "email_a_1": null,
              "ebid_a_1": null,
              "email_id_change_a_1": null,
              "country_of_account_opening": null,
              "supplementary_card_flag_a_1": null,
              "segment_ntb": null,
              "other_source": null,
              "residency_status_a_1": null,
              "journey_type_a_1": null,
              "mode_of_operation": null,
              "dedupe_category": null,
              "mobile_number_a_1": null,
              "mobile_country_code_a_1": null,
              "icdd_reference_no_availability_a_1": null,
              "cpf_valid_a_1": null,
              "mobile_no_change_a_1": null
          },
          "products": [
              {
                  "name": "Priority Banking Visa Infinite Credit Card",
                  "campaign": "5885",
                  "product_sequence_number": "1",
                  "product_type": "880",
                  "product_category": "CC",
                  "company_category": "NA"
              },
              {
                  "name": "Priority Banking Visa Infinite Credit Card",
                  "campaign": "5885",
                  "product_sequence_number": "1",
                  "product_type": "880",
                  "product_category": "CC",
                  "company_category": "NA"
              }
          ],
          "fieldmetadata": {
              "version": "3.8.5",
              "country": "SG",
              "data": {
                  "stages": [
                      {
                          "stageName": "Basic Data",
                          "stageId": "BD",
                          "submitUrl": null,
                          "stageCode": null,
                          "fields": [
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "full_name",
                                  "min_length": "3",
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "Y",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Full name",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Full name as in NRIC / Passport",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "31",
                                  "seq_no": "700",
                                  "positioning": "2",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "Yes",
                                  "length": "107",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": null,
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "first_name",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "X",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "First name",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "First name",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "X",
                                  "value_pair": null,
                                  "label_length": "10",
                                  "seq_no": "800",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "Yes",
                                  "length": "35",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": null,
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": "No",
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "middle_name",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "X",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Middle name",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Middle name",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "X",
                                  "value_pair": null,
                                  "label_length": "11",
                                  "seq_no": "900",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "No",
                                  "length": "35",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": null,
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": "No",
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "last_name",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "X",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Last name",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Last name",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "X",
                                  "value_pair": null,
                                  "label_length": "9",
                                  "seq_no": "1000",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "No",
                                  "length": "35",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": null,
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": "No",
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "date_of_birth",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "Y",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Date of birth",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Date of birth",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "13",
                                  "seq_no": "1100",
                                  "positioning": "2",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Date",
                                  "mandatory": "Yes",
                                  "length": "10",
                                  "type": "Date",
                                  "lov": "No",
                                  "regex": null,
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": null,
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "email",
                                  "min_length": "8",
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "Y",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Email",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Email",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "5",
                                  "seq_no": "1200",
                                  "positioning": "2",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "Yes",
                                  "length": "70",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": "^[a-zA-Z0-9_%+\\-]+([a-zA-Z0-9_%+\\.\\-]+)@(?!.*?\\.\\.)([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": null,
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "mobile_number",
                                  "min_length": "8",
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "X",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Singapore number",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Mobile number",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "13",
                                  "seq_no": "1700",
                                  "positioning": "2",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Phone",
                                  "mandatory": "Yes",
                                  "length": "8",
                                  "type": "Numeric",
                                  "lov": "No",
                                  "regex": "^[89]\\d{7}$",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": "65",
                                  "default_visibility": null,
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "residency_status",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "Y",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Residency Status",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Residency status",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "16",
                                  "seq_no": "2300",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Radio With Label",
                                  "mandatory": "Yes",
                                  "length": "2",
                                  "type": "Picklist",
                                  "lov": "Yes",
                                  "regex": null,
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": null,
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "NRIC",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "Y",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "NRIC",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "NRIC",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "4",
                                  "seq_no": "2400",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "Conditional",
                                  "length": "9",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": "^[0-9a-zA-Z]+$",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": "No",
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "FIN",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "Y",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "FIN",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "FIN",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "3",
                                  "seq_no": "2410",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "Conditional",
                                  "length": "9",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": "^[0-9a-zA-Z]+$",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": "No",
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "pass_exp_date",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "X",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Pass expiry date",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Pass expiry date",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "16",
                                  "seq_no": "2420",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Date",
                                  "mandatory": "Conditional",
                                  "length": "9",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": "^[0-9a-zA-Z]+$",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": "No",
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "passport_no",
                                  "min_length": "5",
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "Y",
                                  "rcw_ca": "Y",
                                  "rcw_td": "Y",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Passport number",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Passport number",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "Y",
                                  "value_pair": null,
                                  "label_length": "15",
                                  "seq_no": "2500",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "Conditional",
                                  "length": "15",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": "^[0-9a-zA-Z]+$",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": "No",
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "dsa_code",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": "054",
                                  "joint": "Y",
                                  "ntb": "Y",
                                  "etb": "Y",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "X",
                                  "rcw_sa": "X",
                                  "rcw_ca": "X",
                                  "rcw_td": "X",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "Y",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "Agent Code",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Agent Code",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "X",
                                  "value_pair": null,
                                  "label_length": "10",
                                  "seq_no": "2880",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Text",
                                  "mandatory": "No",
                                  "length": "5",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": "^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$",
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": null,
                                  "header": null,
                                  "details": null,
                                  "max_selects": null,
                                  "info_tooltips": null,
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              },
                              {
                                  "country": "SG",
                                  "system_derived": null,
                                  "logical_field_name": "contact_preference",
                                  "min_length": null,
                                  "status": "A",
                                  "product_specific": "No",
                                  "sub_product_code": null,
                                  "joint": "Y",
                                  "ntb": "X",
                                  "etb": "X",
                                  "rcw_cc": "Y",
                                  "rcw_pl": "Y",
                                  "rcw_sa": "X",
                                  "rcw_ca": "X",
                                  "rcw_td": "X",
                                  "RTOB_STAGE": "BD",
                                  "rwb_rtob_stage": "DD",
                                  "rwb_rtob_sf_stage": null,
                                  "rwb_category": "ssf-1",
                                  "rwb_ipad": "X",
                                  "rwb_desktop": "Y",
                                  "sc_com": "Y",
                                  "mobile": "Y",
                                  "lov_field_name": "By clicking on \"save and next\", you agree to allow Standard Chartered Bank to contact you regarding this credit card application",
                                  "child_lov_field_name": null,
                                  "rwb_label_name": "Before you proceed with this application, please read our Customer Terms and Credit Card Terms carefully.<br>By clicking on \"Continue\", you consent to Standard Chartered Bank (Singapore) Limited (\"the Bank\"):<br>(i) contacting you regarding this application;<br>(ii) verifying (a) any of the information you provide or will be providing to the Bank regarding this application and (b) your credit standing based on information obtained from credit reference agencies; and<br>(iii) collecting, using and/or disclosing the information you provide or will be providing to the Bank regarding this application to any member of the Standard Chartered Group, for the purposes of compliance with the Standard Chartered Group's regulatory obligations.<br>If you have any existing unsecured credit facilities with the Bank, you consent and agree to the Bank reviewing and adjusting the credit limit of such existing unsecured credit facilities as the Bank may reasonably deem fit and at its sole discretion. If you are an existing customer of Trust Bank, you also consent that the credit limit of unsecured credit facilities will be shared across the Bank and Trust Bank. ",
                                  "aadhaar_prepop": null,
                                  "etb_preprop": "X",
                                  "value_pair": null,
                                  "label_length": "400",
                                  "seq_no": "2900",
                                  "positioning": "1",
                                  "field_set": "Yes",
                                  "field_set_name": "Basic Information",
                                  "component_type": "Information",
                                  "mandatory": "No",
                                  "length": "400",
                                  "type": "Text",
                                  "lov": "No",
                                  "regex": null,
                                  "sf": null,
                                  "sfp": null,
                                  "prepopulation_service_type": null,
                                  "prepopulation_field_mapping": null,
                                  "ui_derivation_logic": null,
                                  "ui_defaulted_value": null,
                                  "default_visibility": null,
                                  "header": null,
                                  "details": "If this application is not successfully completed, Standard Chartered or our appointed agents and/or representatives may contact you via email, SMS and/or voice call to assist you in completing the said application. By clicking \"Save and next\", you consent to us using your information above and contacting you via email, SMS and/or voice call for the purpose of completing this application.",
                                  "max_selects": null,
                                  "info_tooltips": "Yes",
                                  "field_set_with_info": null,
                                  "prelogin_ntc_or_ntp": "X",
                                  "postlogin_ntc_or_ntp": "X",
                                  "prelogin_etc_or_etp": "X",
                                  "postlogin_etc_or_etp": "X",
                                  "prelogin_eca": "X",
                                  "postlogin_eca": "X",
                                  "prelogin_ecc": "X",
                                  "postlogin_ecc": "X",
                                  "info_toggle": null
                              }
                          ]
                      }
                  ]
              }
          },
          "lov_desc": {},
          "stage": {
              "stage_id": "",
              "workflow_stage_id": null,
              "page_id": "ssf-1",
              "stage_status": "",
              "stage_params": {
                  "is_dedupe_required": false,
                  "current_applicant": 0,
                  "eb_status": null
              },
              "applicant_status": []
          },
          "status": {
              "status-code": "200",
              "status-message": null
          },
          "client": {
              "journey": null,
              "auth-type": null,
              "login-type": null,
              "myinfo": {
                  "myinfo-attributes": null,
                  "myinfo-code": null,
                  "myinfo-redirect-uri": null,
                  "myinfo-client-id": null,
                  "is-myinfo-virtual": false,
                  "shortform-myinfo-data-mismatch": false
              }
          }
      }]
  }, userInput: { applicants: {} } },
    fielderror: { error: {} },
    postalCode: { postalCode: {} },
    referralcode: { refer: false, referId: "", errormsg: "" },
    urlParam: { resume: false },
  };

// Mock services and actions
jest.mock("../../../utils/common/change.utils", () => ({
  fieldError: jest.fn(),
  fieldIdAppend: jest.fn(),
  getUrl: {
    getParameterByName: jest.fn(),
    getUpdatedStage: jest.fn(()=>({
        updatedStageInputs:['bd-1']
    }))
  },
  isFieldUpdate: jest.fn(),
  isFieldValueUpdate: jest.fn(),
}));


// jest.mock("../../../utils/common/change.utils", () => ({
//     fieldError: jest.fn(),
//     fieldIdAppend: jest.fn(),
//     getUrl: {
//       getParameterByName: jest.fn(),
//       getUpdatedStage: jest.fn(()=>({
//           updatedStageInputs:['bd-1']
//       }))
//     },
//     isFieldUpdate: jest.fn(),
//     isFieldValueUpdate: jest.fn(),
//   }));

jest.mock("../../../services/validation-service", () => ({
  allowOnlyCharacter: jest.fn(),
}));
jest.mock("react-redux", () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
  }));
// const mockStore = configureStore([]);


describe("Text Component", () => {
//   let store:any;
//   const props = {
//     data: 
//         {
//             "country": "SG",
//             "system_derived": null,
//             "logical_field_name": "full_name",
//             "min_length": "3",
//             "status": "A",
//             "product_specific": "No",
//             "sub_product_code": null,
//             "joint": "Y",
//             "ntb": "X",
//             "etb": "X",
//             "rcw_cc": "Y",
//             "rcw_pl": "Y",
//             "rcw_sa": "Y",
//             "rcw_ca": "Y",
//             "rcw_td": "Y",
//             "RTOB_STAGE": "BD",
//             "rwb_rtob_stage": "DD",
//             "rwb_rtob_sf_stage": null,
//             "rwb_category": "ssf-1",
//             "rwb_ipad": "X",
//             "rwb_desktop": "Y",
//             "sc_com": "Y",
//             "mobile": "Y",
//             "lov_field_name": "Full name",
//             "child_lov_field_name": null,
//             "rwb_label_name": "Full name as in NRIC / Passport",
//             "aadhaar_prepop": null,
//             "etb_preprop": "Y",
//             "value_pair": null,
//             "label_length": "31",
//             "seq_no": "700",
//             "positioning": "2",
//             "field_set": "Yes",
//             "component_type": "Text",
//             "mandatory": "Yes",
//             "length": "107",
//             "type": "Text",
//             "lov": "No",
//             "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
//             "sf": null,
//             "sfp": null,
//             "prepopulation_service_type": null,
//             "prepopulation_field_mapping": null,
//             "ui_derivation_logic": null,
//             "ui_defaulted_value": null,
//             "default_visibility": null,
//             "header": null,
//             "details": null,
//             "max_selects": null,
//             "info_tooltips": null,
//             "field_set_with_info": null,
//             "prelogin_ntc_or_ntp": "X",
//             "postlogin_ntc_or_ntp": "X",
//             "prelogin_etc_or_etp": "X",
//             "postlogin_etc_or_etp": "X",
//             "prelogin_eca": "X",
//             "postlogin_eca": "X",
//             "prelogin_ecc": "X",
//             "postlogin_ecc": "X",
//             "info_toggle": null,
//             "editable": false
//     },
//     handleCallback: jest.fn(),
//   };

beforeEach(()=>{
    jest.clearAllMocks()
});

  it("renders without crashing", () => {
    // (store.getState as jest.Mock).mockReturnValue({
    //     stages: {
    //       stages: [{
    //                 stageId:'bd-1',
    //                 stageInfo:{
    //                     applicants:{
    //                         casa_fatca_declaration_a_1:"",
    //                 annual_income_a_1:"100",
    //                 full_name_a_1:"test",
    //                     }
    //                 }
                  
    //             }],
    //         userInput:{
    //             applicants:{
    //                 casa_fatca_declaration_a_1:"",
    //                 annual_income_a_1:"100",
    //                 full_name_a_1:"test",
    //             }
    //         }
    //     },
    //   });
    const mockStageSelector =[{
            stageId:'bd-1',
            stageInfo:{
                applicants:{
                    annual_income_a_1:"100"
                }
            }
          
        }]
    ;
    const userInput ={ applicants:{
        casa_fatca_declaration_a_1:"",
        annual_income_a_1:"100"
    }
};
    // (useSelector as jest.Mock).mockReturnValue({ applicants:{
    //     casa_fatca_declaration_a_1:"",
    //     annual_income_a_1:"100"
    // } });
    
    (useSelector as jest.Mock).mockImplementation((SelectorFn)=>{
        if(SelectorFn.toString().includes("state.stages.stages"))
         return [{
            stageId:'bd-1',
            stageInfo:{
                applicants:{
                    annual_income_a_1:"100"
                }
            }
          
        }];
        if(SelectorFn.toString().includes("state.stages.userInput"))
         return { applicants:{
            casa_fatca_declaration_a_1:"",
            annual_income_a_1:"100",
            full_name_a_1:"test",
        } }
    
    });
    (getUrl.getUpdatedStage as jest.Mock).mockReturnValue({
        updatedStageInputs:[{stageId:"bd-1",applicants:{annual_income_a_1:"100",
        full_name_a_1:"test",}}]
    });
    (fieldIdAppend as jest.Mock).mockReturnValue("full_name_a_1");
    (useDispatch as jest.Mock).mockReturnValue(()=> jest.fn());
    let data={
        "country": "SG",
        "system_derived": null,
        "logical_field_name": "annual_income",
        "min_length": "3",
        "status": "A",
        "product_specific": "No",
        "sub_product_code": null,
        "joint": "Y",
        "ntb": "X",
        "etb": "X",
        "rcw_cc": "Y",
        "rcw_pl": "Y",
        "rcw_sa": "Y",
        "rcw_ca": "Y",
        "rcw_td": "Y",
        "RTOB_STAGE": "BD",
        "rwb_rtob_stage": "DD",
        "rwb_rtob_sf_stage": null,
        "rwb_category": "ssf-1",
        "rwb_ipad": "X",
        "rwb_desktop": "Y",
        "sc_com": "Y",
        "mobile": "Y",
        "lov_field_name": "Full name",
        "child_lov_field_name": null,
        "rwb_label_name": "Full name as in NRIC / Passport",
        "aadhaar_prepop": null,
        "etb_preprop": "Y",
        "value_pair": null,
        "label_length": "31",
        "seq_no": "700",
        "positioning": "2",
        "field_set": "Yes",
        "component_type": "Text",
        "mandatory": "Yes",
        "length": "107",
        "type": "Text",
        "lov": "No",
        "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
        "sf": null,
        "sfp": null,
        "prepopulation_service_type": null,
        "prepopulation_field_mapping": null,
        "ui_derivation_logic": null,
        "ui_defaulted_value": null,
        "default_visibility": null,
        "header": null,
        "details": null,
        "max_selects": null,
        "info_tooltips": null,
        "field_set_with_info": null,
        "prelogin_ntc_or_ntp": "X",
        "postlogin_ntc_or_ntp": "X",
        "prelogin_etc_or_etp": "X",
        "postlogin_etc_or_etp": "X",
        "prelogin_eca": "X",
        "postlogin_eca": "X",
        "prelogin_ecc": "X",
        "postlogin_ecc": "X",
        "info_toggle": null,
        "editable": false
    };
    let props={
        data, handleCallback: jest.fn(), handleFieldDispatch: jest.fn(),value:{}
    }

    render(<Text {...props} />);
    const textinput = screen.getByPlaceholderText('Full name as in NRIC / Passport');
    fireEvent.change(textinput,{target:{value:"test"}});
  });



  it("renders without crashing for referral_id_2", () => {

    
    (useSelector as jest.Mock).mockImplementation((SelectorFn)=>{
        if(SelectorFn.toString().includes("state.stages.stages"))
         return [{
            stageId:'bd-1',
            stageInfo:{
                applicants:{
                    annual_income_a_1:"100"
                }
            }
          
        }];
        if(SelectorFn.toString().includes("state.stages.userInput"))
         return { applicants:{
            casa_fatca_declaration_a_1:"",
            annual_income_a_1:"100",
            full_name_a_1:"test",
        } }
    
    });
    (getUrl.getUpdatedStage as jest.Mock).mockReturnValue({
        updatedStageInputs:[{stageId:"bd-1",applicants:{annual_income_a_1:"100",
        full_name_a_1:"test",}}]
    });
    (fieldIdAppend as jest.Mock).mockReturnValue("full_name_a_1");
    (useDispatch as jest.Mock).mockReturnValue(()=> jest.fn());
    let data={
        "country": "SG",
        "system_derived": null,
        "logical_field_name": "full_name",
        "min_length": "3",
        "status": "A",
        "product_specific": "No",
        "sub_product_code": null,
        "joint": "Y",
        "ntb": "X",
        "etb": "X",
        "rcw_cc": "Y",
        "rcw_pl": "Y",
        "rcw_sa": "Y",
        "rcw_ca": "Y",
        "rcw_td": "Y",
        "RTOB_STAGE": "BD",
        "rwb_rtob_stage": "DD",
        "rwb_rtob_sf_stage": null,
        "rwb_category": "ssf-1",
        "rwb_ipad": "X",
        "rwb_desktop": "Y",
        "sc_com": "Y",
        "mobile": "Y",
        "lov_field_name": "Full name",
        "child_lov_field_name": null,
        "rwb_label_name": "Full name as in NRIC / Passport",
        "aadhaar_prepop": null,
        "etb_preprop": "Y",
        "value_pair": null,
        "label_length": "31",
        "seq_no": "700",
        "positioning": "2",
        "field_set": "Yes",
        "component_type": "Text",
        "mandatory": "Yes",
        "length": "107",
        "type": "Text",
        "lov": "No",
        "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
        "sf": null,
        "sfp": null,
        "prepopulation_service_type": null,
        "prepopulation_field_mapping": null,
        "ui_derivation_logic": null,
        "ui_defaulted_value": null,
        "default_visibility": null,
        "header": null,
        "details": null,
        "max_selects": null,
        "info_tooltips": null,
        "field_set_with_info": null,
        "prelogin_ntc_or_ntp": "X",
        "postlogin_ntc_or_ntp": "X",
        "prelogin_etc_or_etp": "X",
        "postlogin_etc_or_etp": "X",
        "prelogin_eca": "X",
        "postlogin_eca": "X",
        "prelogin_ecc": "X",
        "postlogin_ecc": "X",
        "info_toggle": null,
        "editable": false
    };
    let props={
        data, handleCallback: jest.fn(), handleFieldDispatch: jest.fn(),value:{}
    }

    render(<Text {...props} />);

const textinput = screen.getByPlaceholderText('Full name as in NRIC / Passport');
fireEvent.change(textinput,{target:{value:"test"}});
  });


  it("renders without crashing for passport_no", () => {

    
    (useSelector as jest.Mock).mockImplementation((SelectorFn)=>{
        if(SelectorFn.toString().includes("state.stages.stages"))
         return [{
            stageId:'bd-1',
            stageInfo:{
                applicants:{
                    annual_income_a_1:"100"
                }
            }
          
        }];
        if(SelectorFn.toString().includes("state.stages.userInput"))
         return { applicants:{
            casa_fatca_declaration_a_1:"",
            annual_income_a_1:"100",
            full_name_a_1:"test",
        } }
    
    });
    (getUrl.getUpdatedStage as jest.Mock).mockReturnValue({
        updatedStageInputs:[{stageId:"bd-1",applicants:{annual_income_a_1:"100",
        full_name_a_1:"test",}}]
    });
    (fieldIdAppend as jest.Mock).mockReturnValue("full_name_a_1");
    (useDispatch as jest.Mock).mockReturnValue(()=> jest.fn());
    let data={
        "country": "SG",
        "system_derived": null,
        "logical_field_name": "passport_no",
        "min_length": "3",
        "status": "A",
        "product_specific": "No",
        "sub_product_code": null,
        "joint": "Y",
        "ntb": "X",
        "etb": "X",
        "rcw_cc": "Y",
        "rcw_pl": "Y",
        "rcw_sa": "Y",
        "rcw_ca": "Y",
        "rcw_td": "Y",
        "RTOB_STAGE": "BD",
        "rwb_rtob_stage": "DD",
        "rwb_rtob_sf_stage": null,
        "rwb_category": "ssf-1",
        "rwb_ipad": "X",
        "rwb_desktop": "Y",
        "sc_com": "Y",
        "mobile": "Y",
        "lov_field_name": "Full name",
        "child_lov_field_name": null,
        "rwb_label_name": "Full name as in NRIC / Passport",
        "aadhaar_prepop": null,
        "etb_preprop": "Y",
        "value_pair": null,
        "label_length": "31",
        "seq_no": "700",
        "positioning": "2",
        "field_set": "Yes",
        "component_type": "Text",
        "mandatory": "Yes",
        "length": "107",
        "type": "Text",
        "lov": "No",
        "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
        "sf": null,
        "sfp": null,
        "prepopulation_service_type": null,
        "prepopulation_field_mapping": null,
        "ui_derivation_logic": null,
        "ui_defaulted_value": null,
        "default_visibility": null,
        "header": null,
        "details": null,
        "max_selects": null,
        "info_tooltips": null,
        "field_set_with_info": null,
        "prelogin_ntc_or_ntp": "X",
        "postlogin_ntc_or_ntp": "X",
        "prelogin_etc_or_etp": "X",
        "postlogin_etc_or_etp": "X",
        "prelogin_eca": "X",
        "postlogin_eca": "X",
        "prelogin_ecc": "X",
        "postlogin_ecc": "X",
        "info_toggle": null,
        "editable": false
    };
    let props={
        data, handleCallback: jest.fn(), handleFieldDispatch: jest.fn(),value:{}
    }

    render(<Text {...props} />);
screen.debug()
const textinput = screen.getByPlaceholderText('Enter your passport Number');
fireEvent.change(textinput,{target:{value:"test"}});
  });


  it("renders without crashing for block", () => {

    
    (useSelector as jest.Mock).mockImplementation((SelectorFn)=>{
        if(SelectorFn.toString().includes("state.stages.stages"))
         return [{
            stageId:'bd-1',
            stageInfo:{
                applicants:{
                    annual_income_a_1:"100"
                }
            }
          
        }];
        if(SelectorFn.toString().includes("state.stages.userInput"))
         return { applicants:{
            casa_fatca_declaration_a_1:"",
            annual_income_a_1:"100",
            full_name_a_1:"test",
        } }
        if(SelectorFn.toString().includes("state.postalCode.postalCode"))
        return ""
    
    });
    (getUrl.getUpdatedStage as jest.Mock).mockReturnValue({
        updatedStageInputs:[{stageId:"bd-1",applicants:{annual_income_a_1:"100",
        full_name_a_1:"test",}}]
    });
    (fieldIdAppend as jest.Mock).mockReturnValue("full_name_a_1");
    (useDispatch as jest.Mock).mockReturnValue(()=> jest.fn());
    let data={
        "country": "SG",
        "system_derived": null,
        "logical_field_name": "block",
        "min_length": "3",
        "status": "A",
        "product_specific": "No",
        "sub_product_code": null,
        "joint": "Y",
        "ntb": "X",
        "etb": "X",
        "rcw_cc": "Y",
        "rcw_pl": "Y",
        "rcw_sa": "Y",
        "rcw_ca": "Y",
        "rcw_td": "Y",
        "RTOB_STAGE": "BD",
        "rwb_rtob_stage": "DD",
        "rwb_rtob_sf_stage": null,
        "rwb_category": "ssf-1",
        "rwb_ipad": "X",
        "rwb_desktop": "Y",
        "sc_com": "Y",
        "mobile": "Y",
        "lov_field_name": "Full name",
        "child_lov_field_name": null,
        "rwb_label_name": "Full name as in NRIC / Passport",
        "aadhaar_prepop": null,
        "etb_preprop": "Y",
        "value_pair": null,
        "label_length": "31",
        "seq_no": "700",
        "positioning": "2",
        "field_set": "Yes",
        "component_type": "Text",
        "mandatory": "Conditional",
        "length": "107",
        "type": "Text",
        "lov": "No",
        "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
        "sf": null,
        "sfp": null,
        "prepopulation_service_type": null,
        "prepopulation_field_mapping": null,
        "ui_derivation_logic": null,
        "ui_defaulted_value": null,
        "default_visibility": null,
        "header": null,
        "details": null,
        "max_selects": null,
        "info_tooltips": null,
        "field_set_with_info": null,
        "prelogin_ntc_or_ntp": "X",
        "postlogin_ntc_or_ntp": "X",
        "prelogin_etc_or_etp": "X",
        "postlogin_etc_or_etp": "X",
        "prelogin_eca": "X",
        "postlogin_eca": "X",
        "prelogin_ecc": "X",
        "postlogin_ecc": "X",
        "info_toggle": null,
        "editable": false
    };
    let props={
        data, handleCallback: jest.fn(), handleFieldDispatch: jest.fn(),value:{}
    }

    render(<Text {...props} />);
    
const textinput = screen.getByPlaceholderText('Full name as in NRIC / Passport');
fireEvent.change(textinput,{target:{value:"67"}});
  });




  it("renders without crashing for street_name", () => {
    (useSelector as jest.Mock).mockImplementation((SelectorFn)=>{
        if(SelectorFn.toString().includes("state.stages.stages"))
         return [{
            stageId:'bd-1',
            stageInfo:{
                applicants:{
                    annual_income_a_1:"100"
                }
            }
          
        }];
        if(SelectorFn.toString().includes("state.stages.userInput"))
         return { applicants:{
            casa_fatca_declaration_a_1:"",
            annual_income_a_1:"100",
            full_name_a_1:"test",
            street_name_a_1:"UB001"
        } }
        if(SelectorFn.toString().includes("state.postalCode.postalCode"))
        return ""
    
    });
    (getUrl.getUpdatedStage as jest.Mock).mockReturnValue({
        updatedStageInputs:[{stageId:"bd-1",applicants:{annual_income_a_1:"100",
        full_name_a_1:"test",street_name_a_1:"UB001"}}]
    });
    (fieldIdAppend as jest.Mock).mockReturnValue("street_name_a_1");
    (useDispatch as jest.Mock).mockReturnValue(()=> jest.fn());
  
    let data = {
        "country": "SG",
        "system_derived": null,
        "logical_field_name": "street_name",
        "min_length": "3",
        "status": "A",
        "product_specific": "No",
        "sub_product_code": null,
        "joint": "Y",
        "ntb": "X",
        "etb": "X",
        "rcw_cc": "Y",
        "rcw_pl": "Y",
        "rcw_sa": "Y",
        "rcw_ca": "Y",
        "rcw_td": "Y",
        "RTOB_STAGE": "BD",
        "rwb_rtob_stage": "DD",
        "rwb_rtob_sf_stage": null,
        "rwb_category": "ssf-1",
        "rwb_ipad": "X",
        "rwb_desktop": "Y",
        "sc_com": "Y",
        "mobile": "Y",
        "lov_field_name": "block",
        "child_lov_field_name": null,
        "rwb_label_name": "Full name as in NRIC / Passport",
        "aadhaar_prepop": null,
        "etb_preprop": "Y",
        "value_pair": null,
        "label_length": "31",
        "seq_no": "700",
        "positioning": "2",
        "field_set": "Yes",
        "component_type": "Text",
        "mandatory": "Yes",
        "length": "107",
        "type": "Text",
        "lov": "No",
        "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
        "sf": null,
        "sfp": null,
        "prepopulation_service_type": null,
        "prepopulation_field_mapping": null,
        "ui_derivation_logic": null,
        "ui_defaulted_value": null,
        "default_visibility": null,
        "header": null,
        "details": null,
        "max_selects": null,
        "info_tooltips": null,
        "field_set_with_info": null,
        "prelogin_ntc_or_ntp": "X",
        "postlogin_ntc_or_ntp": "X",
        "prelogin_etc_or_etp": "X",
        "postlogin_etc_or_etp": "X",
        "prelogin_eca": "X",
        "postlogin_eca": "X",
        "prelogin_ecc": "X",
        "postlogin_ecc": "X",
        "info_toggle": null,
        "editable": false
    };
    let props={
        data, handleCallback: jest.fn(), handleFieldDispatch: jest.fn(),value:{}
    }
    render(<Text {...props} />);
const textinput = screen.getByPlaceholderText('Full name as in NRIC / Passport');
fireEvent.change(textinput,{target:{value:"123445"}});
  });

  it("renders without crashing for building_name", () => {
    (useSelector as jest.Mock).mockImplementation((SelectorFn)=>{
        if(SelectorFn.toString().includes("state.stages.stages"))
         return [{
            stageId:'bd-1',
            stageInfo:{
                applicants:{
                    annual_income_a_1:"100"
                }
            }
          
        }];
        if(SelectorFn.toString().includes("state.stages.userInput"))
         return { applicants:{
            casa_fatca_declaration_a_1:"",
            annual_income_a_1:"100",
            full_name_a_1:"test",
            street_name_a_1:"UB001"
        } }
        if(SelectorFn.toString().includes("state.postalCode.postalCode"))
        return ""
    
    });
    (getUrl.getUpdatedStage as jest.Mock).mockReturnValue({
        updatedStageInputs:[{stageId:"bd-1",applicants:{annual_income_a_1:"100",
        full_name_a_1:"test",street_name_a_1:"UB001"}}]
    });
    (fieldIdAppend as jest.Mock).mockReturnValue("street_name_a_1");
    (useDispatch as jest.Mock).mockReturnValue(()=> jest.fn());
  
    let data = {
        "country": "SG",
        "system_derived": null,
        "logical_field_name": "building_name",
        "min_length": "3",
        "status": "A",
        "product_specific": "No",
        "sub_product_code": null,
        "joint": "Y",
        "ntb": "X",
        "etb": "X",
        "rcw_cc": "Y",
        "rcw_pl": "Y",
        "rcw_sa": "Y",
        "rcw_ca": "Y",
        "rcw_td": "Y",
        "RTOB_STAGE": "BD",
        "rwb_rtob_stage": "DD",
        "rwb_rtob_sf_stage": null,
        "rwb_category": "ssf-1",
        "rwb_ipad": "X",
        "rwb_desktop": "Y",
        "sc_com": "Y",
        "mobile": "Y",
        "lov_field_name": "block",
        "child_lov_field_name": null,
        "rwb_label_name": "Full name as in NRIC / Passport",
        "aadhaar_prepop": null,
        "etb_preprop": "Y",
        "value_pair": null,
        "label_length": "31",
        "seq_no": "700",
        "positioning": "2",
        "field_set": "Yes",
        "component_type": "Text",
        "mandatory": "Yes",
        "length": "107",
        "type": "Text",
        "lov": "No",
        "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
        "sf": null,
        "sfp": null,
        "prepopulation_service_type": null,
        "prepopulation_field_mapping": null,
        "ui_derivation_logic": null,
        "ui_defaulted_value": null,
        "default_visibility": null,
        "header": null,
        "details": null,
        "max_selects": null,
        "info_tooltips": null,
        "field_set_with_info": null,
        "prelogin_ntc_or_ntp": "X",
        "postlogin_ntc_or_ntp": "X",
        "prelogin_etc_or_etp": "X",
        "postlogin_etc_or_etp": "X",
        "prelogin_eca": "X",
        "postlogin_eca": "X",
        "prelogin_ecc": "X",
        "postlogin_ecc": "X",
        "info_toggle": null,
        "editable": false
    };
    let props={
        data, handleCallback: jest.fn(), handleFieldDispatch: jest.fn(),value:{}
    }
    render(<Text {...props} />);
const textinput = screen.getByPlaceholderText('Full name as in NRIC / Passport');
fireEvent.change(textinput,{target:{value:"123445"}});
  });



  it("renders without crashing for residential_address", () => {
    (useSelector as jest.Mock).mockImplementation((SelectorFn)=>{
        if(SelectorFn.toString().includes("state.stages.stages"))
         return [{
            stageId:'bd-1',
            stageInfo:{
                application:{
                    journey_type:"NTC"
                },
                applicants:{
                    annual_income_a_1:"100",
                    mailing_address_a_1:"wdw@ada.com"
                },
                products:[{product_category:"CC"}]
            }
          
        }];
        if(SelectorFn.toString().includes("state.stages.userInput"))
         return { applicants:{
            casa_fatca_declaration_a_1:"",
            annual_income_a_1:"100",
            full_name_a_1:"test",
            street_name_a_1:"UB001"
        } }
        if(SelectorFn.toString().includes("state.postalCode.postalCode"))
        return ""
    
    });
    (getUrl.getUpdatedStage as jest.Mock).mockReturnValue({
        updatedStageInputs:[{stageId:"bd-1",applicants:{annual_income_a_1:"100",
        full_name_a_1:"test",street_name_a_1:"UB001"}}]
    });
    (fieldIdAppend as jest.Mock).mockReturnValue("street_name_a_1");
    (useDispatch as jest.Mock).mockReturnValue(()=> jest.fn());
    (getUrl.getParameterByName as jest.Mock).mockReturnValue("true");
    let data = {
        "country": "SG",
        "system_derived": null,
        "logical_field_name": "residential_address",
        "min_length": "3",
        "status": "A",
        "product_specific": "No",
        "sub_product_code": null,
        "joint": "Y",
        "ntb": "X",
        "etb": "X",
        "rcw_cc": "Y",
        "rcw_pl": "Y",
        "rcw_sa": "Y",
        "rcw_ca": "Y",
        "rcw_td": "Y",
        "RTOB_STAGE": "BD",
        "rwb_rtob_stage": "DD",
        "rwb_rtob_sf_stage": null,
        "rwb_category": "ssf-1",
        "rwb_ipad": "X",
        "rwb_desktop": "Y",
        "sc_com": "Y",
        "mobile": "Y",
        "lov_field_name": "block",
        "child_lov_field_name": null,
        "rwb_label_name": "Full name as in NRIC / Passport",
        "aadhaar_prepop": null,
        "etb_preprop": "Y",
        "value_pair": null,
        "label_length": "31",
        "seq_no": "700",
        "positioning": "2",
        "field_set": "Yes",
        "component_type": "Text",
        "mandatory": "Yes",
        "length": "107",
        "type": "Text",
        "lov": "No",
        "regex": "^[a-zA-Z-@&().,\\\"'\\\\/]+(?: [a-zA-Z-@&().,\\\"'\\\\/]+)*$",
        "sf": null,
        "sfp": null,
        "prepopulation_service_type": null,
        "prepopulation_field_mapping": null,
        "ui_derivation_logic": null,
        "ui_defaulted_value": null,
        "default_visibility": null,
        "header": null,
        "details": null,
        "max_selects": null,
        "info_tooltips": null,
        "field_set_with_info": null,
        "prelogin_ntc_or_ntp": "X",
        "postlogin_ntc_or_ntp": "X",
        "prelogin_etc_or_etp": "X",
        "postlogin_etc_or_etp": "X",
        "prelogin_eca": "X",
        "postlogin_eca": "X",
        "prelogin_ecc": "X",
        "postlogin_ecc": "X",
        "info_toggle": null,
        "editable": false
    };
    let props={
        data, handleCallback: jest.fn(), handleFieldDispatch: jest.fn(),value:{}
    }
    render(<Text {...props} />);
const textinput = screen.getByPlaceholderText('Full name as in NRIC / Passport');
fireEvent.change(textinput,{target:{value:"123445"}});
  });
});
