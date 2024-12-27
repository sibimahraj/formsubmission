import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import "./alias.scss";
import { getFields } from "./alias.utils";
import renderComponent from "../../../modules/dashboard/fields/renderer";
import { constant } from './constant';

export const Alias = (props: KeyWithAnyModel) => {

  const stageSelector = useSelector(
    (state: StoreModel) => state.stages.stages
  );

  const journeyType = useSelector((state: StoreModel) => state.stages.journeyType);

  const aliasSelector = useSelector(
    (state: StoreModel) => state.alias
  );

  const dispatch = useDispatch();
  const [field, setField] = useState([]);
  const addNewAliasName = () => {
    const stageComponents = dispatch(
        getFields(stageSelector, aliasSelector, "add")
    );
    setField(stageComponents);
  };

  useEffect(() => {
    if (stageSelector) {
      const stageComponents = dispatch(
        getFields(stageSelector, aliasSelector, "get")
      );
      setField(stageComponents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aliasSelector]);

    return (
        <>
         {field &&
          field.map((currentSection: KeyWithAnyModel, index: number) => {
            return renderComponent(
              currentSection,
              index,
              props.handleCallback,
              props.handleFieldDispatch,
              props.value
            );
          })}
          { !journeyType && <div className="alias__buttton">
          <div className="alias__plus">
            <input
              type={constant.type}
              name={constant.name}
              aria-label={constant.ariaLabel}
              id={constant.id}
              placeholder={constant.placeholder}
              value={constant.value}
              className ={(aliasSelector && aliasSelector.count < aliasSelector.maxCount) ? 'show-btn, button' : 'hide-btn'}
              onClick={() => addNewAliasName()}
            />
            </div>
          </div>}
        </>
    )
}

export default Alias;

import { render, screen, fireEvent } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import Alias from './alias';
import { getFields } from './alias.utils';
import { constant } from './constant';
import React from 'react';

jest.autoMockOff();
jest.mock("axios", () => ({
  __esModule: true,
}));
jest.mock("@lottiefiles/react-lottie-player", () => ({
  __esModule: true,
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('./alias.utils', () => ({
  getFields: jest.fn(),
}));


describe('Alias Component', () => {
  const mockDispatch = jest.fn(()=>{
    return [
      {
        stageId: "ssf-1",
        stageInfo: {
          fieldmetadata: {
            data: {
              stages: {
                "bd-2": {
                  fields: [
                    {
                      logical_field_name: "alias",
                      component_type: "Text",
                      rwb_label_name: "Alias",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ]
  });
  const mockGetFields = jest.fn();
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(()=>{});
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    jest.spyOn(React,'useState')
      .mockImplementationOnce(()=>[[{
        "logical_field_name": "alias_1",
        "lov_field_name": "Alias",
        "rwb_label_name": "Alias (s) 1",
        "field_set": "Yes",
        "field_set_name": "Personal Details",
        "component_type": "Text",
        "mandatory": "Conditional",
        "length": "105",
        "type": "Text",
        "regex": "^[a-zA-Z-@&().,'/]+(?: [a-zA-Z-@&().,'/]+)*$",
        "hide_remove_btn": true
    }],jest.fn()]);

      
    (getFields as jest.Mock).mockImplementation(mockGetFields);
  });

  it('should call getFields on initial render with "get" action', () => {
    (useSelector as jest.Mock).mockImplementation((selectorFn)=>{
      if (selectorFn.toString().includes('state.stages.stages')){
          return [{
            "stageId": "bd-2",
            "stageInfo": {
              "application": {
                "source_system_name": 3
              }
            }
          }];
      }
      if (selectorFn.toString().includes('state.alias')){
        return {
          count: 1,
          fields: ['alias_1'],
          maxCount: 4
        };
    }
    if (selectorFn.toString().includes('state.stages.journeyType')){
      return true
  }
      return null;
    });
    render(<Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value={{
      "marital_status": null,
      "education_level": "",
      "country": "",
      "ownership_status": "",
      "gender": "",
      "country_of_birth": ""
  }} />);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockGetFields).toHaveBeenCalled();
  });

  it('hide button should render', () => {
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    jest.spyOn(React,'useState')
      .mockImplementationOnce(()=>[[],jest.fn()]);

    (useSelector as jest.Mock).mockImplementation((selectorFn)=>{
      if (selectorFn.toString().includes('state.stages.stages')){
          return [{
            "stageId": "bd-2",
            "stageInfo": {
              "application": {
                "source_system_name": 3
              }
            }
          }];
      }
      if (selectorFn.toString().includes('state.alias')){
        return {
        };
    }
    if (selectorFn.toString().includes('state.stages.journeyType')){
      return true
  }
      return null;
    });
    render(<Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value={{
      "marital_status": null,
      "education_level": "",
      "country": "",
      "ownership_status": "",
      "gender": "",
      "country_of_birth": ""
  }} />);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockGetFields).toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import Alias from "./alias";
import { getFields } from "./alias.utils";
import React from "react";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("./alias.utils", () => ({
  getFields: jest.fn(),
}));

describe("Alias Component", () => {
  const mockDispatch = jest.fn();
  const mockGetFields = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    jest.spyOn(React, "useState").mockImplementationOnce(() => [[], jest.fn()]);
    (getFields as jest.Mock).mockImplementation(mockGetFields);
  });

  const mockSelectors = (alias, stages, journeyType = true) => {
    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return stages;
      }
      if (selectorFn.toString().includes("state.alias")) {
        return alias;
      }
      if (selectorFn.toString().includes("state.stages.journeyType")) {
        return journeyType;
      }
      return null;
    });
  };

  it("should call getFields on initial render with 'get' action", () => {
    mockSelectors(
      {
        count: 1,
        fields: ["alias_1"],
        maxCount: 4,
      },
      [{ stageId: "bd-2", stageInfo: { application: { source_system_name: 3 } } }]
    );

    render(
      <Alias
        handleCallback={jest.fn()}
        handleFieldDispatch={jest.fn()}
        value={{}}
      />
    );

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockGetFields).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "get"
    );
  });

  it("should render fields returned by getFields", () => {
    mockSelectors(
      {
        count: 1,
        fields: ["alias_1"],
        maxCount: 4,
      },
      [{ stageId: "bd-2", stageInfo: { application: { source_system_name: 3 } } }]
    );

    jest.spyOn(React, "useState").mockImplementationOnce(() => [
      [
        {
          logical_field_name: "alias_1",
          component_type: "Text",
          rwb_label_name: "Alias Label",
        },
      ],
      jest.fn(),
    ]);

    render(
      <Alias
        handleCallback={jest.fn()}
        handleFieldDispatch={jest.fn()}
        value={{}}
      />
    );

    expect(screen.getByText("Alias Label")).toBeInTheDocument();
  });

  it("should handle button click and call getFields with 'add' action", () => {
    mockSelectors(
      {
        count: 1,
        fields: ["alias_1"],
        maxCount: 4,
      },
      [{ stageId: "bd-2", stageInfo: { application: { source_system_name: 3 } } }]
    );

    render(
      <Alias
        handleCallback={jest.fn()}
        handleFieldDispatch={jest.fn()}
        value={{}}
      />
    );

    const addButton = screen.getByPlaceholderText("Enter alias");
    fireEvent.click(addButton);

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockGetFields).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "add"
    );
  });

  it("should render hide button when count exceeds maxCount", () => {
    mockSelectors(
      {
        count: 5,
        fields: ["alias_1"],
        maxCount: 4,
      },
      [{ stageId: "bd-2", stageInfo: { application: { source_system_name: 3 } } }]
    );

    render(
      <Alias
        handleCallback={jest.fn()}
        handleFieldDispatch={jest.fn()}
        value={{}}
      />
    );

    expect(screen.getByPlaceholderText("Enter alias")).toHaveClass("hide-btn");
  });

  it("should not render button when journeyType is true", () => {
    mockSelectors(
      {
        count: 1,
        fields: ["alias_1"],
        maxCount: 4,
      },
      [{ stageId: "bd-2", stageInfo: { application: { source_system_name: 3 } } }],
      true
    );

    render(
      <Alias
        handleCallback={jest.fn()}
        handleFieldDispatch={jest.fn()}
        value={{}}
      />
    );

    expect(screen.queryByPlaceholderText("Enter alias")).toBeNull();
  });

  it("should render button when journeyType is false", () => {
    mockSelectors(
      {
        count: 1,
        fields: ["alias_1"],
        maxCount: 4,
      },
      [{ stageId: "bd-2", stageInfo: { application: { source_system_name: 3 } } }],
      false
    );

    render(
      <Alias
        handleCallback={jest.fn()}
        handleFieldDispatch={jest.fn()}
        value={{}}
      />
    );

    expect(screen.getByPlaceholderText("Enter alias")).toBeInTheDocument();
  });
});
