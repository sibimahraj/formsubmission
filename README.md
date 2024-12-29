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
  console.log(
    "fielderror",useSelector(
      (state: StoreModel) => state.fielderror.error
    )
  )
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


 
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Text from "./text"; // Adjust the path based on your file structure
import thunk from "redux-thunk";
 
// Mock Redux store
const mockStore = configureStore([thunk]);
const mockHandleFieldDispatch = jest.fn();
let store: any;
 
describe("Text Component", () => {
  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageId: "ssf-2",
            stageInfo: {
              applicants: {
                tax_id_no_a_1: "123456789",
                embossed_name_a_1: "John Doe",
                casa_fatca_declaration_a_1: "Y",
              },
            },
          },
        ],
        userInput: {
          applicants: {
            annual_income_a_1: "50000",
            required_loan_amount_a_1: "100000",
            loan_tenor_a_1: "5",
          },
        },
      },
      fielderror: {
        error: [
          {
            logical_field_name: "referral_id_2",
            message: "Invalid referral ID",
          },
        ],
      },
      postalCode: {
        postalCode: [
          {
            code: "12345",
          },
        ],
      },
      urlParam: {
        resume: [
          {
            status: "pending",
          },
        ],
      },
      referralcode: {
        errormsg: "",
        referId: "REF123",
      },
    });
  });
 
  it("renders correctly and handles input changes when editable", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Tax ID Number",
            type: "text",
            min_length: 10,
            length: 15,
            regex: "\\d+",
            editable: true,  // Editable is true, this should be handled
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );
 
    const input = screen.getByPlaceholderText("Tax ID Number");
    expect(input).toBeInTheDocument();
 
    // Simulate user input
    fireEvent.change(input, { target: { value: "987654321" } });
    expect(input).toHaveValue("987654321");
  });
 
  it("does not allow changes when editable is false", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Tax ID Number",
            type: "text",
            min_length: 10,
            length: 15,
            regex: "\\d+",
            editable: false,  // Editable is false, input should be disabled
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );
 
    const input = screen.getByPlaceholderText("Tax ID Number");
    expect(input).toBeDisabled();
  });
 
  it("displays the error message when input is invalid according to regex", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "referral_id_2",
            rwb_label_name: "Referral ID",
            placeholder: "Enter referral code here",
            type: "text",
            min_length: 5,
            length: 10,
            regex: "[A-Za-z0-9]+",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );
 
    const input = screen.getByPlaceholderText("Enter referral code here");
    expect(input).toBeInTheDocument();
 
    // Simulate invalid input
    fireEvent.change(input, { target: { value: "$$$" } });
    const errorMsg = screen.getByText("Referral ID");
    expect(errorMsg).toBeInTheDocument();
  });
 
  it("displays error when input is shorter than min_length", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "referral_id_2",
            rwb_label_name: "Referral ID",
            placeholder: "Enter referral code here",
            type: "text",
            min_length: 5,  // Min length set to 5
            length: 10,
            regex: "[A-Za-z0-9]+",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );
 
    const input = screen.getByPlaceholderText("Enter referral code here");
    expect(input).toBeInTheDocument();
 
    // Simulate invalid input (too short)
    fireEvent.change(input, { target: { value: "123" } });
    const errorMsg = screen.getByText("Referral ID");
    expect(errorMsg).toBeInTheDocument();
  });
 
  it("shows error message from store when field has an error", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "referral_id_2",
            rwb_label_name: "Referral ID",
            placeholder: "Enter referral code here",
            type: "text",
            min_length: 5,
            length: 10,
            regex: "[A-Za-z0-9]+",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );
 
    const errorMsg = screen.getByText("Invalid referral ID");
    expect(errorMsg).toBeInTheDocument();
  });
 
  it("handles input clearing", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Tax ID Number",
            type: "text",
            min_length: 10,
            length: 15,
            regex: "\\d+",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );
 
    const input = screen.getByPlaceholderText("Tax ID Number");
    fireEvent.change(input, { target: { value: "987654321" } });
    expect(input).toHaveValue("987654321");
 
    // Clear input
    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue("");
  });
});
 
