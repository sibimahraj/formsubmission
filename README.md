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


import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Text from "./text"; // Adjust the path based on your file structure
import thunk from "redux-thunk";
import * as referralcodeAction from "../../actions/referralcodeAction"; // Adjust the path based on your file structure
import * as validateService from "../../services/validateService"; // Adjust the path based on your file structure

// Mock Redux store
const mockStore = configureStore([thunk]);
const mockHandleFieldDispatch = jest.fn();
let store: any;

describe("changeHandler", () => {
  let mockSetDefaultValue: jest.Mock;
  let mockSetError: jest.Mock;
  let mockEmbossedNameCounter: jest.Mock;

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

    mockSetDefaultValue = jest.fn();
    mockSetError = jest.fn();
    mockEmbossedNameCounter = jest.fn();
  });

  it("handles input change and updates the store correctly", () => {
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
    expect(input).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(input, { target: { value: "987654321" } });

    // Check if changeHandler logic works correctly
    expect(mockEmbossedNameCounter).toHaveBeenCalledWith("987654321");
    expect(mockSetDefaultValue).toHaveBeenCalledWith("987654321");
    expect(mockHandleFieldDispatch).toHaveBeenCalledWith(
      { logical_field_name: "tax_id_no" },
      "987654321"
    );
    expect(mockSetError).toHaveBeenCalledWith("");
  });

  it("sets error when input is mandatory and empty", () => {
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
            mandatory: "Yes",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Tax ID Number");
    expect(input).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(input, { target: { value: "" } });

    // Check if changeHandler logic sets the error correctly
    expect(mockSetError).toHaveBeenCalledWith("Tax ID Number is required");
  });

  it("sets error when input has leading or trailing spaces", () => {
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
    expect(input).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(input, { target: { value: " 987654321 " } });

    // Check if changeHandler logic sets the error correctly
    expect(mockSetError).toHaveBeenCalledWith(
      "Tax ID Number cannot have leading or trailing spaces"
    );
  });

  it("sets error when input does not match regex pattern", () => {
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
    expect(input).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(input, { target: { value: "abc" } });

    // Check if changeHandler logic sets the error correctly
    expect(mockSetError).toHaveBeenCalledWith("Invalid pattern for Tax ID Number");
  });
});

  expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "Tax ID Number is required"

    Number of calls: 0

      296 |
      297 |     // Check if changeHandler logic sets the error correctly
    > 298 |     expect(mockSetError).toHaveBeenCalledWith("Tax ID Number is required");
          |                          ^
      299 |   });
      300 |
      301 |   it("sets error when input has leading or trailing spaces", () => {

      at Object.toHaveBeenCalledWith (src/shared/components/text/text.test.tsx:298:26)

       useEffect(() => {
    let setPostalValue = null;
    Iif (
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


  import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import Text from "./text"; // Adjust the path based on your file structure
import * as actions from "../../actions"; // Adjust the path based on your file structure
import React from "react";

// Mock Redux store
const mockStore = configureStore([thunk]);
const mockHandleFieldDispatch = jest.fn();
const mockIsFieldValueUpdate = jest.fn();
const mockIsFieldUpdate = jest.fn();
let store: any;

jest.mock("../../actions", () => ({
  isFieldValueUpdate: jest.fn(() => mockIsFieldValueUpdate),
  isFieldUpdate: jest.fn(() => mockIsFieldUpdate),
}));

describe("Text Component useEffect", () => {
  let setDefaultValue: jest.Mock;

  beforeEach(() => {
    store = mockStore({
      postalCode: {
        block_a_1: "Block A",
        building_name_a_1: "Building B",
        street_name_a_1: "Street C",
      },
    });

    setDefaultValue = jest.fn();
  });

  it("sets default value and dispatches actions when postal code changes for block", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "block",
            rwb_label_name: "Block",
            placeholder: "Block",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
        />
      </Provider>
    );

    // Check if setDefaultValue and dispatch are called with correct values
    expect(setDefaultValue).toHaveBeenCalledWith("Block A");
    expect(mockHandleFieldDispatch).toHaveBeenCalledWith(
      { logical_field_name: "block" },
      "Block A"
    );
    expect(mockIsFieldValueUpdate).toHaveBeenCalled();
    expect(mockIsFieldUpdate).toHaveBeenCalled();
  });

  it("sets default value and dispatches actions when postal code changes for building_name", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "building_name",
            rwb_label_name: "Building Name",
            placeholder: "Building Name",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
        />
      </Provider>
    );

    // Check if setDefaultValue and dispatch are called with correct values
    expect(setDefaultValue).toHaveBeenCalledWith("Building B");
    expect(mockHandleFieldDispatch).toHaveBeenCalledWith(
      { logical_field_name: "building_name" },
      "Building B"
    );
    expect(mockIsFieldValueUpdate).toHaveBeenCalled();
    expect(mockIsFieldUpdate).toHaveBeenCalled();
  });

  it("sets default value and dispatches actions when postal code changes for street_name", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "street_name",
            rwb_label_name: "Street Name",
            placeholder: "Street Name",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
        />
      </Provider>
    );

    // Check if setDefaultValue and dispatch are called with correct values
    expect(setDefaultValue).toHaveBeenCalledWith("Street C");
    expect(mockHandleFieldDispatch).toHaveBeenCalledWith(
      { logical_field_name: "street_name" },
      "Street C"
    );
    expect(mockIsFieldValueUpdate).toHaveBeenCalled();
    expect(mockIsFieldUpdate).toHaveBeenCalled();
  });
});

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

  import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import Text from "./text"; // Adjust the path based on your file structure
import * as actions from "../../actions"; // Adjust the path based on your file structure
import React from "react";

// Mock Redux store
const mockStore = configureStore([thunk]);
let store: any;

jest.mock("../../actions", () => ({
  isFieldUpdate: jest.fn(),
  referralcodeAction: {
    setReferralId: jest.fn(),
  },
}));

describe("Text Component Complex useEffect", () => {
  let setDefaultValue: jest.Mock;
  let embossedNameCounter: jest.Mock;

  beforeEach(() => {
    store = mockStore({
      referralcodeSelector: {
        refer: "true",
        referId: "REF123",
      },
      stageSelector: [
        {
          stageId: "ssf-2",
          stageInfo: {
            applicants: {
              block_a_1: "Block A",
              building_name_a_1: "Building B",
              street_name_a_1: "Street C",
              postal_code_a_1: "12345",
              full_name_a_1: "John Doe",
              NRIC_a_1: "S1234567A",
              casa_fatca_declaration_a_1: "Y",
            },
          },
        },
      ],
      userInputSelector: {
        applicants: {
          "tax_id_no_a_1": "987654321",
        },
      },
      getUrl: {
        getParameterByName: jest.fn().mockReturnValue("resume"),
        getUpdatedStage: jest.fn().mockReturnValue({
          updatedStageInputs: [
            {
              stageId: "ssf-2",
              applicants: {
                "tax_id_no_a_1": "987654321",
              },
            },
          ],
        }),
      },
      resumeSelector: {},
    });

    setDefaultValue = jest.fn();
    embossedNameCounter = jest.fn();
  });

  it("sets referral code when referral_id_2 is true and referId is provided", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={jest.fn()}
          data={{
            logical_field_name: "referral_id_2",
            rwb_label_name: "Referral ID",
            placeholder: "Referral ID",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
          embossedNameCounter={embossedNameCounter}
        />
      </Provider>
    );

    // Check if referral code is set correctly
    expect(setDefaultValue).toHaveBeenCalledWith("REF123");
    expect(actions.referralcodeAction.setReferralId).toHaveBeenCalledWith("REF123");
  });

  it("sets default value for referral_id_2 when referId is null", () => {
    store = mockStore({
      referralcodeSelector: {
        refer: "true",
        referId: null,
      },
      // other mock data remains the same
    });

    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={jest.fn()}
          data={{
            logical_field_name: "referral_id_2",
            rwb_label_name: "Referral ID",
            placeholder: "Referral ID",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
          embossedNameCounter={embossedNameCounter}
        />
      </Provider>
    );

    // Check if referral code is set to an empty string
    expect(setDefaultValue).toHaveBeenCalledWith("");
  });

  it("sets default value for referral_id_2 when auth=resume", () => {
    store = mockStore({
      referralcodeSelector: {
        refer: "true",
        referId: "REF123",
      },
      // other mock data remains the same
    });

    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={jest.fn()}
          data={{
            logical_field_name: "referral_id_2",
            rwb_label_name: "Referral ID",
            placeholder: "Referral ID",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
          embossedNameCounter={embossedNameCounter}
        />
      </Provider>
    );

    // Check if referral code is set correctly when "auth" parameter is "resume"
    expect(setDefaultValue).toHaveBeenCalledWith("REF123");
  });

  it("sets address when logical_field_name is residential_address", () => {
    store = mockStore({
      stageSelector: [
        {
          stageId: "ssf-2",
          stageInfo: {
            applicants: {
              block_a_1: "Block A",
              building_name_a_1: "Building B",
              street_name_a_1: "Street C",
              unit_no_a_1: "101",
              postal_code_a_1: "12345",
            },
          },
        },
      ],
      getUrl: {
        getParameterByName: jest.fn().mockReturnValue("true"),
      },
      // other mock data remains the same
    });

    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={jest.fn()}
          data={{
            logical_field_name: "residential_address",
            rwb_label_name: "Residential Address",
            placeholder: "Residential Address",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
          embossedNameCounter={embossedNameCounter}
        />
      </Provider>
    );

    // Check if residential address is set correctly
    expect(setDefaultValue).toHaveBeenCalledWith("Block A, Building B, Street C, 101, 12345");
  });

  it("sets NRIC when logical_field_name is tax_id_no and casa_fatca_declaration_a_1 is Y", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={jest.fn()}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Tax ID Number",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
          embossedNameCounter={embossedNameCounter}
        />
      </Provider>
    );

    // Check if NRIC is set correctly
    expect(setDefaultValue).toHaveBeenCalledWith("S1234567A");
  });

  it("sets default value for embossed name fields", () => {
    store = mockStore({
      stageSelector: [
        {
          stageId: "ssf-2",
          stageInfo: {
            applicants: {
              full_name_a_1: "John Doe",
              embossed_name_a_1: "",
            },
          },
        },
      ],
      // other mock data remains the same
    });

    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={jest.fn()}
          data={{
            logical_field_name: "embossed_name",
            rwb_label_name: "Embossed Name",
            placeholder: "Embossed Name",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
          embossedNameCounter={embossedNameCounter}
        />
      </Provider>
    );

    // Check if embossed name is set correctly
    expect(setDefaultValue).toHaveBeenCalledWith("John");
  });

  it("sets default value when logical_field_name matches tax_id_no or similar", () => {
    store = mockStore({
      userInputSelector: {
        applicants: {
          "tax_id_no_a_1": "987654321",
        },
      },
      // other mock data remains the same
    });

    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={jest.fn()}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Tax ID Number",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
          setDefaultValue={setDefaultValue}
          embossedNameCounter={embossedNameCounter}
        />
      </Provider>
    );

    // Check if the correct field value is set
    expect(setDefaultValue).toHaveBeenCalledWith("987654321");
  });
});

 TypeError: Cannot read properties of undefined (reading 'stages')

      22 | const Text = (props: KeyWithAnyModel) => {
      23 |   const [error, setError] = useState("");
    > 24 |   const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
         |                                                                         ^
      25 |
      26 |   const userInputSelector = useSelector(
      27 |     (state: StoreModel) => state.stages.userInput
