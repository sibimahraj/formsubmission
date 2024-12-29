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
 
