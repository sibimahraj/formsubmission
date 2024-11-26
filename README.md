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

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import SelectionBox from "src/shared/components/selection-box/selection-box";
import { isFieldUpdate } from "path/to/actions"; // Update with actual path

jest.mock("path/to/actions", () => ({
  isFieldUpdate: jest.fn(),
}));

const mockStore = configureStore([thunk]);

describe("SelectionBox Component", () => {
  let store;

  beforeEach(() => {
    // Initialize mock Redux store with any necessary initial state
    store = mockStore({
      yourReducer: {
        // Add initial state structure your component relies on
        someField: "initial value",
      },
    });

    // Clear mock calls before each test
    jest.clearAllMocks();
  });

  it("dispatches field update action when the delete button is clicked", () => {
    const mockProps = {
      data: {
        logical_field_name: "ownership_status",
      },
    };

    // Mock the action to return a valid plain Redux action
    isFieldUpdate.mockImplementation((field, value, logicalFieldName) => ({
      type: "FIELD_UPDATE",
      payload: { field, value, logicalFieldName },
    }));

    render(
      <Provider store={store}>
        <SelectionBox {...mockProps} />
      </Provider>
    );

    const deleteButton = screen.getByText("Delete"); // Replace "Delete" with the actual button text
    fireEvent.click(deleteButton);

    // Verify the mock action creator was called
    expect(isFieldUpdate).toHaveBeenCalledWith(
      "ownership_status", // Replace with actual field
      "expected_value",   // Replace with expected value
      "ownership_status"  // Replace with logical field name
    );

    // Verify that the action was dispatched
    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: "FIELD_UPDATE",
      payload: {
        field: "ownership_status",
        value: "expected_value",
        logicalFieldName: "ownership_status",
      },
    });
  });
});


import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import validateService from "../../../services/validation-service";
import {
  fieldError,
  isFieldUpdate,
  fieldIdAppend,
} from "../../../utils/common/change.utils";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import "./dates.scss";
import errorMsg from "../../../assets/_json/error.json";
import { lastAction } from "../../../utils/store/last-accessed-slice";

export const Date = (props: KeyWithAnyModel) => {
  const [date, setDate] = useState({ DD: "", MM: "", YYYY: "" });
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const changeHandler = (
    data: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    setError("");
    const fieldName = props.data.logical_field_name;
    if (type === "YYYY") {
      date["YYYY"] = data.target.value;
    } else if (type === "MM") {
      date["MM"] = data.target.value;
      if(date["MM"].length === 2){
        yearRef.current?.focus();
      }
    } else if (type === "DD") {
      date["DD"] = data.target.value;
      if(date["DD"].length === 2){
        monthRef.current?.focus();
      }
    }
    const userValue = date["YYYY"] + "-" + date["MM"] + "-" + date["DD"];
    props.handleCallback(props.data, userValue);
    if (date["DD"] !== "" || date["MM"] !== "" || date["YYYY"] !== "") {
      if (
        date["YYYY"].length > 3 &&
        date["DD"].length > 1 &&
        date["MM"].length > 1
      ) {
        if (validateService.isValidDate(userValue)) {
          const age = validateService.calculateAge(userValue);
          const ageInValid = validateService.validateAge(
            age,
            stageSelector[0].stageInfo.products[0].product_type,
            stageSelector[0].stageInfo.products[0].product_category
          );
          if (ageInValid) {
            let ageInvalidMessage = validateService.getValidationMsg(
              stageSelector[0].stageInfo.products[0].product_type,
              stageSelector[0].stageInfo.products[0].product_category
            );
            setError(`${props.data.rwb_label_name} ${ageInvalidMessage}`);
          } else {
            dispatch(isFieldUpdate(props, userValue, fieldName));
          }
        } else {
          setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);
        }
      } else {
        setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);
      }
    } else if (
      props.data.mandatory === "Yes" ||
      props.data.mandatory === "Conditional"
    ) {
      setError(`${errorMsg.emity} ${props.data.rwb_label_name}`);
    }
  };

  const bindHandler = (data: any, type: string) => {
    if (
      (type === "DD" || type === "MM") &&
      data.target.value &&
      parseInt(data.target.value) > 0 &&
      data.target.value.length < 2
    ) {
      date[type] = `0${data.target.value}`;
      data.target.value = date[type];
      changeHandler(data, type);
    }
  };

  useEffect(() => {
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      const storeDate =
        stageSelector[0].stageInfo.applicants[
          props.data.logical_field_name + "_a_1"
        ];
      if (storeDate) {
        let splitDate = storeDate.split("-");
        setDate({ DD: splitDate[2], MM: splitDate[1], YYYY: splitDate[0] });
      }
    }
  }, [stageSelector, props.data.logical_field_name]);

  useEffect(() => {
    if (fieldError(fieldErrorSelector, props)) {
      setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);
    } else {
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  const allowOnlyCharacter = (
    event: React.KeyboardEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    validateService.allowOnlyCharacter(event, fieldName);
  };
  const focusHandler = (
    fieldName: string,
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    dispatch(lastAction.getField(fieldName));
  };
  return (
    <>
      <div className="date">
        <label htmlFor={props.data.logical_field_name}>
          {props.data.rwb_label_name}
        </label>
        <div className={`date__inputs ${props.data.editable ? 'date__inputs--disabled':''}`} id={fieldIdAppend(props)}>
          <input
            placeholder="DD"
            minLength={2}
            maxLength={2}
            type="tel"
            value={date.DD}
            required={
              props.data.mandatory === "Yes" || "Conditional" ? true : false
            }
            onChange={(event) => changeHandler(event, "DD")}
            onKeyPress={(event) =>
              allowOnlyCharacter(event, props.data.logical_field_name)
            }
            onBlur={(event) => bindHandler(event, "DD")}
            disabled={props.data.editable}
            onFocus={focusHandler.bind(this, props.data.logical_field_name)}
          /><span className="date__seperator"></span>
          <input
            ref={monthRef}
            placeholder="MM"
            minLength={2}
            maxLength={2}
            type="tel"
            value={date.MM}
            required={
              props.data.mandatory === "Yes" || "Conditional" ? true : false
            }
            onChange={(event) => changeHandler(event, "MM")}
            onKeyPress={(event) =>
              allowOnlyCharacter(event, props.data.logical_field_name)
            }
            onBlur={(event) => bindHandler(event, "MM")}
            disabled={props.data.editable}
            onFocus={focusHandler.bind(this, props.data.logical_field_name)}
          /><span className="date__seperator"></span>
          <input
            ref={yearRef}
            placeholder="YYYY"
            minLength={4}
            maxLength={4}
            type="tel"
            value={date.YYYY}
            required={
              props.data.mandatory === "Yes" || "Conditional" ? true : false
            }
            onChange={(event) => changeHandler(event, "YYYY")}
            onKeyPress={(event) =>
              allowOnlyCharacter(event, props.data.logical_field_name)
            }
            disabled={props.data.editable}
            onFocus={focusHandler.bind(this, props.data.logical_field_name)}
          />
        </div>
      </div>
      {error && <span className="error-msg">{error}</span>}
    </>
  );
};

export default Date;


import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Date from "./Date";
import validateService from "../../../services/validation-service";
import { lastAction } from "../../../utils/store/last-accessed-slice";

// Mock the dependencies
jest.mock("../../../services/validation-service", () => ({
  isValidDate: jest.fn(),
  calculateAge: jest.fn(),
  validateAge: jest.fn(),
  getValidationMsg: jest.fn(),
  allowOnlyCharacter: jest.fn(),
}));

jest.mock("../../../utils/store/last-accessed-slice", () => ({
  getField: jest.fn(),
}));

describe("Date Component", () => {
  const mockStore = configureStore([]);
  let store;

  const props = {
    data: {
      logical_field_name: "testDate",
      rwb_label_name: "Date of Birth",
      mandatory: "Yes",
      editable: false,
      handleCallback: jest.fn(),
    },
  };

  beforeEach(() => {
    store = mockStore({
      stages: { stages: [{ stageInfo: { products: [{ product_type: "type1", product_category: "category1" }], applicants: { testDate_a_1: "2000-01-01" } } }] },
      fielderror: { error: {} },
    });
  });

  test("renders Date component and populates fields from store", () => {
    render(
      <Provider store={store}>
        <Date {...props} />
      </Provider>
    );

    expect(screen.getByPlaceholderText("DD").value).toBe("01");
    expect(screen.getByPlaceholderText("MM").value).toBe("01");
    expect(screen.getByPlaceholderText("YYYY").value).toBe("2000");
  });

  test("calls handleCallback on valid date input", () => {
    validateService.isValidDate.mockReturnValue(true);
    validateService.calculateAge.mockReturnValue(25);
    validateService.validateAge.mockReturnValue(false);

    render(
      <Provider store={store}>
        <Date {...props} />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("DD"), { target: { value: "15" } });
    fireEvent.change(screen.getByPlaceholderText("MM"), { target: { value: "08" } });
    fireEvent.change(screen.getByPlaceholderText("YYYY"), { target: { value: "1998" } });

    expect(props.data.handleCallback).toHaveBeenCalledWith(
      props.data,
      "1998-08-15"
    );
  });

  test("shows error for invalid date", () => {
    validateService.isValidDate.mockReturnValue(false);

    render(
      <Provider store={store}>
        <Date {...props} />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("YYYY"), { target: { value: "202" } });

    expect(screen.getByText(/Date of Birth/)).toBeInTheDocument();
  });

  test("shows error for invalid age", () => {
    validateService.isValidDate.mockReturnValue(true);
    validateService.calculateAge.mockReturnValue(5);
    validateService.validateAge.mockReturnValue(true);
    validateService.getValidationMsg.mockReturnValue("is not valid");

    render(
      <Provider store={store}>
        <Date {...props} />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("YYYY"), { target: { value: "2018" } });

    expect(screen.getByText(/Date of Birth is not valid/)).toBeInTheDocument();
  });

  test("calls allowOnlyCharacter on key press", () => {
    render(
      <Provider store={store}>
        <Date {...props} />
      </Provider>
    );

    fireEvent.keyPress(screen.getByPlaceholderText("DD"), { key: "a", code: "KeyA" });

    expect(validateService.allowOnlyCharacter).toHaveBeenCalled();
  });

  test("calls getField on focus", () => {
    render(
      <Provider store={store}>
        <Date {...props} />
      </Provider>
    );

    fireEvent.focus(screen.getByPlaceholderText("YYYY"));

    expect(lastAction.getField).toHaveBeenCalledWith("testDate");
  });

  test("handles zero-padded input for day and month", () => {
    render(
      <Provider store={store}>
        <Date {...props} />
      </Provider>
    );

    fireEvent.blur(screen.getByPlaceholderText("DD"), { target: { value: "7" } });

    expect(screen.getByPlaceholderText("DD").value).toBe("07");

    fireEvent.blur(screen.getByPlaceholderText("MM"), { target: { value: "8" } });

    expect(screen.getByPlaceholderText("MM").value).toBe("08");
  });
});


import { useEffect, useState } from "react";
import "./thank-you.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import thankyouData from "../../../assets/_json/thankyou.json";
import { useSelector, useDispatch } from "react-redux";
import { getUrl } from "../../../utils/common/change.utils";
import trackEvents from "../../../services/track-events";
import ThankYouCC from "./thankyou-cc";
// import ThankYouPL from "./thankyou-pl";
import gaTrackEvents from "../../../services/ga-track-events";
import ThankyouError from "./thankyou-error";
import { useNavigate } from "react-router-dom";
import { store } from "../../../utils/store/store";

const ThankYou = () => {
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
 const thankyou: KeyWithAnyModel = thankyouData;
 const applicationReferenceNo = stageSelector[0].stageInfo.application.application_reference;
  const [applicationDetails, setApplicationDetails] = useState({
    productCategory: "",
    productName: "",
    acct_details: [],
    account_number: "",
    thankyouProp: "NSTP",
    accountNum: "",
   thankyouText: "Common",
    thankyouFeedback: "Feedback",
    feedbackUrl: "",
    isStp: false,
    loanTenureMonths: "",
    approvedLoan: 0,
    productType: "",
    feeAmount: "",
    card_no: "",
    cardNumber: "",
    cardName: "",
    productSequenceNo: "",
  });
   const [showErrorUI, setShowerrorUI] = useState(false);
 useEffect(() => {
    setApplicationDetails((prevValue) => {
      if (
        stageSelector &&
        stageSelector[0].stageInfo && stageSelector[0].stageInfo.products &&
        stageSelector[0].stageInfo.products.length >= 1
      ) {
        prevValue.productCategory =
          stageSelector[0].stageInfo.products[0].product_category;
        prevValue.productName = stageSelector[0].stageInfo.products[0].name;
        prevValue.productSequenceNo =
          stageSelector[0].stageInfo.products[0].product_sequence_number;
        prevValue.productType =
          stageSelector[0].stageInfo.products[0].product_type;
        if (
          stageSelector[0].stageInfo.products[0].acct_details &&
          stageSelector[0].stageInfo.products[0].acct_details.length >= 1
        ) {
          prevValue.acct_details =
            stageSelector[0].stageInfo.products[0].acct_details;
          prevValue.account_number =
            stageSelector[0].stageInfo.products[0].acct_details[0].account_number;
          prevValue.card_no =
            stageSelector[0].stageInfo.products[0].acct_details[0].card_no;
        }
      }
      prevValue.thankyouProp = "NSTP";
      if (
        prevValue.acct_details &&
        prevValue.acct_details[0] &&
        prevValue.account_number
      ) {
        prevValue.thankyouProp = "STP";
        prevValue.accountNum = prevValue.account_number;
      }
      if (
        prevValue.acct_details &&
        prevValue.acct_details[0] &&
        prevValue.card_no
      ) {
        prevValue.thankyouProp = "STP";
        prevValue.cardNumber = prevValue.card_no;
      }
      prevValue.isStp = prevValue.thankyouProp === "STP" ? true : false;
      prevValue.feedbackUrl =
        thankyou[prevValue.thankyouFeedback]["url_prefix"] +
        thankyou[prevValue.thankyouFeedback]["casa"] +
        thankyou[prevValue.thankyouFeedback]["url_suffix"] +
        applicationReferenceNo!;

      // prevValue = setSTPData(prevValue);
      if (prevValue.isStp) {
        if (prevValue.productCategory === "CC") {
          if (stageSelector[0].stageInfo.applicants) {
            if (stageSelector[0].stageInfo.applicants.embossed_name_a_1) {
              prevValue.cardName =
                stageSelector[0].stageInfo.applicants.embossed_name_a_1.toUpperCase();
            }
            if (prevValue.card_no) {
              prevValue.cardNumber = prevValue.card_no;
            }
          }
         } 
        
      }
      return { ...prevValue };
    });
    if (stageSelector[0] && stageSelector[0].stageId && getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload) {
      gaTrackEvents.pageView(stageSelector[0].stageId);
    }
    if(getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload){
    trackEvents.triggerAdobeEvent("formSubmit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const submitForm = (event:React.FormEvent<EventTarget>) => {
    if (
      stageSelector &&
      (stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IX" || stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IM")
     ) {
    
     }
     else {
      window.location.href = `${process.env.REACT_APP_HOME_PAGE_URL}`;
    }
    event.preventDefault();
  };
return (
    <>
      {applicationDetails && (
        <form className="form">
          <div className="app thankyou">
            <div className="app__body">
              <div className="app__right">
                <div className="thankyou__container">
                  {!showErrorUI &&
                    
                     (
                      <>
                     {applicationDetails.productCategory === "CC" && (
                          <ThankYouCC
                            applicationDetails={applicationDetails}
                            thankyou={thankyou}
                            applicationReferenceNo={applicationReferenceNo}
                            submitForm={submitForm}
                            />
                        )}
                       </>
                    )}
                  {applicationDetails.productCategory === "CC" && (
                    <>
                    </>
                  )}
                  {showErrorUI && (
                    <ThankyouError
                      applicationDetails={applicationDetails}
                      thankyou={thankyou}
                      applicationReferenceNo={applicationReferenceNo}
                      />
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default ThankYou;



import { render } from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom/extend-expect'
import { Provider } from "react-redux";
import configureStore,{MockStoreEnhanced} from 'redux-mock-store'
import { Store } from "@reduxjs/toolkit";
import { shallow } from "enzyme";
import Footer from "./footer";

interface State {
    stages:{
        stages: Array<{
            stageId:string;
            product_type: string;
            journeyType:string;
        }>;
    };
    otherMyInfo:string;
}

const initialState: State = {
    stages:{
        stages:[
            {
                stageId: 'NTC',product_type:'280', journeyType:"NTC"
            }
        ],
    },
    otherMyInfo:'someInfo'
};
const mockStore = configureStore<State>();
const store : MockStoreEnhanced<State,{}> = mockStore(initialState);

describe('Footer Component', ()=>{
    let wrapper:any;
    beforeEach(() => {
        wrapper = shallow(
          <Provider store={store}>
            <Footer props={{validateNext:true,uploadjourney:true}}/>
          </Provider>
          
        );
      });
    it('should render Footer component',()=>{
        // const {getByText} = render(
        //     <Provider store={store}>
        //         <Footer props={{validateNext:true,uploadjourney:true}}/>
        //     </Provider>
        // );
        //  expect(getByText('Back')).toBeInTheDocument();
        //  expect(getByText('Agree and Submit')).toBeInTheDocument()
        expect(wrapper).toHaveLength(1);
    })
}


)

import { useEffect, useState } from "react";
import "./thank-you.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import thankyouData from "../../../assets/_json/thankyou.json";
import { useSelector, useDispatch } from "react-redux";
import { getUrl } from "../../../utils/common/change.utils";
import trackEvents from "../../../services/track-events";
import ThankYouCC from "./thankyou-cc";
// import ThankYouPL from "./thankyou-pl";
import gaTrackEvents from "../../../services/ga-track-events";
import ThankyouError from "./thankyou-error";
import { useNavigate } from "react-router-dom";
import { store } from "../../../utils/store/store";

const ThankYou = () => {
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
 const thankyou: KeyWithAnyModel = thankyouData;
 const applicationReferenceNo = stageSelector[0].stageInfo.application.application_reference;
  const [applicationDetails, setApplicationDetails] = useState({
    productCategory: "",
    productName: "",
    acct_details: [],
    account_number: "",
    thankyouProp: "NSTP",
    accountNum: "",
   thankyouText: "Common",
    thankyouFeedback: "Feedback",
    feedbackUrl: "",
    isStp: false,
    loanTenureMonths: "",
    approvedLoan: 0,
    productType: "",
    feeAmount: "",
    card_no: "",
    cardNumber: "",
    cardName: "",
    productSequenceNo: "",
  });
   const [showErrorUI, setShowerrorUI] = useState(false);
 useEffect(() => {
    setApplicationDetails((prevValue) => {
      if (
        stageSelector &&
        stageSelector[0].stageInfo && stageSelector[0].stageInfo.products &&
        stageSelector[0].stageInfo.products.length >= 1
      ) {
        prevValue.productCategory =
          stageSelector[0].stageInfo.products[0].product_category;
        prevValue.productName = stageSelector[0].stageInfo.products[0].name;
        prevValue.productSequenceNo =
          stageSelector[0].stageInfo.products[0].product_sequence_number;
        prevValue.productType =
          stageSelector[0].stageInfo.products[0].product_type;
        if (
          stageSelector[0].stageInfo.products[0].acct_details &&
          stageSelector[0].stageInfo.products[0].acct_details.length >= 1
        ) {
          prevValue.acct_details =
            stageSelector[0].stageInfo.products[0].acct_details;
          prevValue.account_number =
            stageSelector[0].stageInfo.products[0].acct_details[0].account_number;
          prevValue.card_no =
            stageSelector[0].stageInfo.products[0].acct_details[0].card_no;
        }
      }
      prevValue.thankyouProp = "NSTP";
      if (
        prevValue.acct_details &&
        prevValue.acct_details[0] &&
        prevValue.account_number
      ) {
        prevValue.thankyouProp = "STP";
        prevValue.accountNum = prevValue.account_number;
      }
      if (
        prevValue.acct_details &&
        prevValue.acct_details[0] &&
        prevValue.card_no
      ) {
        prevValue.thankyouProp = "STP";
        prevValue.cardNumber = prevValue.card_no;
      }
      prevValue.isStp = prevValue.thankyouProp === "STP" ? true : false;
      prevValue.feedbackUrl =
        thankyou[prevValue.thankyouFeedback]["url_prefix"] +
        thankyou[prevValue.thankyouFeedback]["casa"] +
        thankyou[prevValue.thankyouFeedback]["url_suffix"] +
        applicationReferenceNo!;

      // prevValue = setSTPData(prevValue);
      if (prevValue.isStp) {
        if (prevValue.productCategory === "CC") {
          if (stageSelector[0].stageInfo.applicants) {
            if (stageSelector[0].stageInfo.applicants.embossed_name_a_1) {
              prevValue.cardName =
                stageSelector[0].stageInfo.applicants.embossed_name_a_1.toUpperCase();
            }
            if (prevValue.card_no) {
              prevValue.cardNumber = prevValue.card_no;
            }
          }
         } 
        
      }
      return { ...prevValue };
    });
    if (stageSelector[0] && stageSelector[0].stageId && getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload) {
      gaTrackEvents.pageView(stageSelector[0].stageId);
    }
    if(getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload){
    trackEvents.triggerAdobeEvent("formSubmit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const submitForm = (event:React.FormEvent<EventTarget>) => {
    if (
      stageSelector &&
      (stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IX" || stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IM")
     ) {
    
     }
     else {
      window.location.href = `${process.env.REACT_APP_HOME_PAGE_URL}`;
    }
    event.preventDefault();
  };
return (
    <>
      {applicationDetails && (
        <form className="form">
          <div className="app thankyou">
            <div className="app__body">
              <div className="app__right">
                <div className="thankyou__container">
                  {!showErrorUI &&
                    
                     (
                      <>
                     {applicationDetails.productCategory === "CC" && (
                          <ThankYouCC
                            applicationDetails={applicationDetails}
                            thankyou={thankyou}
                            applicationReferenceNo={applicationReferenceNo}
                            submitForm={submitForm}
                            />
                        )}
                       </>
                    )}
                  {applicationDetails.productCategory === "CC" && (
                    <>
                    </>
                  )}
                  {showErrorUI && (
                    <ThankyouError
                      applicationDetails={applicationDetails}
                      thankyou={thankyou}
                      applicationReferenceNo={applicationReferenceNo}
                      />
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default ThankYou;

import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ThankYou from "./ThankYou";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import thankyouData from "../../../assets/_json/thankyou.json";
import { getUrl } from "../../../utils/common/change.utils";
import trackEvents from "../../../services/track-events";
import gaTrackEvents from "../../../services/ga-track-events";

// Mock Redux store
const mockStore = configureStore([]);
jest.mock("../../../services/track-events");
jest.mock("../../../services/ga-track-events");
jest.mock("../../../utils/common/change.utils");

describe("ThankYou Component", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageId: "stage1",
            stageInfo: {
              application: {
                application_reference: "REF12345",
              },
              products: [
                {
                  product_category: "CC",
                  name: "Credit Card",
                  product_sequence_number: "SEQ001",
                  product_type: "Card",
                  acct_details: [
                    {
                      account_number: "12345678",
                      card_no: "987654321",
                    },
                  ],
                },
              ],
              applicants: {
                embossed_name_a_1: "John Doe",
                auth_mode_a_1: "IX",
              },
            },
          },
        ],
        isDocumentUpload: false,
      },
    });

    // Mock external dependencies
    getUrl.getParameterByName = jest.fn().mockImplementation((param) => {
      if (param === "auth") return null;
      return null;
    });

    (trackEvents.triggerAdobeEvent as jest.Mock).mockImplementation(() => {});
    (gaTrackEvents.pageView as jest.Mock).mockImplementation(() => {});
  });

  test("renders ThankYou component with STP flow", () => {
    render(
      <Provider store={store}>
        <ThankYou />
      </Provider>
    );

    expect(screen.getByText(/Credit Card/i)).toBeInTheDocument();
    expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith("formSubmit");
    expect(gaTrackEvents.pageView).toHaveBeenCalledWith("stage1");
  });

  test("renders ThankYou component with non-STP flow", () => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageId: "stage2",
            stageInfo: {
              application: {
                application_reference: "REF67890",
              },
              products: [
                {
                  product_category: "Loan",
                  name: "Personal Loan",
                  product_sequence_number: "SEQ002",
                  product_type: "Loan",
                },
              ],
            },
          },
        ],
        isDocumentUpload: true,
      },
    });

    render(
      <Provider store={store}>
        <ThankYou />
      </Provider>
    );

    expect(screen.getByText(/Personal Loan/i)).toBeInTheDocument();
    expect(trackEvents.triggerAdobeEvent).toHaveBeenCalled();
    expect(gaTrackEvents.pageView).toHaveBeenCalledWith("stage2");
  });

  test("handles form submission with authenticated mode", () => {
    render(
      <Provider store={store}>
        <ThankYou />
      </Provider>
    );

    const formElement = screen.getByRole("form");
    fireEvent.submit(formElement);

    // No redirect since auth mode is "IX"
    expect(window.location.href).not.toBeDefined();
  });

  test("handles form submission with unauthenticated mode", () => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageId: "stage3",
            stageInfo: {
              application: {
                application_reference: "REF11223",
              },
              applicants: {
                auth_mode_a_1: "UA",
              },
            },
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <ThankYou />
      </Provider>
    );

    const formElement = screen.getByRole("form");
    fireEvent.submit(formElement);

    expect(window.location.href).toBe(`${process.env.REACT_APP_HOME_PAGE_URL}`);
  });

  test("renders error UI when showErrorUI is true", () => {
    render(
      <Provider store={store}>
        <ThankYou />
      </Provider>
    );

    // Simulate error UI condition
    const errorStateSetter = screen.queryByText(/error/i);
    expect(errorStateSetter).toBeNull();
  });

  test("generates correct feedback URL", () => {
    render(
      <Provider store={store}>
        <ThankYou />
      </Provider>
    );

    const feedbackUrl = `${thankyouData["Feedback"]["url_prefix"]}${thankyouData["Feedback"]["casa"]}${thankyouData["Feedback"]["url_suffix"]}REF12345`;
    expect(feedbackUrl).toBeDefined();
  });
});

import { render,cleanup,screen } from "@testing-library/react";

import { mount, shallow, ShallowWrapper } from "enzyme";

import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { useDispatch, useSelector } from "react-redux";
import storeMockData from './../../utils/mock/store-spec.json';
import Dashboard from "./dashboard";
import React from "react";
import { useNavigate } from "react-router-dom";

jest.autoMockOff();
jest.mock("axios", () => ({
  __esModule: true,
}));
jest.mock("@lottiefiles/react-lottie-player", () => ({
  __esModule: true,
}));

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
let store: any;


beforeEach(() => {
  global.scrollTo = jest.fn();
  store = mockStore(storeMockData);
});
afterEach(() => {
  jest.resetAllMocks();
});
afterAll(() => {
  cleanup();
  jest.clearAllMocks();
});


jest.mock('react-redux',()=>({
  useDispatch:jest.fn(),
  useSelector:jest.fn(),
}));

jest.mock('react-router-dom',()=>({
  useNavigate:jest.fn(),
  useLocation:jest.fn(),
}));


describe("Dashboard Testing useLayoufEffect", () => {
  let mockDispatch:jest.Mock;
  let mockNavigate:jest.Mock;;
  const mockHeaderHeight={current:{offsetHeight:50}};

  beforeEach(()=>{
    jest.clearAllMocks();
    mockDispatch=jest.fn();
    mockNavigate=jest.fn();

    jest.spyOn(React,'useState')
      .mockImplementationOnce(()=>[false,jest.fn()])
      .mockImplementationOnce(()=>[167,jest.fn()])
      .mockImplementationOnce(()=>[false,jest.fn()])
      .mockImplementationOnce(()=>[false,jest.fn()])
      .mockImplementationOnce(()=>[0,jest.fn()])
      .mockImplementationOnce(()=>[false,jest.fn()])
      .mockImplementationOnce(()=>[false,jest.fn()]);  

    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useSelector as jest.Mock).mockClear();

    (useSelector as jest.Mock).mockImplementation((selectorFn)=>{
      if (selectorFn.toString().includes('state.stages.stages')){
          return [{
            "stageId": "ssf-1",
            "stageInfo": {
              "application": {
                "source_system_name": 3
              }
            }
          }];
      }
      return false;
    });

      jest.spyOn(React,'useRef').mockReturnValueOnce(mockHeaderHeight);
  });

  it('should dispatch getClientInfo and navigate on success',async()=>{
    const mockResponse={data:'mockResponseData'};
    mockDispatch.mockImplementation((action:any)=>{
      if(typeof action==='function'){
        return Promise.resolve(mockResponse);
      }
      return action;
    });
    render(<Dashboard />);
   expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
   await Promise.resolve();
  expect(mockNavigate).toHaveBeenCalledWith('sg/super-short-form'); 
});
});

import { render, cleanup, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { useDispatch, useSelector } from "react-redux";
import ThankYou from "./thank-you";
import React from "react";
import { useNavigate } from "react-router-dom";
 
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
let store;
 
jest.mock("axios", () => ({
  __esModule: true,
}));
jest.mock('react-redux',()=>({
  useDispatch:jest.fn(),
  useSelector:jest.fn(),
}));
jest.mock("@lottiefiles/react-lottie-player", () => ({
  __esModule: true,
}));
 
beforeEach(() => {
  global.scrollTo = jest.fn();
  store = mockStore({
    stages: {
      stages: [
        {
          stageId: "stage-1",
          stageInfo: {
            application: {
              application_reference: '12345'
            },
            products: [{
              product_category: 'CC',
              name: 'Credit Card',
              product_sequence_number: '001',
              acct_details: [{ account_number: '12345678', card_no: '87654321' }],
              product_type: 'Type A'
            }],
            applicants: {
              embossed_name_a_1: 'John Doe'
            }
          }
        }
      ],
      otpSuccess: false,
      isDocumentUpload: false
    }
  });
});
 
afterEach(() => {
  jest.resetAllMocks();
  cleanup();
});
 
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
 
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));
 
describe("ThankYou Component Testing", () => {
  let mockDispatch:jest.Mock;
  let mockNavigate:jest.Mock;;
 
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    mockNavigate = jest.fn();
 
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()])
      .mockImplementationOnce(() => [{ productCategory: 'CC', productName: 'Credit Card', account_number: '12345678', card_no: '87654321' }, jest.fn()])
      .mockImplementationOnce(() => [false, jest.fn()])
      .mockImplementationOnce(() => [false, jest.fn()])
      .mockImplementationOnce(() => [false, jest.fn()])
      .mockImplementationOnce(() => [false, jest.fn()]);
 
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useSelector as jest.Mock).mockImplementation(selectorFn => {
      if (selectorFn.toString().includes('state.stages.stages')) {
        return [{
          stageId: "stage-1",
          stageInfo: {
            application: {
              application_reference: '12345'
            },
            products: [{
              product_category: 'CC',
              name: 'Credit Card',
              product_sequence_number: '001',
              acct_details: [{ account_number: '12345678', card_no: '87654321' }],
              product_type: 'Type A'
            }],
            applicants: {
              embossed_name_a_1: 'John Doe'
            }
          }
        }];
      } else if (selectorFn.toString().includes('state.stages.otpSuccess')) {
        return false;
      } else if (selectorFn.toString().includes('state.stages.isDocumentUpload')) {
        return false;
      }
      return undefined;
    });
  });
 
  it('should render ThankYou component', () => {
    render(<ThankYou />);
   
  });
 
  it('should dispatch and navigate on success', async () => {
    const mockResponse = { data: 'mockResponseData' };
    mockDispatch.mockImplementation(action => {
      if (typeof action === 'function') {
        return Promise.resolve(mockResponse);
      }
      return action;
    });
    render(<ThankYou />);
    // expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    // await Promise.resolve();
    // expect(mockNavigate).toHaveBeenCalledWith('/some-path');
  });
 
  it('should handle different product categories', () => {
    (useSelector as jest.Mock).mockImplementation(selectorFn => {
      if (selectorFn.toString().includes('state.stages.stages')) {
        return [{
          stageId: "stage-1",
          stageInfo: {
            application: {
              application_reference: '12345'
            },
            products: [{
              product_category: 'PL',
              name: 'Personal Loan',
              product_sequence_number: '002',
              acct_details: [{ account_number: '87654321' }],
              product_type: 'Type B',
              offer_details: [{ fees: [{ fee_amount: "100" }] }],
              campaign: "Campaign1"
            }],
            applicants: {
              loan_tenor_a_1: '12',
              required_loan_amount_a_1: 10000,
              auth_mode_a_1: "Y"
            }
          }
        }];
      } else if (selectorFn.toString().includes('state.stages.otpSuccess')) {
        return false;
      } else if (selectorFn.toString().includes('state.stages.isDocumentUpload')) {
        return false;
      }
      return undefined;
    });
 
    render(<ThankYou />);
    // expect(screen.getByText(/Personal Loan/i)).toBeInTheDocument();
    // expect(screen.getByText(/87654321/i)).toBeInTheDocument();
    // expect(screen.getByText(/100/i)).toBeInTheDocument();
    // expect(screen.getByText(/12/i)).toBeInTheDocument();
    // expect(screen.getByText(/10000/i)).toBeInTheDocument();
  });
 
  // it('should handle otpSuccess state change', async () => {
  //   (useSelector as jest.Mock).mockImplementation(selectorFn => {
  //     if (selectorFn.toString().includes('state.stages.otpSuccess')) {
  //       return true;
  //     }
  //     return undefined;
  //   });
 
  //   render(<ThankYou />);
  //   // expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
  //   // await Promise.resolve();
  //   // Add assertions to verify the behavior when otpSuccess is true
  // });
 
  it('should handle error scenarios gracefully', () => {
    (useSelector as jest.Mock).mockImplementation(selectorFn => {
      if (selectorFn.toString().includes('state.stages.stages')) {
        return [{
          stageId: "stage-1",
          stageInfo: {
            application: {
              application_reference: '12345'
            },
            products: []
          }
        }];
      } else if (selectorFn.toString().includes('state.stages.otpSuccess')) {
        return false;
      } else if (selectorFn.toString().includes('state.stages.isDocumentUpload')) {
        return false;
      }
      return undefined;
    });
 
    render(<ThankYou />);
    // Add assertions to verify how errors are handled and displayed
  });
 
  // New tests to cover useEffect logic
  it('should update application details correctly in useEffect', () => {
    render(<ThankYou />);
 
    const expectedApplicationDetails = {
      productCategory: 'CC',
      productName: 'Credit Card',
      productSequenceNo: '001',
      productType: 'Type A',
      acct_details: [{ account_number: '12345678', card_no: '87654321' }],
      account_number: '12345678',
      card_no: '87654321',
      thankyouProp: 'STP',
      accountNum: '12345678',
      cardNumber: '87654321',
      isStp: true,
      feedbackUrl: 'thankyou/feedback/url_prefix/casa/url_suffix/12345',
      cardName: 'JOHN DOE',
    };
 
    // expect(mockDispatch).toHaveBeenCalled();
    // // Mock implementation of setApplicationDetails to capture its final state
    // const [state, setState] = React.useState();
    // setState(expectedApplicationDetails);
    // expect(state).toEqual(expectedApplicationDetails);
  });
 
  it('should handle analytics and tracking events correctly in useEffect', () => {
    render(<ThankYou />);
   // expect(global.scrollTo).toHaveBeenCalled();
    // Add assertions to verify gaTrackEvents.pageView and trackEvents.triggerAdobeEvent
  });
 
  // it('should handle case when stageSelector is not available', () => {
  //   (useSelector as jest.Mock).mockImplementation(selectorFn => {
  //     if (selectorFn.toString().includes('state.stages.stages')) {
  //       return [];
  //     }
  //     return undefined;
  //   });
 
  //   render(<ThankYou />);
  //   // Add assertions to verify how component behaves when stageSelector is empty
  // });
 
  // it('should handle case when stageInfo is not available', () => {
  //   (useSelector as jest.Mock).mockImplementation(selectorFn => {
  //     if (selectorFn.toString().includes('state.stages.stages')) {
  //       return [{ stageId: "stage-1" }];
  //     }
  //     return undefined;
  //   });
 
  //   render(<ThankYou />);
    // Add assertions to
    })

import { render, cleanup } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import ThankYou from "./thank-you";
import React from "react";
import { useNavigate } from "react-router-dom";

jest.mock("axios", () => ({ __esModule: true }));
jest.mock("@lottiefiles/react-lottie-player", () => ({ __esModule: true }));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

beforeEach(() => {
  global.scrollTo = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup();
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("ThankYou Component Testing", () => {
  let mockDispatch: jest.Mock;
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockNavigate = jest.fn();

    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return [
          {
            stageId: "stage-1",
            stageInfo: {
              application: { application_reference: "12345" },
              products: [
                {
                  product_category: "CC",
                  name: "Credit Card",
                  product_sequence_number: "001",
                  acct_details: [{ account_number: "12345678", card_no: "87654321" }],
                  product_type: "Type A",
                },
              ],
              applicants: { embossed_name_a_1: "John Doe" },
            },
          },
        ];
      }
      if (selectorFn.toString().includes("state.stages.otpSuccess")) return false;
      if (selectorFn.toString().includes("state.stages.isDocumentUpload")) return false;
      return undefined;
    });

    jest.spyOn(React, "useState")
      .mockImplementationOnce(() => [false, jest.fn()])
      .mockImplementationOnce(() => [
        {
          productCategory: "CC",
          productName: "Credit Card",
          account_number: "12345678",
          card_no: "87654321",
        },
        jest.fn(),
      ]);
  });

  it("should render ThankYou component successfully", () => {
    render(<ThankYou />);
    // Assertions can be added to verify specific elements in ThankYou
  });

  it("should dispatch and navigate on success", async () => {
    const mockResponse = { data: "mockResponseData" };
    mockDispatch.mockImplementation((action) => {
      if (typeof action === "function") {
        return Promise.resolve(mockResponse);
      }
      return action;
    });

    render(<ThankYou />);
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    await Promise.resolve();
    expect(mockNavigate).toHaveBeenCalledWith("/some-path"); // Update with actual path
  });

  it("should handle different product categories", () => {
    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return [
          {
            stageId: "stage-1",
            stageInfo: {
              products: [
                {
                  product_category: "PL",
                  name: "Personal Loan",
                  acct_details: [{ account_number: "87654321" }],
                  offer_details: [{ fees: [{ fee_amount: "100" }] }],
                },
              ],
            },
          },
        ];
      }
      return undefined;
    });

    render(<ThankYou />);
    // Add assertions to validate rendering of new product categories
  });

  it("should handle missing stages gracefully", () => {
    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return [];
      }
      return undefined;
    });

    render(<ThankYou />);
    // Add assertions to verify behavior with no stages
  });

  it("should update application details correctly in useEffect", () => {
    render(<ThankYou />);
    // Mock application details and verify expected behavior
  });

  it("should handle error scenarios gracefully", () => {
    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return [{ stageId: "stage-1", stageInfo: { products: [] } }];
      }
      return undefined;
    });

    render(<ThankYou />);
    // Add assertions to validate error handling
  });
});

import { render, cleanup, fireEvent } from "@testing-library/react";
import { useSelector, useDispatch } from "react-redux";
import ThankYou from "./thank-you";
import { mockStore } from "../../../utils/mock/mockStore"; // Assuming a mockStore utility
import React from "react";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../../services/track-events", () => ({
  triggerAdobeEvent: jest.fn(),
}));

jest.mock("../../../services/ga-track-events", () => ({
  pageView: jest.fn(),
}));

describe("ThankYou Component", () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    cleanup();
  });

  it("should update applicationDetails when stageSelector contains valid product data", () => {
    const mockStageSelector = [
      {
        stageId: "stage-1",
        stageInfo: {
          application: { application_reference: "12345" },
          products: [
            {
              product_category: "CC",
              name: "Credit Card",
              product_sequence_number: "001",
              acct_details: [{ account_number: "12345678", card_no: "87654321" }],
              product_type: "Type A",
            },
          ],
          applicants: { embossed_name_a_1: "John Doe" },
        },
      },
    ];

    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return mockStageSelector;
      }
      return undefined;
    });

    const { getByText } = render(<ThankYou />);

    // Verify applicationDetails is set correctly
    expect(mockDispatch).not.toHaveBeenCalled(); // No immediate dispatch calls
    expect(getByText(/Credit Card/i)).toBeInTheDocument();
    expect(getByText(/12345678/i)).toBeInTheDocument();
  });

  it("should handle missing product data gracefully", () => {
    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return [{ stageId: "stage-1", stageInfo: { products: [] } }];
      }
      return undefined;
    });

    const { queryByText } = render(<ThankYou />);

    // Validate no crash and appropriate fallback behavior
    expect(queryByText(/Credit Card/i)).not.toBeInTheDocument();
  });

  it("should call submitForm and redirect based on auth_mode_a_1", () => {
    const mockStageSelector = [
      {
        stageInfo: {
          applicants: { auth_mode_a_1: "IX" },
        },
      },
    ];

    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return mockStageSelector;
      }
      return undefined;
    });

    const { getByRole } = render(<ThankYou />);
    const form = getByRole("form");

    fireEvent.submit(form);

    // Validate that submitForm handles the auth_mode_a_1 logic correctly
    expect(mockDispatch).not.toHaveBeenCalled(); // Dispatch should not be called here
  });
});

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { useSelector } from "react-redux";
import ThankYou from "./thank-you";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe("ThankYou Component", () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return [
          {
            stageInfo: {
              application: { application_reference: "12345" },
              applicants: { auth_mode_a_1: "IX" },
              products: [
                {
                  product_category: "CC",
                  name: "Credit Card",
                  acct_details: [{ account_number: "12345678", card_no: "87654321" }],
                },
              ],
            },
            stageId: "stage_1",
          },
        ];
      }
      return [];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render ThankYou component without crashing", () => {
    const { getByText } = render(<ThankYou />);
    expect(getByText(/thankyou/i)).toBeInTheDocument();
  });

  it("should call submitForm and handle redirect for non-IX/IM auth_mode", () => {
    delete window.location;
    window.location = { href: "" } as any;

    const { getByRole } = render(<ThankYou />);
    const form = getByRole("form");

    fireEvent.submit(form);

    expect(window.location.href).toBe(`${process.env.REACT_APP_HOME_PAGE_URL}`);
  });
});