import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  KeyWithAnyModel,
  LovInputModel,
  LovInputValModel,
  StoreModel,
} from "../../../utils/model/common-model";
import "./selection-box.scss";
import {
  fieldError,
  isFieldUpdate,
  isMyinfoField,
  fieldIdAppend,
  getUrl,
} from "../../../utils/common/change.utils";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import { taxAction } from "../../../utils/store/tax-slice";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";
import { lastAction } from "../../../utils/store/last-accessed-slice";
import errorMsg from "../../../assets/_json/error.json";

const SelectionBox = (props: KeyWithAnyModel) => {
  const [errorsMessage, setErrorsMsg] = useState<any>("");
  const [errors, setErrors] = useState(false);
  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const [selectedOption, setSelectedOption] = useState<Array<LovInputValModel>>(
    []
  );
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const myInfoResponseSelector = useSelector(
    (state: StoreModel) => state.stages.myinfoResponse
  );
  const [show, hide] = useState(false);
  const [isMyinfo, setIsMyinfo] = useState(false);
  const [selectedValue, setSelectedValue] = useState<Array<LovInputValModel>>(
    []
  );
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const dependencyFieldsSelector = useSelector(
    (state: StoreModel) => state.stages.dependencyFields
  );
  const productCode = stageSelector[0].stageInfo.products[0].product_type;
  useEffect(() => {
    const data = isMyinfoField(
      myInfoResponseSelector,
      props.data.logical_field_name
    );
    setIsMyinfo(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myInfoResponseSelector]);

  let isCountryTaxResideancyField: boolean = false;
  let logicalFieldSplittedArray = props.data.logical_field_name.split("_");
  if (
    logicalFieldSplittedArray &&
    logicalFieldSplittedArray.length > 4 &&
    logicalFieldSplittedArray[2] === "tax"
  ) {
    isCountryTaxResideancyField = true;
  }

  let isCrs_reason_codeField: boolean = false;
  if (
    props.data.logical_field_name &&
    props.data.logical_field_name.substring(0, 15) === "crs_reason_code"
  ) {
    isCrs_reason_codeField = true;
  }

  useEffect(() => {
    const currentFieldLovRes: Array<KeyWithAnyModel> = lovSelector.lov.filter(
      (res: LovInputModel) => {
        return (
          res.label ===
          (isCountryTaxResideancyField
            ? "country_of_tax_residence"
            : isCrs_reason_codeField
            ? "crs_reason_code"
            : props.data.logical_field_name)
        );
      }
    );
    let preSelectedCode: string | null = null;
    // DOB-202716: Default POA to “Savings” but allow client to edit when needed. For Wealth$aver,Bonus$aver,eSaver,JumpStart
    const poa_ProductCodes = ["153", "338", "514", "507"];

    const userInputResponse =
      userInputSelector.applicants[fieldIdAppend(props)];
    if (poa_ProductCodes.indexOf(productCode) !== -1) {
      if (
        props.data.logical_field_name === "purpose_of_account" &&
        !(
          stageSelector[0].stageInfo.applicants[fieldIdAppend(props)] ||
          userInputResponse
        )
      ) {
        preSelectedCode = "SB";
      }
    }
    let fieldValue = "";
    if (userInputResponse) {
      fieldValue = userInputResponse;
    } else {
      const updatedStageStore = getUrl.getUpdatedStage();
      const stageApplicant = updatedStageStore.updatedStageInputs.find(
        (ref: any) => ref && ref.stageId === stageSelector[0].stageId
      );
      if (stageApplicant) {
        if (
          stageApplicant.applicants[fieldIdAppend(props)] !== undefined &&
          stageApplicant.applicants[fieldIdAppend(props)] !== null
        ) {
          fieldValue = stageApplicant.applicants[fieldIdAppend(props)];
        } else if (
          stageSelector[0].stageInfo.applicants[fieldIdAppend(props)]
        ) {
          fieldValue =
            stageSelector[0].stageInfo.applicants[fieldIdAppend(props)];
        }
      } else {
        fieldValue =
          stageSelector[0].stageInfo.applicants[fieldIdAppend(props)];
      }
    }

    if (fieldValue) {
      preSelectedCode = fieldValue;
    }

    if (currentFieldLovRes.length > 0) {
      let dropDownData = JSON.parse(
        JSON.stringify(currentFieldLovRes[0].value)
      );
      let preVal: Array<LovInputValModel> = [];
      dropDownData.map((item: LovInputValModel) => {
        if (props.data.logical_field_name === 'other_bank_name' && item.CODE_DESC === preSelectedCode) {
          item["checked"] = true;
          preVal.push(item);
        }
       else if (item.CODE_VALUE === preSelectedCode) {
          item["checked"] = true;
          preVal.push(item);
        } else {
          item["checked"] = false;
        }
        return item;
      });
      setSelectedOption(dropDownData);
      setSelectedValue(preVal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lovSelector.lov,
    props.data.logical_field_name,
    dependencyFieldsSelector,
  ]);

  useEffect(() => {
    setErrors(fieldError(fieldErrorSelector, props));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  const dropdownHandler = (event: React.MouseEvent<any>) => {
    event.currentTarget.firstChild.focus();
    hide(true);
  };

  const close = () => {
    hide(false);
  };

  const placeHolderText = (fieldName: string) => {
    if (fieldName === "purpose_of_account") {
      return "Select the purpose of the account";
    } else {
      return props.data.rwb_label_name;
    }
  };

  const addUserInput = (data: LovInputValModel) => {
    const previousSelectedOption = [...selectedOption];

    const valueChange = previousSelectedOption.some(
      (item) => item.CODE_VALUE === data.CODE_VALUE && data.checked === false
    );
    if (valueChange) {
      dispatch(
        ValueUpdateAction.getChangeUpdate({
          id: stageSelector[0].stageId,
          changes: true,
        })
      );
    }
    const updatedSelectedOption = previousSelectedOption.map(
      (item: LovInputValModel) => {
        if (item.CODE_DESC === data["CODE_DESC"]) {
          item["checked"] = true;
        } else {
          item["checked"] = false;
        }
        return item;
      }
    );
    setSelectedOption(updatedSelectedOption);

    let value: Array<LovInputValModel> = [data];
    setSelectedValue(value);
    if(selectedValue.length === 0){
      setErrorsMsg(false)
    }

    hide(false);
  };

  const removeSelectedValues = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    data: LovInputValModel
  ) => {
    event.stopPropagation();
    event.isPropagationStopped();

    const previousSelectedValue = [...selectedValue];

    let fieldIndex = previousSelectedValue.findIndex(
      (item: LovInputValModel) => item.CODE_VALUE === data["CODE_VALUE"]
    );
    if(fieldIndex === 0){
  setErrorsMsg(`${errorMsg.selectionbox} ${props.data.rwb_label_name}`);
}
    if (fieldIndex !== -1 ) {
      previousSelectedValue.splice(fieldIndex, 1);
    }
    if (previousSelectedValue.length===0 ) {
      
    }
    setSelectedValue(previousSelectedValue);

    const previousSelectedOption = [...selectedOption];
    const result = previousSelectedOption.map((item: LovInputValModel) => {
      if (item.CODE_VALUE === data["CODE_VALUE"]) {
        item["checked"] = !item["checked"];
      }
      return item;
    });
    setSelectedOption(result);
    dispatch(
      ValueUpdateAction.getChangeUpdate({
        id: stageSelector[0].stageId,
        changes: previousSelectedValue.length > 0 ? true : false,
      })
    );
  };

  useEffect(() => {
    setErrors(false);

    const val =
      selectedValue &&
      selectedValue.reduce((prev: Array<string>, acc: LovInputValModel) => {
        if(props.data.logical_field_name === 'other_bank_name'){
            prev.push(acc.CODE_DESC);
          }
          else {
            prev.push(acc.CODE_VALUE);
          }
        return prev;
      }, []);
    props.handleCallback(props.data, val.toString());
    if (!(stageSelector[0].stageId === "ssf-2" && getUrl.getJourneyType())) {
      if (
        (val.length > 0 || props.data.logical_field_name === "marital_status") &&
        (stageSelector[0].stageInfo.applicants[
          props.data.logical_field_name + "_a_1"
        ] ||
          getUrl.getUserInputs()[props.data.logical_field_name + "_a_1"])
      ) {
        const defVal =
          val.toString() ||
          getUrl.getUserInputs()[props.data.logical_field_name + "_a_1"] ||
          stageSelector[0].stageInfo.applicants[
            props.data.logical_field_name + "_a_1"
          ] ||
          "";

        dispatch(isFieldUpdate(props, defVal, props.data.logical_field_name));
      } else {
        if (
          val.length > 0 &&
          (props.data.logical_field_name === "account_currency" ||
            props.data.logical_field_name === "account_currency_9" ||
            props.data.logical_field_name === "ownership_status")
        ) {
          dispatch(
            isFieldUpdate(props, val.toString(), props.data.logical_field_name)
          );
        } else if (
          props.data.logical_field_name !== "account_currency" &&
          props.data.logical_field_name !== "account_currency_9" &&
          props.data.logical_field_name !== "ownership_status"
        ) {
          dispatch(
            isFieldUpdate(props, val.toString(), props.data.logical_field_name)
          );
        }
      }
    }
    if (props.data.logical_field_name === "crs_reason_code") {
      dispatch(stagesAction.updateTaxToggle());
    } else if (
      props.data.logical_field_name.substring(0, 15) === "crs_reason_code" &&
      props.data.logical_field_name.length > 16
    ) {
      dispatch(stagesAction.updateAddTaxToggle());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  const removeTaxField = () => {
    dispatch(taxAction.removeTaxField(props.data.logical_field_name));
    let seqNo = props.data.logical_field_name.split("_")[4];
    let tax_id_no_logical_name = "tax_id_no_" + seqNo;
    dispatch(
      fieldErrorAction.removeMandatoryFields([
        props.data.logical_field_name,
        tax_id_no_logical_name,
        "crs_reason_code_" + seqNo,
        "crs_comments_" + seqNo,
      ])
    );
    dispatch(
      stagesAction.removeAddToggleField({
        removeFields: [
          props.data.logical_field_name,
          tax_id_no_logical_name,
          "crs_reason_code_" + seqNo,
          "crs_comments_" + seqNo,
        ],
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

  useEffect(() => {
    if (props.data.logical_field_name === "loan_tenor") {
      let value: Array<LovInputValModel> = [
        {
          CODE_DESC: userInputSelector.applicants.loan_tenor_a_1,
          CODE_VALUE: userInputSelector.applicants.loan_tenor_a_1,
          checked: true,
        },
      ];
      setSelectedValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector.applicants.loan_tenor_a_1]);

  return (
    <>
      <div className="dropdown-select">
        <label htmlFor={props.data.logical_field_name}>
          {props.data.rwb_label_name}
          {isCountryTaxResideancyField && (
            <span onClick={() => removeTaxField()} className="remove-button">
              Delete
            </span>
          )}
        </label>
        <div
          className={`dropdown-select__field ${
            isMyinfo || props.data.editable ? "disabled" : ""
          }`}
          onClick={(event) => dropdownHandler(event)}
          onFocus={focusHandler.bind(this, props.data.logical_field_name)}
        >
          {selectedValue &&
            selectedValue.length > 0 &&
            selectedValue.map((item: LovInputValModel) => {
              return (
                <div
                  className="dropdown-select__fieldlabel"
                  key={item.CODE_VALUE}
                >
                  <span>{item.CODE_DESC}</span>
                  <span
                    className="multi-close"
                    onClick={(
                      e: React.MouseEvent<HTMLDivElement, MouseEvent>
                    ) => removeSelectedValues(e, item)}
                  ></span>
                </div>
              );
            })}
          {!(selectedValue && selectedValue.length > 0) && (
            <input
              type="text"
              className="dropdown-select__input"
              id={fieldIdAppend(props)}
              placeholder={placeHolderText(props.data.logical_field_name)}
              onChange={() => {
                //do nothing
              }}
            />
          )}
        </div>
        {errors  &&errorsMessage.length <= 0 && (
        <span className="error-msg">
          Please select {props.data.rwb_label_name}
        </span>
      )}
      {/* {errorsMessage.length < 0  && ( */}
      <span className= {errorsMessage.length > 0? "error-msg":""}
        >{errorsMessage}</span>
      {/* )} */}
        {show && selectedOption && (
          <div className="dropdown-select__background">
            <div className="dropdown-select__bg-curve"></div>
            <div className="dropdown-select__popup">
              <div className="dropdown-select__header">
                <div>{props.data.rwb_label_name}</div>
                <div className="close" onClick={close}></div>
              </div>

              <div className="dropdown-select__search">
                <input
                  autoFocus
                  name="search"
                  className="dropdown-select__search"
                  type="search"
                  placeholder="Search"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              {
                <div className="dropdown-select__expand">
                  {selectedOption
                    .filter((item: LovInputValModel) =>
                      item.CODE_DESC.toLowerCase().includes(
                        search.toLowerCase()
                      )
                    )
                    .map((item: LovInputValModel, index: number) => {
                      return (
                        <div key={index} className="dropdown-select__item">
                          <input
                            type="radio"
                            checked={item.checked}
                            onClick={() => addUserInput(item)}
                            onChange={() => {
                              //do nothing
                            }}
                            value={item.CODE_VALUE}
                            id={item.CODE_VALUE}
                          />
                          <label htmlFor={item.CODE_VALUE}>
                            {item.CODE_DESC}
                          </label>
                        </div>
                      );
                    })}
                </div>
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SelectionBox;
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SelectionBox from "./selection-box";
import { StoreModel } from "../../../utils/model/common-model";

// Mock Redux store
const mockStore = configureStore([]);

describe("SelectionBox Component", () => {
  let store: any;
  let mockProps: any;

  beforeEach(() => {
    store = mockStore({
      lov: {
        lov: [
          {
            label: "example_field",
            value: [
              { CODE_DESC: "Option 1", CODE_VALUE: "1", checked: false },
              { CODE_DESC: "Option 2", CODE_VALUE: "2", checked: false },
            ],
          },
        ],
      },
      fielderror: { error: [] },
      stages: {
        stages: [
          {
            stageInfo: {
              applicants: {
                example_field_a_1: "1",
              },
              products: [{ product_type: "153" }],
            },
          },
        ],
        userInput: {
          applicants: {
            example_field_a_1: "1",
          },
        },
        myinfoResponse: {},
        dependencyFields: [],
      },
    });

    mockProps = {
      data: {
        logical_field_name: "example_field",
        rwb_label_name: "Example Field",
        editable: false,
      },
      handleCallback: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    expect(screen.getByLabelText("Example Field")).toBeInTheDocument();
  });

  it("displays options from the LOV selector", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Trigger dropdown
    fireEvent.click(screen.getByText("Example Field"));
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("handles selection of an option", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Trigger dropdown and select an option
    fireEvent.click(screen.getByText("Example Field"));
    const option1 = screen.getByLabelText("Option 1");
    fireEvent.click(option1);

    expect(mockProps.handleCallback).toHaveBeenCalledWith(
      mockProps.data,
      "1"
    );
    expect(option1).toBeChecked();
  });

  it("removes selected values when clicking the close button", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Select an option
    fireEvent.click(screen.getByText("Example Field"));
    fireEvent.click(screen.getByLabelText("Option 1"));

    // Remove selected value
    const closeButton = screen.getByClassName("multi-close");
    fireEvent.click(closeButton);

    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
  });

  it("handles search input correctly", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Trigger dropdown
    fireEvent.click(screen.getByText("Example Field"));

    // Search for an option
    const searchInput = screen.getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "Option 1" } });

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
  });

  it("displays an error message if no value is selected", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Submit without selecting an option
    fireEvent.blur(screen.getByPlaceholderText("Select the purpose of the account"));
    expect(screen.getByText("Please select Example Field")).toBeInTheDocument();
  });

  it("removes tax fields if delete button is clicked", () => {
    mockProps.data.logical_field_name = "country_of_tax_residence";
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    // Verify appropriate Redux actions are dispatched
    const actions = store.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: "tax/removeTaxField",
        payload: "country_of_tax_residence",
      })
    );
  });
});


import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SelectionBox from "./selection-box"; // Update this path if necessary
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import { taxAction } from "../../../utils/store/tax-slice";
import "@testing-library/jest-dom";
import { fieldError, isFieldUpdate, isMyinfoField, fieldIdAppend, getUrl } from "../../../utils/common/change.utils";
import errorMsg from "../../../assets_json/error.json";

const mockStore = configureStore([]);
const initialState = {
  lov: { lov: [] },
  fielderror: { error: {} },
  stages: {
    stages: [{ stageInfo: { products: [{ product_type: "153" }], applicants: {} } }],
    userInput: { applicants: {} },
    myinfoResponse: {},
    dependencyFields: [],
  },
};

const mockProps = {
  data: {
    logical_field_name: "purpose_of_account",
    rwb_label_name: "Purpose of Account",
    editable: false,
    handleCallback: jest.fn(),
  },
};

describe("SelectionBox Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  it("renders the component without crashing", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    expect(screen.getByText("Purpose of Account")).toBeInTheDocument();
  });

  it("displays the placeholder text correctly", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    expect(
      screen.getByPlaceholderText("Select the purpose of the account")
    ).toBeInTheDocument();
  });

  it("handles dropdown opening and closing", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    const dropdownField = screen.getByText("Purpose of Account");
    fireEvent.click(dropdownField);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Purpose of Account")); // Close dropdown
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });

  it("selects and deselects an option", () => {
    const updatedState = {
      ...initialState,
      lov: {
        lov: [
          {
            label: "purpose_of_account",
            value: [{ CODE_VALUE: "SB", CODE_DESC: "Savings" }],
          },
        ],
      },
    };
    store = mockStore(updatedState);

    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Open dropdown
    fireEvent.click(screen.getByText("Purpose of Account"));
    expect(screen.getByText("Savings")).toBeInTheDocument();

    // Select an option
    fireEvent.click(screen.getByLabelText("Savings"));
    expect(mockProps.handleCallback).toHaveBeenCalledWith(
      mockProps.data,
      "SB"
    );

    // Deselect the option
    fireEvent.click(screen.getByText("Savings").nextSibling); // Close icon
    expect(mockProps.handleCallback).toHaveBeenCalledWith(mockProps.data, "");
  });

  it("handles errors and displays error messages", () => {
    const updatedState = {
      ...initialState,
      fielderror: {
        error: { [`${mockProps.data.logical_field_name}_a_1`]: true },
      },
    };
    store = mockStore(updatedState);

    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Ensure error message is displayed
    expect(screen.getByText(errorMsg["purpose_of_account"])).toBeInTheDocument();
  });

  it("handles special cases like `loan_tenor`", () => {
    const updatedProps = {
      ...mockProps,
      data: { logical_field_name: "loan_tenor", rwb_label_name: "Loan Tenor" },
    };
    const updatedState = {
      ...initialState,
      stages: {
        ...initialState.stages,
        userInput: { applicants: { loan_tenor_a_1: "12 Months" } },
      },
    };
    store = mockStore(updatedState);

    render(
      <Provider store={store}>
        <SelectionBox {...updatedProps} />
      </Provider>
    );

    // Pre-selected value
    expect(screen.getByText("12 Months")).toBeInTheDocument();
  });

  it("handles delete action for tax fields", () => {
    const updatedProps = {
      ...mockProps,
      data: { logical_field_name: "country_of_tax_residence_1" },
    };

    render(
      <Provider store={store}>
        <SelectionBox {...updatedProps} />
      </Provider>
    );

    // Simulate delete button click
    fireEvent.click(screen.getByText("Delete"));
    const actions = store.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: stagesAction.removeAddToggleField.type,
      })
    );
  });
});

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SelectionBox from "./selection-box";
import * as reactRedux from "react-redux";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import { taxAction } from "../../../utils/store/tax-slice";
import "@testing-library/jest-dom";
import * as utils from "../../../utils/common/change.utils";
import errorMsg from "../../../assets_json/error.json";

// Create a mock Redux store
const mockStore = configureStore([]);
const initialState = {
  lov: { lov: [] },
  fielderror: { error: {} },
  stages: {
    stages: [{ stageInfo: { products: [{ product_type: "153" }], applicants: {} } }],
    userInput: { applicants: {} },
    myinfoResponse: {},
    dependencyFields: [],
  },
};

// Mock all external utility functions
jest.mock("../../../utils/common/change.utils", () => ({
  fieldError: jest.fn(),
  isFieldUpdate: jest.fn(),
  isMyinfoField: jest.fn(),
  fieldIdAppend: jest.fn(),
  getUrl: jest.fn(),
}));

// Mock imported actions
jest.mock("../../../utils/store/field-error-slice", () => ({
  fieldErrorAction: jest.fn(),
}));

jest.mock("../../../utils/store/value-update-slice", () => ({
  ValueUpdateAction: jest.fn(),
}));

jest.mock("../../../utils/store/stages-slice", () => ({
  stagesAction: {
    removeAddToggleField: jest.fn(),
  },
}));

jest.mock("../../../utils/store/tax-slice", () => ({
  taxAction: jest.fn(),
}));

describe("SelectionBox Component", () => {
  let store;

  const mockProps = {
    data: {
      logical_field_name: "purpose_of_account",
      rwb_label_name: "Purpose of Account",
      editable: false,
      handleCallback: jest.fn(),
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  it("renders the component without crashing", () => {
    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    expect(screen.getByText("Purpose of Account")).toBeInTheDocument();
  });

  it("invokes `getUrl` utility when the dropdown opens", () => {
    utils.getUrl.mockReturnValue("mock-url");

    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Purpose of Account"));
    expect(utils.getUrl).toHaveBeenCalled();
  });

  it("dispatches `fieldErrorAction` when an error occurs", () => {
    const updatedState = {
      ...initialState,
      fielderror: {
        error: { [`${mockProps.data.logical_field_name}_a_1`]: true },
      },
    };
    store = mockStore(updatedState);

    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    expect(fieldErrorAction).toHaveBeenCalled();
    expect(screen.getByText(errorMsg["purpose_of_account"])).toBeInTheDocument();
  });

  it("dispatches `ValueUpdateAction` when a value is selected", () => {
    const updatedState = {
      ...initialState,
      lov: {
        lov: [
          {
            label: "purpose_of_account",
            value: [{ CODE_VALUE: "SB", CODE_DESC: "Savings" }],
          },
        ],
      },
    };
    store = mockStore(updatedState);

    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    // Open dropdown
    fireEvent.click(screen.getByText("Purpose of Account"));
    fireEvent.click(screen.getByText("Savings"));

    expect(ValueUpdateAction).toHaveBeenCalledWith(
      mockProps.data,
      "SB",
      expect.anything()
    );
  });

  it("calls `fieldIdAppend` utility on specific field interactions", () => {
    utils.fieldIdAppend.mockReturnValue("mock-field-id");

    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Purpose of Account"));
    expect(utils.fieldIdAppend).toHaveBeenCalledWith(
      mockProps.data.logical_field_name,
      1 // Assuming the applicant number is 1
    );
  });

  it("handles the delete action for tax fields correctly", () => {
    const updatedProps = {
      ...mockProps,
      data: { logical_field_name: "country_of_tax_residence_1" },
    };

    render(
      <Provider store={store}>
        <SelectionBox {...updatedProps} />
      </Provider>
    );

    // Simulate delete button click
    fireEvent.click(screen.getByText("Delete"));
    expect(taxAction).toHaveBeenCalled();
  });
});

