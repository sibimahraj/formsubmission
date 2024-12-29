import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import Text from "./text"; // Adjust the path based on your file structure

const mockStore = configureStore([thunk]);
const mockHandleFieldDispatch = jest.fn();
let store: any;

describe("Text Component - Branch Coverage", () => {
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
        error: [{ field: "tax_id_no", message: "Invalid Tax ID" }],
      },
      referralcode: {
        errormsg: "Invalid referral code",
        referId: "REF123",
      },
    });
  });

  it("renders editable input and handles valid input", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Enter Tax ID",
            type: "text",
            min_length: 5,
            length: 15,
            regex: "\\d+",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Enter Tax ID");
    expect(input).toBeInTheDocument();

    // Valid input
    fireEvent.change(input, { target: { value: "123456" } });
    expect(mockHandleFieldDispatch).toHaveBeenCalledWith("tax_id_no", "123456");
  });

  it("displays error for invalid input based on regex", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "referral_id",
            rwb_label_name: "Referral ID",
            placeholder: "Enter referral code",
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

    const input = screen.getByPlaceholderText("Enter referral code");
    fireEvent.change(input, { target: { value: "!!!" } });

    // Error is shown
    expect(screen.getByText("Invalid referral code")).toBeInTheDocument();
  });

  it("renders non-editable input", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "read_only_field",
            rwb_label_name: "Read Only",
            placeholder: "Read only input",
            type: "text",
            editable: false,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Read only input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("disabled");
  });

  it("handles min_length validation", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Enter Tax ID",
            type: "text",
            min_length: 5,
            length: 15,
            regex: "\\d+",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Enter Tax ID");
    fireEvent.change(input, { target: { value: "123" } });

    // Ensure dispatch is not called for short input
    expect(mockHandleFieldDispatch).not.toHaveBeenCalled();
  });

  it("handles input clearing and empty state", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
            placeholder: "Enter Tax ID",
            type: "text",
            editable: true,
          }}
          handleCallback={jest.fn()}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Enter Tax ID");
    fireEvent.change(input, { target: { value: "" } });

    // Dispatch is not called for empty input
    expect(mockHandleFieldDispatch).not.toHaveBeenCalled();
  });

  it("handles callback on valid input", () => {
    const mockCallback = jest.fn();
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={{
            logical_field_name: "referral_id",
            rwb_label_name: "Referral ID",
            placeholder: "Enter referral code",
            type: "text",
            min_length: 5,
            length: 10,
            regex: "[A-Za-z0-9]+",
            editable: true,
          }}
          handleCallback={mockCallback}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Enter referral code");
    fireEvent.change(input, { target: { value: "REF123" } });

    // Callback is invoked with valid value
    expect(mockCallback).toHaveBeenCalledWith("REF123");
  });

  it("handles missing data gracefully", () => {
    render(
      <Provider store={store}>
        <Text
          handleFieldDispatch={mockHandleFieldDispatch}
          data={null}
          handleCallback={jest.fn()}
        />
      </Provider>
    );

    const input = screen.queryByPlaceholderText("Enter Tax ID");
    expect(input).not.toBeInTheDocument();
  });
});
