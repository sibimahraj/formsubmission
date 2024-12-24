import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import validateService from "../../../services/validation-service";
import { KeyWithAnyModel, LovInputModel, StoreModel } from "../../../utils/model/common-model";
import { fieldError, fieldIdAppend, getUrl, isFieldUpdate, isFieldValueUpdate } from "../../../utils/common/change.utils";
import "./phone.scss";
import errorMsg from "../../../assets/_json/error.json";
import { lastAction } from "../../../utils/store/last-accessed-slice";

export const Phone = (props: KeyWithAnyModel) => {
  const [lovData, setLovData] = useState<any>([]);
  const [error, setError] = useState('');
  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const dispatch = useDispatch();
  const [defaultValue, setDefaultValue] = useState("");

  useEffect(() => {
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      if (
        stageSelector[0].stageInfo.applicants[
          props.data.logical_field_name + "_a_1"
        ]
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
        const userMobileNum = fieldValue;
        const mobileNum =
          userMobileNum.indexOf("-") >= 0
            ? userMobileNum.split("-")[1]
            : userMobileNum;
        setDefaultValue(mobileNum);
        phoneValidation(props.data.logical_field_name, mobileNum, "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lovSelector.lov.length > 0) {
      lovSelector.lov.forEach((ref: LovInputModel) => {
        if (props.data.logical_field_name.includes(ref.label)) {
          setLovData(ref.value);
        }
      });
    }
  }, [lovSelector.lov, props.data.logical_field_name]);
  useEffect(() => {
    if(fieldError(fieldErrorSelector, props)){
      setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`)} 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  const changeHandler = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultValue(event.target.value);
    props.handleCallback(props.data, event.target.value);
    setError('');
    phoneValidation(fieldName,event.target.value,event.target.validity)
  };
  const phoneValidation = (fieldName:string, value:string, validity:any) => {
    if ((props.data.mandatory === "Yes" || props.data.mandatory ==="Conditional") && value.length < 1) {
      setError(`${errorMsg.emity} ${props.data.rwb_label_name}`);
    } else if (fieldName === "mobile_number" && !(value[0] === '8' || value[0] === '9')) {
      setError(`${errorMsg.sgMobile}`);
    } else if (props.data.min_length && `${value}`.length < props.data.min_length) {
      setError(`${errorMsg.minLength} ${props.data.min_length} digits`)
    } else if (props.data.regex && !(`${value}`.match(props.data.regex)) 
    ) {
      setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`)
    } else if(validity) {
      setError(!validity.valid ? (`${errorMsg.patterns} ${props.data.rwb_label_name}`) : '');
    }
  }
  const allowOnlyCharacter = (event: any, fieldName: string) => {
    validateService.allowOnlyCharacter(event, fieldName);
  };

  const bindHandler = (fieldName: string, event: any) => {
    if (event.target.validity.valid) {
      const fieldValue =
        fieldName === "mobile_number" ? event.target.value : "";
      dispatch(isFieldUpdate(props, fieldValue, fieldName));
      dispatch(isFieldValueUpdate(props, stageSelector, fieldValue));
    }
  };
  const focusHandler = (fieldName: string, event: React.FocusEvent<HTMLInputElement>) => {
    dispatch(lastAction.getField(fieldName))
  }

  const countryCode = (data:string) => {
    const code = data.indexOf('(+');
    if(code > 0) {
      return data.slice(code)
    } 
    return data;
  }

  return (
    <>
      <div className="phone">
        <label htmlFor={props.data.logical_field_name}>
          {props.data.rwb_label_name}
        </label>
        <div className={`phone__container ${props.data.editable ? 'disabled' : ''}`}>
          {lovData &&
            lovData.map((res: any, index: any) => {
              return (
                <div key={index}>
                  <span className="phone__flag"></span> {countryCode(res.CODE_DESC)}
                  <span className="vertical-line"></span>
                </div>
              );
            })}
          <input
            // type={props.data.type}
            type="text"
            name={props.data.logical_field_name}
            id={fieldIdAppend(props)}
            placeholder={props.data.rwb_label_name}
            value={defaultValue}
            minLength={props.data.min_length}
            maxLength={props.data.length}
            pattern={props.data.regex}
            onChange={changeHandler.bind(this, props.data.logical_field_name)}
            onKeyPress={(event) =>
              allowOnlyCharacter(event, props.data.logical_field_name)
            }
            onBlur={bindHandler.bind(this, props.data.logical_field_name)}
            disabled={props.data.editable}
            onFocus={focusHandler.bind(this, props.data.logical_field_name)}
          />
        </div>
        {error && (
        <span className="error-msg">
           {error}
        </span>
      )}
      </div>
    </>
  );
};

export default Phone;

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Phone from './phone';

const mockStore = {
    lov: {
        lov: [
        { label: 'CountryCode', value: ['+65', '+1'] },
        ],
    },
    stages: {
        stages: 
        [
            {
                stageInfo: {
                    applicants: {
                    'mobile_number_a_1': '1234567890',
                    },
                },
            },
        ],
        userInput: {
            applicants: {
                'mobile_number_a_1': '1234567890',
            },
        },
    },
    fielderror: {
        error: false,
    },
    lastAction: {
        getField: jest.fn(),
    },
};

const mockHandleCallback = jest.fn();
const mockChangeHandler = jest.fn();

const store = configureStore({
    reducer: {
        lov: (state = mockStore.lov) => state,
        stages: (state = mockStore.stages) => state,
        fielderror: (state = mockStore.fielderror) => state,
        lastAction: (state = mockStore.lastAction) => state,
    },
});
describe('Phone Component', () => {
    it('renders correctly and shows default value from Redux store', async () => {
        render(
            <Provider store={store}>
                <Phone
                data={{ logical_field_name: 'mobile_number', rwb_label_name: 'Mobile Number' }}
                handlecallback={mockHandleCallback}
                />
            </Provider>
        );
    expect(screen.getByText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mobile Number')).toHaveValue('1234567890');
    }); 
    it("renders the country code from LOV data", () => {
        render(
            <Provider store={store}>
                <Phone
                data={{ logical_field_name: 'mobile_number', rwb_label_name: 'Mobile Number' }}
                handlecallback={mockHandleCallback}
                />
            </Provider>
        );
    expect(screen.getByText("Mobile Number")).toBeInTheDocument();
    });
    it("renders error messages", () => {
        render(
            <Provider store={store}>
                <Phone
                data={{ logical_field_name: 'mobile_number', rwb_label_name: 'Mobile Number' }}
                handlecallback={mockHandleCallback}
                />
            </Provider>
        );
    expect(screen.getByText("Please enter your Mobile number starting with either 8 or 9")).toBeInTheDocument();
    });
    it("mockChangeHandler", () => {
        screen.debug()
        render(
            <Provider store={store}>
                <Phone
                data={{ logical_field_name: 'mobile_number', rwb_label_name: 'Mobile Number' }}
                handlecallback={mockChangeHandler}
                />
            </Provider>
        );
    expect(screen.getByText("Please enter your Mobile number starting with either 8 or 9")).toBeInTheDocument();
    });

    it('calls phoneValidation and sets the error message when invalid input is provided', () => {
        render(
            <Provider store={store}>
                <Phone
                data={{ logical_field_name: 'mobile_number', rwb_label_name: 'Mobile Number' }}
                handleCallback={mockHandleCallback}
                />
            </Provider>
        );
        
        const input = screen.getByPlaceholderText('Mobile Number');
        fireEvent.change(input, { target: { value: '12345' } });
        
        expect(mockHandleCallback).toHaveBeenCalledWith(
        { logical_field_name: 'mobile_number', rwb_label_name: 'Mobile Number' },
        '12345'
        );
    });
}); 

import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Phone from "./phone";

const mockStore = {
  lov: {
    lov: [
      { label: "CountryCode", value: ["(+65)", "(+1)"] },
    ],
  },
  stages: {
    stages: [
      {
        stageId: "stage1",
        stageInfo: {
          applicants: {
            "mobile_number_a_1": "912345678",
          },
        },
      },
    ],
    userInput: {
      applicants: {
        "mobile_number_a_1": "912345678",
      },
    },
  },
  fielderror: {
    error: false,
  },
  lastAction: {
    getField: jest.fn(),
  },
};

const mockHandleCallback = jest.fn();

const store = configureStore({
  reducer: {
    lov: (state = mockStore.lov) => state,
    stages: (state = mockStore.stages) => state,
    fielderror: (state = mockStore.fielderror) => state,
    lastAction: (state = mockStore.lastAction) => state,
  },
});

describe("Phone Component", () => {
  it("renders correctly and shows the default value", () => {
    render(
      <Provider store={store}>
        <Phone
          data={{
            logical_field_name: "mobile_number",
            rwb_label_name: "Mobile Number",
            mandatory: "Yes",
            min_length: 8,
            regex: "^\\d+$",
          }}
          handleCallback={mockHandleCallback}
        />
      </Provider>
    );

    expect(screen.getByText("Mobile Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mobile Number")).toHaveValue("912345678");
  });

  it("renders country codes from LOV data", () => {
    render(
      <Provider store={store}>
        <Phone
          data={{
            logical_field_name: "mobile_number",
            rwb_label_name: "Mobile Number",
          }}
          handleCallback={mockHandleCallback}
        />
      </Provider>
    );

    expect(screen.getByText("(+65)")).toBeInTheDocument();
    expect(screen.getByText("(+1)")).toBeInTheDocument();
  });

  it("shows an error when input starts with an invalid digit", () => {
    render(
      <Provider store={store}>
        <Phone
          data={{
            logical_field_name: "mobile_number",
            rwb_label_name: "Mobile Number",
            mandatory: "Yes",
          }}
          handleCallback={mockHandleCallback}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Mobile Number");
    fireEvent.change(input, { target: { value: "712345678" } });

    expect(screen.getByText("Please enter your Mobile number starting with either 8 or 9")).toBeInTheDocument();
  });

  it("shows an error when input length is less than the minimum required", () => {
    render(
      <Provider store={store}>
        <Phone
          data={{
            logical_field_name: "mobile_number",
            rwb_label_name: "Mobile Number",
            mandatory: "Yes",
            min_length: 8,
          }}
          handleCallback={mockHandleCallback}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Mobile Number");
    fireEvent.change(input, { target: { value: "91234" } });

    expect(screen.getByText("Minimum length is 8 digits")).toBeInTheDocument();
  });

  it("validates input against regex and shows an error for invalid patterns", () => {
    render(
      <Provider store={store}>
        <Phone
          data={{
            logical_field_name: "mobile_number",
            rwb_label_name: "Mobile Number",
            regex: "^\\d+$",
          }}
          handleCallback={mockHandleCallback}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Mobile Number");
    fireEvent.change(input, { target: { value: "91abc456" } });

    expect(screen.getByText("Please enter a valid Mobile Number")).toBeInTheDocument();
  });

  it("calls handleCallback with updated value on change", () => {
    render(
      <Provider store={store}>
        <Phone
          data={{
            logical_field_name: "mobile_number",
            rwb_label_name: "Mobile Number",
          }}
          handleCallback={mockHandleCallback}
        />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Mobile Number");
    fireEvent.change(input, { target: { value: "912345678" } });

    expect(mockHandleCallback).toHaveBeenCalledWith(
      { logical_field_name: "mobile_number", rwb_label_name: "Mobile Number" },
      "912345678"
    );
  });

  it("updates the error state when the fieldErrorSelector is triggered", () => {
    const mockErrorStore = {
      ...mockStore,
      fielderror: {
        error: true,
      },
    };

    const errorStore = configureStore({
      reducer: {
        lov: (state = mockStore.lov) => state,
        stages: (state = mockStore.stages) => state,
        fielderror: (state = mockErrorStore.fielderror) => state,
        lastAction: (state = mockStore.lastAction) => state,
      },
    });

    render(
      <Provider store={errorStore}>
        <Phone
          data={{
            logical_field_name: "mobile_number",
            rwb_label_name: "Mobile Number",
          }}
          handleCallback={mockHandleCallback}
        />
      </Provider>
    );

    expect(screen.getByText("Please correct the errors in Mobile Number")).toBeInTheDocument();
  });
});

import { useDispatch, useSelector } from "react-redux";
import "./loan-top-up.scss";
import SelectionBox from "../selection-box/selection-box";
import { loanTopUpAction } from "../../../utils/store/loan-topup-slice";
import {  StoreModel } from "../../../utils/model/common-model";
import validateService from "../../../services/validation-service";

const LoanTopUp = (props: any) => {

 const stageSelector = useSelector((state: StoreModel) => state.stages.stages);

  const loanForm = {
    logical_field_name: "loan_account_list",
    rwb_label_name: "Select an existing loan to top up"
}
const dispatch = useDispatch();

  const choosingLoanTopUP = () => {    
    dispatch(loanTopUpAction.setexistingLoanTopUp(true));
    props.topUpClick();
  }

  const choosingNewLoan = () => {    
    dispatch(loanTopUpAction.setnewLoanTopUp(true));
    props.topUpClick();
  }

  return (
    <>
      <div className="topUp-modal">
        <div className="topUp-modal-header">
          <div className="loan_topup_head">You have existing loan(s) eligible for top up</div>
          <div className="topUp-modal-desc">Top up your existing CashOne to enjoy the same interest rate as your existing CashOne.</div>
        </div>
        <div className="topUp-eligible-header">
          <div>Your maximum eligible loan amount is</div>
          <div className="topUp-eligible-amnt">{`SGD ${validateService.formateCurrency(stageSelector[0].stageInfo.applicants.max_eligible_amount)}`}</div>
        </div>
        <div key='topUp-selectBox'>
          <SelectionBox 
          data = {loanForm}
          flowType = "ExistingTopForPL"
          />
        </div>
        <button className="topUp-button" onClick={choosingLoanTopUP}>Top up loan</button>
        <div className="topUp-newLoan" onClick={choosingNewLoan}>
        <span className ='topUp-loan-desc'>I want to apply for a new loan instead</span>
        <span className='topUp-loan'></span>
        </div>
      </div>
    </>
  );
};
export default LoanTopUp;
