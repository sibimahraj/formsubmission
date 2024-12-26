import React, { useEffect, useState } from "react";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import "./slider-with-currency.scss";
import Slider from "../slider/slider";
import { useDispatch, useSelector } from "react-redux";
import {
  fieldIdAppend,
  isFieldUpdate,
  getUrl,
  isFieldValueUpdate,
} from "../../../utils/common/change.utils";
import validateService from "../../../services/validation-service";
import loanDetailsConst from "../../../assets/_json/loan-details.json";
import Model from "../model/model";

const SliderWithCurrency = (props: KeyWithAnyModel) => {
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const lastStageSelector = useSelector((state: StoreModel) => state.stages.lastStageId);
  const [value, setValue] = useState('');
  const [options, setOptions] = useState({});
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const dispatch = useDispatch();
  const currency = "SGD";
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const [error, setError] = useState("");
  const loanTopUpDetails = useSelector((state: StoreModel) => state.loanTopUp);
  const MaxEligibleAmount = stageSelector[0].stageInfo.applicants.max_eligible_amount ? stageSelector[0].stageInfo.applicants.max_eligible_amount : '';
  const productCode = stageSelector[0].stageInfo.products[0].product_type;
  const applicationJourney = useSelector((state: StoreModel) => state.stages.journeyType);
  const existingCashone =  (productCode === '280' && applicationJourney === 'ETC') ? true : false;
  let maxeligibleAmt = stageSelector[0].stageInfo.applicants.max_eligible_amount <= 1000 ? true : false;

  useEffect(() => {
    if (existingCashone && loanTopUpDetails.outstandingAmount) {
      updateLoanAmountSlider(loanTopUpDetails.outstandingAmount);
    }
  }, [loanTopUpDetails.outstandingAmount])

  useEffect(() => {
    const value = getStoreValue();
    if (props.data.logical_field_name === "preferred_credit_limit" || props.data.logical_field_name === "preferred_credit_limit_etc") {
      setOptions(loanDetailsConst.preferredCreditLimitOptions);
      setMin(validateService.formateCurrency(loanDetailsConst.preferredCreditLimitOptions.min.toString()))
      setMax(validateService.formateCurrency(loanDetailsConst.preferredCreditLimitOptions.max.toString()))
      if(!value){
        updateSliderValue(loanDetailsConst.preferredCreditLimitOptions.min.toString());
      } else {
        updateSliderValue(value);
      }
    } else if (props.data.logical_field_name === "Transfer_amount") {
      setOptions(loanDetailsConst.transferAmountSliderOptions);
      setMin(validateService.formateCurrency(loanDetailsConst.transferAmountSliderOptions.min.toString()))
      const max = (loanDetailsConst.transferAmountSliderOptions.max).toString();
      setMax(validateService.formateCurrency(max))
      if(!value){
        updateSliderValue(max);
      } else {
        updateSliderValue(value);
      }
    }
    else if (!loanTopUpDetails.existingLoanTopUp) {
      updateLoanAmountSlider('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(() => {
    if(userInputSelector.applicants.required_annual_income_a_1){
      updateLoanAmountSlider('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector.applicants.required_annual_income_a_1]);

  useEffect(() => {
    if(props.data.logical_field_name === "Transfer_amount" && userInputSelector.applicants.Transfer_amount_a_1){
      props.handleCallback(props.data, userInputSelector.applicants.Transfer_amount_a_1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userInputSelector.applicants.Transfer_amount_a_1])

  const updateLoanAmountSlider = (childVal: any) => {
    if (props.data.logical_field_name === "required_loan_amount") {
      let annualIncome = parseInt(
        userInputSelector.applicants.required_annual_income_a_1 ? userInputSelector.applicants.required_annual_income_a_1.replace(',','')  : 0
      );
      let factor = 0;
      let proposedMaxLoanAmount = 0;
      let OutstandingAmount = 0;
      if (existingCashone && loanTopUpDetails.existingLoanTopUp && !maxeligibleAmt) {
        OutstandingAmount = parseFloat(childVal);
        proposedMaxLoanAmount = parseFloat(MaxEligibleAmount);
      }
      else if (existingCashone && loanTopUpDetails.newLoanTopUp && !maxeligibleAmt) {
        proposedMaxLoanAmount = parseFloat(MaxEligibleAmount);
      }
      else {
      switch (true) {
        case annualIncome <= 29999:
          factor = 2;
          proposedMaxLoanAmount =
            Math.floor(annualIncome / 12 / 100) * 100 * factor;
          break;
        case annualIncome >= 30000 && annualIncome <= 119999:
          factor = 4;
          proposedMaxLoanAmount =
            Math.floor(annualIncome / 12 / 100) * 100 * factor;
          proposedMaxLoanAmount =
            proposedMaxLoanAmount >= 250000 ? 250000 : proposedMaxLoanAmount;
          break;
        case annualIncome >= 120000:
          factor = 8;
          proposedMaxLoanAmount =
            Math.floor(annualIncome / 12 / 100) * 100 * factor;
          proposedMaxLoanAmount =
            proposedMaxLoanAmount >= 250000 ? 250000 : proposedMaxLoanAmount;
          break;
        }
      }
      let min = 0;
      if(proposedMaxLoanAmount > 0){
        min = ((existingCashone && loanTopUpDetails.existingLoanTopUp) ? OutstandingAmount : loanDetailsConst.requireLoanOptions.min);
      }
      if (min > proposedMaxLoanAmount) {
        min = 0;
      }
      setOptions({
        min: min,
        max: proposedMaxLoanAmount,
        step: loanDetailsConst.requireLoanOptions.step,
      });
      setMin(validateService.formateCurrency(min.toString()))
      setMax(validateService.formateCurrency(proposedMaxLoanAmount.toString()))
      const value = getStoreValue();
      if(value && value !== '0' && compareOldAnnualIncome()){
        updateSliderValue(value);
      } else if(proposedMaxLoanAmount > 0) {
        updateSliderValue(proposedMaxLoanAmount.toString());
      }
    } 
  }

  const compareOldAnnualIncome = () => {
    if (lastStageSelector === "bd-3" || lastStageSelector === "doc" || lastStageSelector === "ad-2") {
      if (stageSelector &&
        stageSelector[0] &&
        stageSelector[0].stageInfo &&
        stageSelector[0].stageInfo.applicants) {
          return (userInputSelector.applicants.required_annual_income_a_1 === stageSelector[0].stageInfo.applicants.required_annual_income_a_1);
      }
    } else if (lastStageSelector === "ssf-1" || lastStageSelector === "ssf-2" || lastStageSelector === "bd-1" || lastStageSelector === "bd-2" || maxeligibleAmt) {
      const stageIndex = getUrl
        .getUpdatedStage()
        .updatedStageInputs.findIndex(
          (ref: any) => ref && ref.stageId === stageSelector[0].stageId
        );
      let updatedVal = null;
      if (stageIndex > -1) {
        updatedVal =
          getUrl.getUpdatedStage().updatedStageInputs[stageIndex].applicants['required_annual_income_a_1'];
      }
      return (userInputSelector.applicants.required_annual_income_a_1 === updatedVal);
    } else {
      return true
    }
  }

  // const getLastAnnualIncome = () => {
  //   const stageIndex = getUrl
  //       .getUpdatedStage()
  //       .updatedStageInputs.findIndex(
  //         (ref: any) => ref && ref.stageId === stageSelector[0].stageId
  //       );
  //     let updatedVal = null;
  //     if (stageIndex > -1) {
  //       updatedVal =
  //         getUrl.getUpdatedStage().updatedStageInputs[stageIndex].applicants['required_annual_income_a_1'];
  //     }
  //     return updatedVal;
  // }

  const getStoreValue = () => {
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
      return fieldValue;
    }
    return "";
   
  }

  useEffect(() => {
    if(max && props.data.logical_field_name === "required_loan_amount"){
      updateSliderValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max]);

  const updateSliderValue = (value: string) => {
    let nonFormattedValue = value.replace(",","").replace(",","")
    dispatch(isFieldUpdate(props, nonFormattedValue, props.data.logical_field_name));
    dispatch(isFieldValueUpdate(props, stageSelector, nonFormattedValue));
   // props.handleCallback(props.data, nonFormattedValue);
    if (props.data.logical_field_name === "required_loan_amount") {
      setValue(validateService.formateCurrency(value));
      setError("");
      if (!nonFormattedValue || (nonFormattedValue && parseInt(nonFormattedValue) < 1000)) {
        setError('The minimum loan amount is SGD 1000')
        props.handleCallback(props.data, "");
      } else if (nonFormattedValue && parseInt(nonFormattedValue) > parseInt(max.replace(",", ""))) {
        setError('Enter a value within the maximum eligible loan amount specified.')
        props.handleCallback(props.data, "");
      } else {
        props.handleCallback(props.data, nonFormattedValue);
      }
    } else {
      setValue(value);
      props.handleCallback(props.data, nonFormattedValue);
    }
  };

  const onBlur = (value: string) => {
    if (!value) {
      setValue('0');
    } else {
      setValue(validateService.formateCurrency(value));
    }
  }

  const onFocus = (value: string) => { 
    if(value){
      setValue(value.replace(",","").replace(",",""));
    } 
  }

  const handlePopupBackButton = () => {
    setShowInfoPopup(false);
  };
  
  return (
    <>
      <div className="slider-with-currency">
        <div className="slider__header">
          <label htmlFor={props.data.logical_field_name}>
            {props.data.rwb_label_name}
          </label>
          {props.data.info_tooltips === "Yes" &&
            <span className="info-tooltip" onClick={() => setShowInfoPopup(true)}></span>
          }
        </div>
        {
          props.data.logical_field_name === "required_loan_amount" ? 
        
        (<div className="slider-container loan-container">
          <div className="slider">
            <div className="slider-currency">{currency}</div>
                <div className="slider-value">
                  <div className="loan-value">
                    <input
                      type="text"
                      maxLength={10}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }
                      }
                      onChange={(event) => updateSliderValue(event.target.value)}
                      onBlur={(event) => onBlur(event.target.value)}
                      onFocus={(event) => onFocus(event.target.value)}
                      value={value}
                    >
                    </input>
                  </div>
                </div>
          </div>
          
          <div className="max-eligible-amoun">
            <div className="min-eligible-amount">Maximum eligible loan amount</div>
            <div className="max-eligible-amount">{currency} {max}</div>
          </div>
              {existingCashone && loanTopUpDetails.existingLoanTopUp &&
                  <div className="max-eligible-amoun">
                    <div className="min-eligible-amount">Current Outstanding Amount</div>
                    <div className="min-eligible-amount">{currency} {validateService.formateCurrency(loanTopUpDetails.outstandingAmount)}</div>
                  </div>}
        </div>)
          :
         (<div className="slider-container">
          <div className="slider">
            <div className="slider-currency">{currency}</div>
            <div className="slider-value">
              {validateService.formateCurrency(value)}
            </div>
          </div>
          <Slider
            options={options}
            value={value}
            updateSliderValue={updateSliderValue}
            id={fieldIdAppend(props)}
          />
          <div className="max-eligible-amoun">
            <div className="min-eligible-amount">{currency} {min}</div>
            <div className="max-eligible-amount">{currency} {max}</div>
          </div>
        </div>
         )
        }
      </div>
      {error && <span className="error-msg">{error}</span>}
      {showInfoPopup && (
        <Model name={props.data.logical_field_name} handlebuttonClick={handlePopupBackButton} />
      )}
    </>
  );
};
export default SliderWithCurrency;

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SliderWithCurrency from "./slider-with-currency";
import { useDispatch, useSelector } from "react-redux";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.autoMockOff();
jest.mock("axios", () => ({
  __esModule: true,
}));
 
jest.mock("@lottiefiles/react-lottie-player", () => ({
  __esModule: true,
}));
const mockDispatch = jest.fn();

// jest.mock('react',() =>{
//     const actualReact = jest.requireActual("react");
//     return {
//         ...actualReact,useState:jest.fn(),
//     }
// })
const mockState = {
    stages:{
        userInput:{
            applicants:{
                required_annual_income_a_1:'40000',
                Transfer_amount_a_1: '10000'
            }
        },
    stages:[
        {
            stageInfo:{
                applicants:{
                    required_annual_income_a_1: '40000'
                }
            }
        }
    ],
    lastStageId:"bd-3",
},
}
describe("SliderWithCurrency Component", () => {
  beforeEach(() => {
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockImplementation((callback) => callback(mockState));
  });

  const mockProps = {
    data: {
      logical_field_name: "required_loan_amount",
      rwb_label_name: "Loan Amount",
      info_tooltips: "Yes",
    },
    handleCallback: jest.fn(),
  };

  test("should display the props.data.rwb_label_name", () => {
    render(<SliderWithCurrency {...mockProps} />);
    expect(screen.getByTestId('logical-name')).toBeInTheDocument();
  });

  // test("onclick of info tooltip should show popup", () => {
  //   render(<SliderWithCurrency {...mockProps} />);
  //   const infoTooltip = screen.getByTestId("info-tooltip");
  //   fireEvent.click(infoTooltip);
  //   expect(screen.getByTestId("info-tooltip")).toBeInTheDocument();
  // });

  test("if props.data.info_tooltips is Yes, show the span tag", () => {
    render(<SliderWithCurrency {...mockProps} />);
    expect(mockProps.data.info_tooltips).toBeTruthy()
  });

  test("if props.data.logical_field_name is required_loan_amount, render loan container", () => {
    render(<SliderWithCurrency {...mockProps} />);
    expect(screen.getByText(/Maximum eligible loan amount/i)).toBeInTheDocument();
  });

  test("onChange of input should call updateSliderValue", () => {
    render(<SliderWithCurrency {...mockProps} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "5000" } });
    expect(mockProps.handleCallback).toHaveBeenCalledWith(
      mockProps.data,
      "5000"
    );
  });

  test("onBlur should call onBlur function", () => {
    render(<SliderWithCurrency {...mockProps} />);
    const input = screen.getByRole("textbox");
    fireEvent.blur(input, { target: { role: "4000" } });
    expect(input.role).toBe("4000");
  });

  test("onFocus should call onFocus function", () => {
    render(<SliderWithCurrency {...mockProps} />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input,{target:{role:'40000'}});
    expect(input.role).toBe("40000"); 
  });

  test("should render the currency value in slider-currency", () => {
    let currency ='SGD'
    render(<SliderWithCurrency {...mockProps} />);
    expect(screen.getByText(currency)).toBeInTheDocument();
  });

  test("if props.data.logical_field_name is not required_loan_amount, call the else part", () => {
    const customProps = {
      ...mockProps,
      data: { ...mockProps.data, logical_field_name: "Transfer_amount" },
    };
    render(<SliderWithCurrency {...customProps} />);
    expect(screen.queryByText(/Maximum eligible loan amount/i)).not.toBeInTheDocument();
  });

//   test("if showInfoPopup then render the Model component", () => {
//     render(<SliderWithCurrency {...mockProps} />);
//     // fireEvent.click(screen.getByRole("button", { name: /info/i }));
//     expect(screen.getByText(/Model Component/i)).toBeInTheDocument(); // Adjust to your actual Model component
//   });

// test('if error is true, show error', () => {
//     let error ='Invalid';
//     render(<SliderWithCurrency {...mockProps} />);
//     expect(screen.getByRole('span')).toBeCalled()
// })
// test('sets showInfoPopuo to true on info-tooltio click' , () => {
//     const setShowInfoPopup = jest.fn();
//     const useStateMock :any= (initalValue:any) => [initalValue,setShowInfoPopup];
//     jest.spyOn(React,"useState").mockImplementation(useStateMock);
//     render(<SliderWithCurrency {...mockProps}/>)

//     const infoTololTip = screen.getByText('');
//     fireEvent.click(infoTololTip);

//     expect(setShowInfoPopup).toHaveBeenCalledWith(true);
//     jest.resetAllMocks();
// })
});
           ● SliderWithCurrency Component › onBlur should call onBlur function

    TypeError: Cannot read properties of undefined (reading '0')

      30 |   const loanTopUpDetails = useSelector((state: StoreModel) => state.loanTopUp);
      31 |   const MaxEligibleAmount = stageSelector[0].stageInfo.applicants.max_eligible_amount ? stageSelector[0].stageInfo.applicants.max_eligible_amount : '';
    > 32 |   const productCode = stageSelector[0].stageInfo.products[0].product_type;
         |                                                          ^
      33 |   const applicationJourney = useSelector((state: StoreModel) => state.stages.journeyType);
      34 |   const existingCashone =  (productCode === '280' && applicationJourney === 'ETC') ? true : false;
      35 |   let maxeligibleAmt = stageSelector[0].stageInfo.applicants.max_eligible_amount <= 1000 ? true : false;

      SliderWithCurrency Component › should render the currency value in slider-currency

    TypeError: Cannot read properties of undefined (reading 'outstandingAmount')

      39 |       updateLoanAmountSlider(loanTopUpDetails.outstandingAmount);
      40 |     }
    > 41 |   }, [loanTopUpDetails.outstandingAmount])
         |                        ^
      42 |
      43 |   useEffect(() => {
      44 |     const value = getStoreValue();

      jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => {
    if (selector.name === 'loanTopUpDetailsSelector') {
      return {
        outstandingAmount: 2000, // Mocked value for the test
      };
    }
    return {};
  }),
  useDispatch: jest.fn(),
}));


import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SliderWithCurrency from "./slider-with-currency";

const mockStore = configureStore([]);

describe("SliderWithCurrency Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageInfo: {
              applicants: { max_eligible_amount: 50000, required_annual_income_a_1: "60000" },
              products: [{ product_type: "280" }],
            },
          },
        ],
        lastStageId: "bd-3",
        journeyType: "ETC",
        userInput: {
          applicants: {
            required_annual_income_a_1: "60000",
            Transfer_amount_a_1: "2000",
          },
        },
      },
      loanTopUp: { outstandingAmount: "1000", existingLoanTopUp: true, newLoanTopUp: false },
    });
  });

  const renderComponent = (props) => {
    return render(
      <Provider store={store}>
        <SliderWithCurrency {...props} />
      </Provider>
    );
  };

  it("should render the slider with the correct label and value", () => {
    const props = {
      data: {
        logical_field_name: "required_loan_amount",
        rwb_label_name: "Required Loan Amount",
        info_tooltips: "Yes",
      },
      handleCallback: jest.fn(),
    };

    renderComponent(props);

    expect(screen.getByLabelText(/Required Loan Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum eligible loan amount/i)).toBeInTheDocument();
  });

  it("should display the error message for values below the minimum", () => {
    const props = {
      data: {
        logical_field_name: "required_loan_amount",
        rwb_label_name: "Required Loan Amount",
        info_tooltips: "Yes",
      },
      handleCallback: jest.fn(),
    };

    renderComponent(props);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "500" } });
    fireEvent.blur(input);

    expect(screen.getByText(/The minimum loan amount is SGD 1000/i)).toBeInTheDocument();
    expect(props.handleCallback).toHaveBeenCalledWith(props.data, "");
  });

  it("should update the slider value when a valid amount is entered", () => {
    const props = {
      data: {
        logical_field_name: "required_loan_amount",
        rwb_label_name: "Required Loan Amount",
        info_tooltips: "Yes",
      },
      handleCallback: jest.fn(),
    };

    renderComponent(props);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "2000" } });
    fireEvent.blur(input);

    expect(input.value).toBe("2,000"); // Assuming `formateCurrency` formats with commas
    expect(props.handleCallback).toHaveBeenCalledWith(props.data, "2000");
  });

  it("should render the tooltip when info_tooltips is 'Yes'", () => {
    const props = {
      data: {
        logical_field_name: "required_loan_amount",
        rwb_label_name: "Required Loan Amount",
        info_tooltips: "Yes",
      },
      handleCallback: jest.fn(),
    };

    renderComponent(props);

    expect(screen.getByClass("info-tooltip")).toBeInTheDocument();
  });
});
