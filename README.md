import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store"
import Text from "./text";// Adjust the path based on your file structure
//import { StoreModel } from "../../models"; // Adjust the path if needed

// Mock Redux store
const mockStore = configureStore([]);
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
      fielderror:{
        error:[
         {
             
         }

        ] 
     },
     postalCode:{
        postalCode:[
         {
             
         }

        ] 
     },
     urlParam:{
        resume:[
         {
             
         }

        ] 
     },
      referralcode: {
        errormsg: "",
        referId: "REF123",
      },
    });
  });

  it("renders correctly and handles input changes", () => {
    render(
      <Provider store={store}>
        <Text
          data={{
            logical_field_name: "tax_id_no",
            rwb_label_name: "Tax ID Number",
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

    const input = screen.getByPlaceholderText("Enter your passport Number");
    expect(input).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(input, { target: { value: "987654321" } });
    expect(input).toHaveValue("987654321");
  });

  it("displays the error message when input is invalid", () => {
    render(
      <Provider store={store}>
        <Text
          data={{
            logical_field_name: "referral_id_2",
            rwb_label_name: "Referral ID",
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
    const errorMsg = screen.getByText("Invalid code Referral ID");
    expect(errorMsg).toBeInTheDocument();
  });
});

Actions must be plain objects. Use custom middleware for async actions.

      360 |           !(stageSelector[0].stageId === "ssf-2" && getUrl.getJourneyType())
      361 |         ) {
    > 362 |           dispatch(
          |           ^
      363 |             isFieldUpdate(props, fieldValue, props.data.logical_field_name)
      364 |           );
      365 |           props.handleCallback(props.data, fieldValue);

      TypeError: props.handleFieldDispatch is not a function

      13 | ): any => {
      14 |   return (_dispatch: AppDispatch) => {
    > 15 |     props.handleFieldDispatch(fieldName, fieldValue);
         |           ^
      16 |   };
      17 | };
      18 |
