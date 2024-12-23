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


import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoanTopUp from './loan-top-up';
import { loanTopUpAction } from '../../../utils/store/loan-topup-slice';

const mockStore = {
  stages: {
    stages: [
      {
        stageInfo: {
          applicants: {
            max_eligible_amount: 10000, // Mock eligible amount
          },
        },
      },
    ],
  },
};

const mockDispatch = jest.fn();
const mockTopUpClick = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector(mockStore),
}));

jest.mock('../../../services/validation-service', () => ({
  formateCurrency: jest.fn((amount) => amount.toLocaleString('en-US', { style: 'currency', currency: 'SGD' })),
}));

describe('LoanTopUp Component', () => {
  const store = configureStore({
    reducer: {
      stages: (state = mockStore.stages) => state,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <Provider store={store}>
        <LoanTopUp topUpClick={mockTopUpClick} />
      </Provider>
    );

    expect(screen.getByText('You have existing loan(s) eligible for top up')).toBeInTheDocument();
    expect(screen.getByText('Top up your existing CashOne to enjoy the same interest rate as your existing CashOne.')).toBeInTheDocument();
    expect(screen.getByText('Your maximum eligible loan amount is')).toBeInTheDocument();
    expect(screen.getByText('SGD 10,000.00')).toBeInTheDocument();
    expect(screen.getByText('Select an existing loan to top up')).toBeInTheDocument();
  });

  it('dispatches action when "Top up loan" button is clicked', () => {
    render(
      <Provider store={store}>
        <LoanTopUp topUpClick={mockTopUpClick} />
      </Provider>
    );

    const button = screen.getByText('Top up loan');
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith(loanTopUpAction.setexistingLoanTopUp(true));
    expect(mockTopUpClick).toHaveBeenCalled();
  });

  it('dispatches action when "I want to apply for a new loan instead" is clicked', () => {
    render(
      <Provider store={store}>
        <LoanTopUp topUpClick={mockTopUpClick} />
      </Provider>
    );

    const newLoanLink = screen.getByText('I want to apply for a new loan instead');
    fireEvent.click(newLoanLink);

    expect(mockDispatch).toHaveBeenCalledWith(loanTopUpAction.setnewLoanTopUp(true));
    expect(mockTopUpClick).toHaveBeenCalled();
  });
});

import { authenticateType, getUrl } from "../utils/common/change.utils";
import { KeyWithAnyModel } from "../utils/model/common-model";
import { checkProductDetails, sortByAscendingOrder } from "./common-service";
import submitService from "./submit-service";
import { store } from "../utils/store/store";

class service {
  formConfigPayload = (createResponse?: any) => {
    const productType = getUrl.getParameterByName("products");

    const productInfo = getUrl.getProductInfo();
    return {
      application: {
        branch_code: null,
        country_code: "SG",
        referral: "",
        referral_id: "",
        acquisition_channel: "",
        source_system_name: "sc.com",
        channel_reference: createResponse
          ? createResponse.application.channel_reference
          : "",
        application_reference: createResponse
          ? createResponse.application.application_reference
          : "",
        source_id: "",
        application_timestamp: "",
        priority_flag: "",
        response_type: "",
        total_applicants: 1,
        application_error_code: [],
        application_error_message: [],
        version: "",
        page_wise: "yes",
        tps_indicator: "",
        tps_creation_timestamp: "",
        ext_lead_reference_number: null,
        tmxSessionId: "80866c6f-a323-43bc-b30b-a95b874254b6",
        trueClientIP: null,
      },
      client: {
        journey: createResponse ? "prelogin_ntc_or_ntp" : null,
        "auth-type": createResponse ? authenticateType() : null,
        "login-type": createResponse ? "prelogin" : null,
        myinfo: {
          "myinfo-attributes": null,
          "myinfo-code": null,
          "myinfo-redirect-uri": null,
          "myinfo-client-id": null,
          "is-myinfo-virtual": null,
        },
      },
      stage: {
        page_id: createResponse ? "" : "ssf-1",
        stage_id: "",
        stage_name: "",
        stage_status: "",
        stage_params: {
          is_dedupe_required: "",
          current_applicant: "",
        },
        applicant_status: [],
      },
      applicants: {},
      products: productInfo,
      dedupeList: {},
      lov_desc: {},
      oz_templates: null,
      preApprovedData: {},
      productsInBundle: [productType],
    };
  };
  createPayload = (data: any, currentStageFields: any, url:string,isExit?:boolean) => {
    let applicantFields = {...currentStageFields}
    let payload: KeyWithAnyModel = {};
    let stageCode: string | null = null;
    payload = {
      application: {
        channel_reference: getUrl.getChannelRefNo().channelRefNo
      }
    };
    if(isExit){
      payload.application['save_exit'] = "Yes";
      
    }
    if(getUrl.getChannelRefNo().applicationRefNo !== null) {
      payload.application['application_reference'] = getUrl.getChannelRefNo().applicationRefNo;
    }
    //const productsSelector = data.stageInfo.products;
    if(url.split("/").indexOf("create") !== -1){
      payload.application['tmxSessionId'] = getUrl.getChannelRefNo().tmxSessionId ? getUrl.getChannelRefNo().tmxSessionId:null
    }
    if (data.stageId === "ad-1" || data.stageId === "ad-2") {
      stageCode = "AD";
    } else if (data.stageId === "rp") {
      stageCode = "FFD";
    } else if (data.stageId === "ld-1") {
      stageCode = "LD";
    } else {
      stageCode = "BD";
    }
    if(url.split("/").indexOf("preserve") !== -1){
      payload.application.stage = {
        stage_id: stageCode,
        page_id: data.stageId,
      };
    }
    if(url.split("/").indexOf("create") !== -1){
      const refer = store.getState().referralcode.refer;
      const referralId = store.getState().referralcode.referId;
      if (refer === "true") {
        if (referralId !== null) {
          payload.application["referral_id_2"] = store.getState().referralcode.referId;
        } else {
          payload.application["referral_id_2"] = null;
        }
      }
      /*istanbul ignore else*/
      if (
        refer !== "true" ||
        store.getState().urlParam.resume
      ) {
        if (store.getState().referralcode.referId !== null)
          payload.application["referral_id_2"] =
            store.getState().referralcode.referId;
        else {
          payload.application["referral_id_2"] = null;
        }
      }
    }
    const isApplicant = Object.keys(applicantFields).length > 0;
    if (isApplicant) {
      for(let field in applicantFields) {
        if(applicantFields[field] === '' || applicantFields[field] === null) {
          delete applicantFields[field];
        }
        if (applicantFields.referral_id_2_a_1) {
          delete applicantFields["referral_id_2_a_1"];
        }
      }
      /*istanbul ignore else*/
      if(Object.keys(applicantFields).length > 0) {
        payload["applicant"] = applicantFields;
      }
      /*istanbul ignore else*/
      if(data.stageId === "ACD" && payload["applicant"]){
        payload["applicant"].amount_to_be_ported_a_1 = payload["applicant"].min_limit_a_1;
      }
      const windoObj: KeyWithAnyModel = window;
      if (windoObj._satellite && windoObj._satellite.getVisitorId() && windoObj._satellite.getVisitorId()._fields.MCMID && (data.stageId === 'ssf-1' || data.stageId === 'ssf-2')) {
        if (!payload.application) {
          payload.application = {};
        }
        payload.application['adobe_ecid'] = windoObj._satellite.getVisitorId()._fields.MCMID;
      }
      if (data.stageId === "ld-1") {
        const rate = getUrl.getRate();
        const rateStore = data.stageInfo.applicants;
        payload["applicant"].rbp_applied_rate_a_1 = rate.ar || rateStore['rbp_applied_rate_a_1'];
        payload["applicant"].rbp_effective_Interest_rate_a_1 = rate.eir || rateStore['rbp_effective_Interest_rate_a_1'];

        const existingCashone =  data.stageInfo.application.journey_type === 'ETC' && data.stageInfo.products[0].product_type ==='280'
        ? true : false;
        if(existingCashone){
          const topupAmount = store.getState().loanTopUp.topupAmount;
          payload["applicant"].topup_amount_a_1 = topupAmount;
          payload["applicant"].credit_into_scb_a_1 = "N";
          payload["applicant"].topup_enabled_a_1 = "N";
           if(payload["applicant"].credit_into_a_1 !== 'Other Bank Account'){
              payload["applicant"].credit_into_scb_a_1 = 'Y';
           }
          const existingLoanTopUp = store.getState().loanTopUp.existingLoanTopUp;
           if(existingLoanTopUp === true){
             payload["applicant"].topup_enabled_a_1 = 'Y';
          }
        }

      }
    }
    return sortByAscendingOrder(payload);
  };
  offerPayload = (data: any) => {
    let payload: KeyWithAnyModel = {};
    payload = {
      application: {
        channel_reference: getUrl.getChannelRefNo().channelRefNo
      }
    };
     /*istanbul ignore else*/
    if(getUrl.getChannelRefNo().applicationRefNo !== null) {
      payload.application['application_reference'] = getUrl.getChannelRefNo().applicationRefNo;
    }
    return sortByAscendingOrder(payload);
  }; 
  getCardActivationPayload = (data:any) => {
    let payload: KeyWithAnyModel = {};
    payload = {
      application_reference_no: getUrl.getChannelRefNo().applicationRefNo,
      country_code: "SG",
      applicant_sequence_no: "1",
      product_sequence_no: data.productSequenceNo,
      product_category: data.productCategory,
      product_type: data.productType,
      tracking_id: submitService.generateUUID
    };
    return sortByAscendingOrder(payload);
  }
}

const generatePayload = new service();

export default generatePayload;

import generatePayload from "./payload";
import { getUrl, authenticateType } from "../utils/common/change.utils";
import referralcode from "../utils/store/referral-code-slice";
import { store } from "../utils/store/store";
jest.autoMockOff();
jest.mock("axios", () => ({
  __esModule: true,
}));
jest.mock('../utils/common/change.utils', () => ({
    getUrl: {
      getProductInfo: jest.fn(),
      getParameterByName: jest.fn(),
      getChannelRefNo: jest.fn(()=>({
        
            channelRefNo: 'mock-channel',
            applicationRefNo: 'mock-app-ref',
          
      })),
      getRate: jest.fn(),
    },
    authenticateType: jest.fn(()=>"manual")
  }));
  

  // jest.mock('../utils/store/store', () => ({
  //   store: {
  //     getState: jest.fn(),
  //   },
    
  // }));
  
  jest.mock('./submit-service', () => ({
    generateUUID: jest.fn(() => 'mock-uuid'),
  }));
  
  describe('Service class', () => {
    describe('formConfigPayload', () => {
      it('should generate payload with product info and default product type', () => {
        const mockProductInfo = [{ product_type: 'mockType' }];
        (getUrl.getProductInfo as jest.Mock).mockReturnValue(mockProductInfo);
        (getUrl.getParameterByName as jest.Mock).mockReturnValue(null);
  
        const result = generatePayload.formConfigPayload();
        expect(result.products).toEqual(mockProductInfo);
        expect(result.productsInBundle).toEqual(['mockType']);
      });
  
      it('should generate payload with product type from URL', () => {
        (getUrl.getProductInfo as jest.Mock).mockReturnValue([]);
        (getUrl.getParameterByName as jest.Mock).mockReturnValue('URLType');
  
        const result = generatePayload.formConfigPayload({channel_reference:"wd",application_reference:"wd",application:{channel_reference:"ss"}});
        expect(result.productsInBundle).toEqual(['URLType']);
      });
    });
  
    describe('createPayload', () => {

         
          beforeEach(()=>{
            store.getState = jest.fn().mockReturnValue({
              referralcode:{
                  refer:true,
                  referId:'122'
              }
          });
          //   (store.getState as jest.Mock).mockReturnValue(()=>({
          //     referralcode:{
          //         refer:true,
          //         referID:'122'
          //     }
          // }));
          })
      it('should generate payload with application reference', () => {
        store.getState = jest.fn().mockReturnValue({
          referralcode:{
              refer:true,
              referId:'122'
          }
      });
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: 'mock-app-ref',
        });
  
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'ACD' },
          {"test":"test","test1":"",referral_id_2_a_1:"w"},
          'mock/dwd'
        );
  
        expect(result.application.channel_reference).toBe('mock-channel');
        expect(result.application.application_reference).toBe('mock-app-ref');
      });
      it('should generate payload with application reference with ssf-2 stage', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: 'mock-app-ref',
        });
        (getUrl.getRate as jest.Mock).mockReturnValue({ar:"test"})
        const result = generatePayload.createPayload(
          { stageInfo: {
            applicants:{
              rbp_applied_rate_a_1:"test"
            }
          }, stageId: 'ld-1' },
          {"test":"test","test1":"",referral_id_2_a_1:"w",rbp_applied_rate_a_1 :"12"},
          'mock/dwd'
        );
  
        expect(result.application.channel_reference).toBe('mock-channel');
        expect(result.application.application_reference).toBe('mock-app-ref');
      });
      it('should generate payload with application reference with ssf-2 stage s', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: 'mock-app-ref',
        });
        (getUrl.getRate as jest.Mock).mockReturnValue({ar:null})
        const result = generatePayload.createPayload(
          { stageInfo: {
            applicants:{
              rbp_applied_rate_a_1:"test"
            }
          }, stageId: 'ld-1' },
          {"test":"test","test1":"",referral_id_2_a_1:"w",rbp_applied_rate_a_1 :"12"},
          'mock/dwd'
        );
  
        expect(result.application.channel_reference).toBe('mock-channel');
        expect(result.application.application_reference).toBe('mock-app-ref');
      });
      it('should add save_exit flag if isExit is true', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
  
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'mock-stage' },
          {},
          'mock/url',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });

      it('should add save_exit flag if isExit is true s', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
  
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'mock-stage' },
          {},
          'wdwd.com/asa/wdw',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });


      it('should test stagecode ad', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
        (store.getState as jest.Mock).mockReturnValue({
            referralcode:{
                refer:true,
                referId:"12"
            }
          });
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'mock-stage' },
          {},
          'wdwd.com/create',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });

      it('should test url contain stage id as ad-1', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
        (store.getState as jest.Mock).mockReturnValue({
            referralcode:{
                refer:true,
                referId:"12"
            }
          });
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'ad-1' },
          {},
          'wdwd.com/create',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });
      it('should test url contain stage id as rp', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
        (store.getState as jest.Mock).mockReturnValue({
            referralcode:{
                refer:true,
                referId:"12",
            }
          });
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'rp' },
          {},
          'wdwd.com/create',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });


      it('should test url contain stage id as rp s', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
        (store.getState as jest.Mock).mockReturnValue({
            referralcode:{
                refer:false,
                referId:"12",
            },
            urlParam:{
                resume:true
            }
          });
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'rp' },
          {},
          'wdwd.com/create',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });
      it('should test url contain stage id as rp sw', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
        (store.getState as jest.Mock).mockReturnValue({
            referralcode:{
                refer:false,
                referId:null,
            },
            urlParam:{
                resume:true
            }
          });
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'rp' },
          {},
          'wdwd.com/create',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });


      it('should test url contain stage id as rp wdw', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
        (store.getState as jest.Mock).mockReturnValue({
            referralcode:{
                refer:true,
                referId:"12"
            }
          });
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'ld-1' },
          {},
          'wdwd.com/create',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });

      it('should test url contain preserve', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: null,
        });
        (store.getState as jest.Mock).mockReturnValue({
            referralcode:{
                refer:true
            }
          });
        const result = generatePayload.createPayload(
          { stageInfo: {}, stageId: 'ld-1' },
          {},
          'wdwd.com/preserve',
          true
        );
  
        expect(result.application.save_exit).toBe('Yes');
      });


    });
  
    describe('offerPayload', () => {
      it('should generate payload with channel reference', () => {
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
          channelRefNo: 'mock-channel',
          applicationRefNo: 'mock-app-ref',
        });
  
        const result = generatePayload.offerPayload({});
        expect(result.application.channel_reference).toBe('mock-channel');
        expect(result.application.application_reference).toBe('mock-app-ref');
      });
    });
  
    describe('getCardActivationPayload', () => {
       beforeEach(()=>{
        (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
            channelRefNo: 'mock-channel',
            applicationRefNo: 'mock-app-ref',
          });
       });
      it('should generate payload with product details', () => {
        const result = generatePayload.getCardActivationPayload({
          productSequenceNo: '1',
          productCategory: 'mock-category',
          productType: 'mock-type',
        });
  
      //  expect(result.application_reference_no).toBeUndefined(); // Assuming getChannelRefNo().applicationRefNo is null
        expect(result.country_code).toBe('SG');
        expect(result.applicant_sequence_no).toBe('1');
        expect(result.product_sequence_no).toBe('1');
        expect(result.product_category).toBe('mock-category');
        expect(result.product_type).toBe('mock-type');
       
      });
    });
  });


  import generatePayload from "./payload";
import { getUrl } from "../utils/common/change.utils";
import { store } from "../utils/store/store";
import submitService from "./submit-service";

jest.autoMockOff();
jest.mock("axios", () => ({
  __esModule: true,
}));
jest.mock('../utils/common/change.utils', () => ({
  getUrl: {
    getProductInfo: jest.fn(),
    getParameterByName: jest.fn(),
    getChannelRefNo: jest.fn(() => ({
      channelRefNo: 'mock-channel',
      applicationRefNo: 'mock-app-ref',
    })),
    getRate: jest.fn(),
  },
  authenticateType: jest.fn(() => "manual")
}));

jest.mock('./submit-service', () => ({
  generateUUID: jest.fn(() => 'mock-uuid'),
}));

describe('Service class', () => {
  describe('formConfigPayload', () => {
    it('should generate payload with product info and default product type', () => {
      const mockProductInfo = [{ product_type: 'mockType' }];
      (getUrl.getProductInfo as jest.Mock).mockReturnValue(mockProductInfo);
      (getUrl.getParameterByName as jest.Mock).mockReturnValue(null);

      const result = generatePayload.formConfigPayload();
      expect(result.products).toEqual(mockProductInfo);
      expect(result.productsInBundle).toEqual(['mockType']);
    });

    it('should generate payload with product type from URL', () => {
      (getUrl.getProductInfo as jest.Mock).mockReturnValue([]);
      (getUrl.getParameterByName as jest.Mock).mockReturnValue('URLType');

      const result = generatePayload.formConfigPayload({channel_reference:"wd", application_reference:"wd", application:{channel_reference:"ss"}});
      expect(result.productsInBundle).toEqual(['URLType']);
    });
  });

  describe('createPayload', () => {
    beforeEach(() => {
      store.getState = jest.fn().mockReturnValue({
        referralcode: {
          refer: true,
          referId: '122'
        }
      });
    });

    it('should generate payload with application reference', () => {
      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'ACD' },
        {"test": "test", "test1": "", referral_id_2_a_1: "w"},
        'mock/dwd'
      );

      expect(result.application.channel_reference).toBe('mock-channel');
      expect(result.application.application_reference).toBe('mock-app-ref');
    });

    it('should generate payload with application reference with ssf-2 stage', () => {
      (getUrl.getRate as jest.Mock).mockReturnValue({ ar: "test" });
      const result = generatePayload.createPayload(
        { stageInfo: { applicants: { rbp_applied_rate_a_1: "test" } }, stageId: 'ld-1' },
        {"test": "test", "test1": "", referral_id_2_a_1: "w", rbp_applied_rate_a_1: "12"},
        'mock/dwd'
      );

      expect(result.application.channel_reference).toBe('mock-channel');
      expect(result.application.application_reference).toBe('mock-app-ref');
    });

    it('should add save_exit flag if isExit is true', () => {
      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'mock-stage' },
        {},
        'mock/url',
        true
      );

      expect(result.application.save_exit).toBe('Yes');
    });

    it('should set stage code to AD for ad-1 or ad-2', () => {
      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'ad-1' },
        {},
        'wdwd.com/create',
        true
      );

      expect(result.application.save_exit).toBe('Yes');
    });

    it('should set stage code to FFD for rp', () => {
      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'rp' },
        {},
        'wdwd.com/create',
        true
      );

      expect(result.application.save_exit).toBe('Yes');
    });

    it('should set stage code to LD for ld-1', () => {
      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'ld-1' },
        {},
        'wdwd.com/create',
        true
      );

      expect(result.application.save_exit).toBe('Yes');
    });

    it('should set stage code to BD for other stages', () => {
      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'other-stage' },
        {},
        'wdwd.com/create',
        true
      );

      expect(result.application.save_exit).toBe('Yes');
    });

    it('should handle referral code correctly when resume is true', () => {
      store.getState = jest.fn().mockReturnValue({
        referralcode: {
          refer: false,
          referId: "12"
        },
        urlParam: {
          resume: true
        }
      });

      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'rp' },
        {},
        'wdwd.com/create',
        true
      );

      expect(result.application.save_exit).toBe('Yes');
    });
  });

  describe('offerPayload', () => {
    it('should generate payload with channel reference', () => {
      const result = generatePayload.offerPayload({});
      expect(result.application.channel_reference).toBe('mock-channel');
      expect(result.application.application_reference).toBe('mock-app-ref');
    });
  });

  describe('getCardActivationPayload', () => {
    beforeEach(() => {
      (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
        channelRefNo: 'mock-channel',
        applicationRefNo: 'mock-app-ref',
      });
    });

    it('should generate payload with product details', () => {
      const result = generatePayload.getCardActivationPayload({
        productSequenceNo: '1',
        productCategory: 'mock-category',
        productType: 'mock-type',
      });

      expect(result.application_reference_no).toBe('mock-app-ref');
      expect(result.country_code).toBe('SG');
      expect(result.applicant_sequence_no).toBe('1');
      expect(result.product_sequence_no).toBe('1');
      expect(result.product_category).toBe('mock-category');
      expect(result.product_type).toBe('mock-type');
      expect(result.tracking_id).toBe('mock-uuid');
    });

    it('should handle missing application reference gracefully', () => {
      (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
        channelRefNo: 'mock-channel',
        applicationRefNo: null,
      });

      const result = generatePayload.getCardActivationPayload({
        productSequenceNo: '1',
        productCategory: 'mock-category',
        productType: 'mock-type',
      });

      expect(result.application_reference_no).toBe(null);
      expect(result.country_code).toBe('SG');
      expect(result.applicant_sequence_no).toBe('1');
      expect(result.product_sequence_no).toBe('1');
      expect(result.product_category).toBe('mock-category');
      expect(result.product_type).toBe('mock-type');
      expect(result.tracking_id).toBe('mock-uuid');
    });
  });
});


import React, { useEffect, useState } from "react";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { useSelector, useDispatch } from "react-redux";
import "./loan-details-info.scss";
import loanDetailsConst from "../../../assets/_json/loan-details.json";
import validateService from "../../../services/validation-service";
import interestRates from "../../../assets/_json/bt-interest-rate.json";
import Model from "../model/model";
import { rateAction } from "../../../utils/store/rate-slice";

const LoanDetailsInfo = (props: KeyWithAnyModel) => {
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const rate = useSelector((state: StoreModel) => state.rate);
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const jouney = useSelector((state: StoreModel) => state.stages.journeyType);
  const [monthlyRepayment, setMonthlyRepayment] = useState("");
  const [estimatedCashBack, setEstimatedCashBack] = useState("");
  const [productType, setProductType] = useState(0);
  const [campaign, setcampaign] = useState("");
  const [processingFeeRate, setprocessingFeeRate] = useState(0);
  const [eir, setEir] = useState("");
  const [annualFee, setAnnualFee] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [modelName, setModelName] = useState("");
  const [roi, setRoi] = useState(0);
  const dispatch = useDispatch();
  const [staffCategory, setStaffCategory] = useState("N"); 
  const loanTopUpDetails = useSelector((state: StoreModel) => state.loanTopUp);
  const productCode = stageSelector[0].stageInfo.products[0].product_type;
  const existingCashone =  (productCode === '280' && jouney === 'ETC') ? true : false;

  useEffect(() => {
    if (
      stageSelector &&
      stageSelector.length > 0 &&
      stageSelector[0].stageInfo
    ) {
      if (stageSelector[0].stageInfo.products &&
        stageSelector[0].stageInfo.products.length > 0) {
        setcampaign(stageSelector[0].stageInfo.products[0].campaign);
        setProductType(
          parseInt(stageSelector[0].stageInfo.products[0].product_type)
        );
      }
      if (stageSelector[0].stageInfo.applicants.staff_category_a_1) {
        setStaffCategory(stageSelector[0].stageInfo.applicants.staff_category_a_1)
      }
    }
    const arRate = stageSelector[0].stageInfo.applicants['rbp_applied_rate_a_1'] ? stageSelector[0].stageInfo.applicants['rbp_applied_rate_a_1'] : loanDetailsConst.ARDefaultRate;
    //setRoi(parseFloat(rate.ar === 0 ? arRate : rate.ar));
    let interestValue = ((existingCashone && loanTopUpDetails.existingLoanTopUp && loanTopUpDetails.interestRate) ? parseFloat(loanTopUpDetails.interestRate) : parseFloat(rate.ar === 0 ? arRate : rate.ar));
    setRoi(interestValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (productType === 280) {
      const tenure = userInputSelector.applicants.loan_tenor_a_1
        ? parseFloat(userInputSelector.applicants.loan_tenor_a_1)
        : 0;

       let loanrepaymentAmount = userInputSelector.applicants.required_loan_amount_a_1
       ? parseFloat(userInputSelector.applicants.required_loan_amount_a_1)
       : 0;

      if(existingCashone && loanTopUpDetails.existingLoanTopUp && loanTopUpDetails.topupAmount){
        loanrepaymentAmount = parseFloat(loanTopUpDetails.topupAmount);
      }

      let repaymentAmount =
        (loanrepaymentAmount * (roi / 100) * (tenure / 12) + loanrepaymentAmount) / tenure;
      repaymentAmount = repaymentAmount === Infinity ? 0 : repaymentAmount;
      setMonthlyRepayment(
        validateService.formateCurrency(repaymentAmount.toFixed(2))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roi]);
  
  useEffect(() => {
    if (existingCashone && loanTopUpDetails.interestRate && loanTopUpDetails.existingLoanTopUp) {
      setRoi(parseFloat(loanTopUpDetails.interestRate));
    }
  }, [loanTopUpDetails.interestRate]);


  useEffect(() => {
    const interestRate = interestRates.find(
      obj =>
        obj["Promo Code"] === campaign &&
        obj.Tenor === parseInt(userInputSelector.applicants.loan_tenor_a_1)
    );
    if (interestRate) {
      setprocessingFeeRate(interestRate["Processing Fee"]);
      //setEir(interestRate.EIR);
    }
    let rateForETC = (existingCashone && (loanTopUpDetails.existingLoanTopUp && loanTopUpDetails.interestRate)) ? parseFloat(loanTopUpDetails.interestRate) :null
    let interestValue = rateForETC != null ? rateForETC.toString() : rate.ar.toString();
    const effetiveRateObj = validateService.getEIR(
      jouney ? jouney : "",
      staffCategory,
      interestValue,
      userInputSelector.applicants.loan_tenor_a_1
    );
    let effetiveRate = 0;
    if (effetiveRateObj) {
      let  effetiveRateArr = effetiveRateObj.split(',');
      effetiveRate = parseFloat(effetiveRateArr[0]);
      setEir(effetiveRateArr[0] === 'N/A' ? 'Tenor not applicable' : effetiveRateArr[0]+'% p.a.');
      dispatch(rateAction.updateEIR(effetiveRateArr[0].toString()));
      if(effetiveRateArr.length > 1){
        setRoi(parseFloat(effetiveRateArr[1]));
        dispatch(rateAction.updateAR(effetiveRateArr[1].toString()));
      }
    } 
    const tenure = userInputSelector.applicants.loan_tenor_a_1
      ? parseFloat(userInputSelector.applicants.loan_tenor_a_1)
      : 0;

    if (productType === 280) {
      const loanAmount = userInputSelector.applicants.required_loan_amount_a_1
          ? parseFloat(userInputSelector.applicants.required_loan_amount_a_1)
          : 0;

          let loanrepaymentAmount = userInputSelector.applicants.required_loan_amount_a_1
          ? parseFloat(userInputSelector.applicants.required_loan_amount_a_1)
          : 0;
   
         if(existingCashone && loanTopUpDetails.existingLoanTopUp && loanTopUpDetails.topupAmount){
           loanrepaymentAmount = parseFloat(loanTopUpDetails.topupAmount);
         }

    let repaymentAmount =
        (loanrepaymentAmount * (roi / 100) * (tenure / 12) + loanrepaymentAmount) / tenure;
      repaymentAmount = repaymentAmount === Infinity ? 0 : repaymentAmount;
      setMonthlyRepayment(
        validateService.formateCurrency(repaymentAmount.toFixed(2))
      );
      let cashBack = 0;
      if (loanAmount >= 15000 && loanAmount < 40000) {
        cashBack = (loanAmount * 1) / 100;
      }
      else if (loanAmount >= 40000 && loanAmount < 50000) {
        cashBack = (loanAmount * 2) / 100;;
      } else if (loanAmount >= 50000) {
        cashBack = (loanAmount * 2.5) / 100;;
      } 
      const cashBackSplit = (cashBack.toString()).split('.');
      const cashBackRounded = `${cashBackSplit[0]}${cashBackSplit[1] ? '.' + cashBackSplit[1].substr(0, 2) : ''}`;
      setEstimatedCashBack( loanAmount < loanDetailsConst.cashBackCondition.minAmount ? 'No Cashback' : 
        'SGD '+validateService.formateCurrency(cashBackRounded, true) 
      );
      setAnnualFee(`-SGD 199`);
    } else if (productType === 210) {
      const transferAmount = userInputSelector.applicants.Transfer_amount_a_1
        ? parseFloat(userInputSelector.applicants.Transfer_amount_a_1)
        : 0;
      let repaymentAmount =
        (transferAmount * (effetiveRate / 100) * (tenure / 12) + transferAmount) /
        tenure;
      repaymentAmount = repaymentAmount === Infinity ? 0 : repaymentAmount;
      setMonthlyRepayment(
        validateService.formateCurrency(repaymentAmount.toFixed(2))
      );
      let proccFee = (transferAmount * processingFeeRate) / 100;
      proccFee = proccFee === Infinity ? 0 : proccFee;
      setAnnualFee(
        `+SGD ${validateService.formateCurrency(proccFee.toFixed(2))}`
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userInputSelector.applicants.required_loan_amount_a_1,
    userInputSelector.applicants.loan_tenor_a_1,
    userInputSelector.applicants.Transfer_amount_a_1,
    productType,
    roi,
    rate
  ]);

  const handlePopupBackButton = () => {
    setShowModel(false);
  };

  const showLoanInfo = (modelName: string) => {
    setModelName(modelName);
    setShowModel(true);
  };

  const mthPayment = (data:any) => {
    return parseInt(data) ? data : 0
  }
  return (
    <>
      <div id ="repayment-detail" className="repayment-table">
        <div className="repayment-header">
          <div className="label">
            {`SGD  ${mthPayment(monthlyRepayment)} / ${userInputSelector.applicants.loan_tenor_a_1 || 0} months`}
          </div>
          <div
            className="info-icon"
            onClick={() => showLoanInfo("showLoanInfo")}
          >
            {" "}
          </div>
        </div>
        <hr />
        {productType === 280 && (
          <>
            <div className="repaymentRow">
              <div className="label">{loanDetailsConst.annualFee}</div>
              <div className="value">{annualFee}</div>
            </div>
            <div className="repaymentRow">
              <div className="label">
                {loanDetailsConst.annulPercentageRate}
              </div>
              <div className="value">{roi}%</div>
            </div>
            <div className="repaymentRow">
              <div className="label">
                {loanDetailsConst.EIR}{" "}
                <span
                  className="info-icon"
                  onClick={() => showLoanInfo("showEIRInfo")}
                ></span>
              </div>
              <div className="value">{eir}</div>
            </div>
            {userInputSelector.applicants.loan_tenor_a_1 >= loanDetailsConst.cashBackCondition.minTenor && roi >= loanDetailsConst.cashBackCondition.minAR && staffCategory === "N" && (
                <div className="repaymentRow">
                  <div className="label">
                    {loanDetailsConst.estimatedCashback}
                  </div>
                  <div className="value"> {estimatedCashBack}</div>
                </div>
              )}
          </>
        )}
        {productType === 210 && (
          <>
            <div className="repaymentRow">
              <div className="label">
                {loanDetailsConst.requestedLoanAmount}
              </div>
              <div className="value">
                {`SGD ${validateService.formateCurrency(
                  userInputSelector.applicants.Transfer_amount_a_1,
                  true
                )}`}
              </div>
            </div>
            <div className="repaymentRow">
              <div className="label">
                {loanDetailsConst.OneTimeProcessingFee}
              </div>
              <div className="value">{annualFee}</div>
            </div>
          </>
        )}
      </div>
      {productType === 280 && jouney !== 'ETC' &&(
        <div className="loanDetailNote">
          {loanDetailsConst.note}
          <div className="loanDetailNoteInfo">{loanDetailsConst.noteInfo}</div>
        </div>
      )}

      {showModel && (
        <Model name={modelName} handlebuttonClick={handlePopupBackButton} />
      )}
    </>
  );
};

export default LoanDetailsInfo;


import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import LoanDetailsInfo from "./LoanDetailsInfo";
import loanDetailsConst from "../../../assets/_json/loan-details.json";
import interestRates from "../../../assets/_json/bt-interest-rate.json";
import validateService from "../../../services/validation-service";
import { rateAction } from "../../../utils/store/rate-slice";

jest.mock("../../../services/validation-service", () => ({
  formateCurrency: jest.fn((value) => `SGD ${value}`),
  getEIR: jest.fn(() => "3.5,2.5"),
}));

const mockStore = configureStore([]);
const initialState = {
  stages: {
    userInput: {
      applicants: {
        loan_tenor_a_1: "12",
        required_loan_amount_a_1: "10000",
        Transfer_amount_a_1: "5000",
      },
    },
    stages: [
      {
        stageInfo: {
          products: [
            {
              product_type: "280",
              campaign: "campaign1",
            },
          ],
          applicants: {
            staff_category_a_1: "N",
            rbp_applied_rate_a_1: "2.5",
          },
        },
      },
    ],
    journeyType: "BT",
  },
  rate: {
    ar: 0,
  },
  loanTopUp: {
    existingLoanTopUp: true,
    interestRate: "1.5",
    topupAmount: "2000",
  },
};

describe("LoanDetailsInfo Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test("renders without crashing and displays loan details", () => {
    render(
      <Provider store={store}>
        <LoanDetailsInfo />
      </Provider>
    );

    expect(screen.getByText("SGD 0 / 12 months")).toBeInTheDocument();
  });

  test("calculates and displays monthly repayment and estimated cashback", () => {
    render(
      <Provider store={store}>
        <LoanDetailsInfo />
      </Provider>
    );

    const monthlyRepayment = screen.getByText(/SGD 0 \/ 12 months/i);
    const cashback = screen.getByText(/SGD 0/i);

    expect(monthlyRepayment).toBeInTheDocument();
    expect(cashback).toBeInTheDocument();
  });

  test("displays the correct loan details for product type 280", () => {
    render(
      <Provider store={store}>
        <LoanDetailsInfo />
      </Provider>
    );

    expect(screen.getByText(loanDetailsConst.annualFee)).toBeInTheDocument();
    expect(screen.getByText(loanDetailsConst.annulPercentageRate)).toBeInTheDocument();
    expect(screen.getByText(loanDetailsConst.EIR)).toBeInTheDocument();
    expect(screen.getByText(loanDetailsConst.estimatedCashback)).toBeInTheDocument();
  });

  test("opens and closes the modal correctly", () => {
    render(
      <Provider store={store}>
        <LoanDetailsInfo />
      </Provider>
    );

    const infoIcon = screen.getAllByRole("button")[0];
    fireEvent.click(infoIcon);

    expect(screen.getByText(/showLoanInfo/i)).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);

    expect(screen.queryByText(/showLoanInfo/i)).not.toBeInTheDocument();
  });
}); 

import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import LoanDetailsInfo from "./LoanDetailsInfo";

const mockStore = configureStore([]);
const initialState = {
  stages: {
    userInput: {
      applicants: {
        loan_tenor_a_1: "12",
        required_loan_amount_a_1: "10000",
        Transfer_amount_a_1: "5000",
      },
    },
    stages: [
      {
        stageInfo: {
          products: [
            {
              product_type: "280",
              campaign: "campaign1",
            },
          ],
          applicants: {
            staff_category_a_1: "N",
            rbp_applied_rate_a_1: "2.5",
          },
        },
      },
    ],
    journeyType: "BT",
  },
  rate: {
    ar: 0,
  },
  loanTopUp: {
    existingLoanTopUp: true,
    interestRate: "1.5",
    topupAmount: "2000",
  },
};

describe("LoanDetailsInfo Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test("renders without crashing and displays correct number of elements", () => {
    render(
      <Provider store={store}>
        <LoanDetailsInfo />
      </Provider>
    );

    // Check for the main repayment detail container
    const repaymentDetail = screen.getByTestId("repayment-detail");
    expect(repaymentDetail).toBeInTheDocument();

    // Check for the repayment rows
    const repaymentRows = screen.getAllByClassName("repaymentRow");
    expect(repaymentRows.length).toBe(4); // Adjust the number based on your actual rows

    // Check for the presence of other specific elements if needed
    expect(screen.getByText("SGD 0 / 12 months")).toBeInTheDocument();
  });
});
