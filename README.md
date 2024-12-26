import "./review-page.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import reviewpageData from "../../../assets/_json/review.json";
import { authenticateType } from "../../../utils/common/change.utils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  dispatchLoader,
  getProductCategory,
} from "../../../services/common-service";
import Checkbox from "../../../shared/components/checkbox/checkbox";
import TooltipModel from "../../../shared/components/model/tooltip-model";

const ReviewPage = (props: KeyWithAnyModel) => {
  const dispatch = useDispatch();
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const reviewdata: KeyWithAnyModel = reviewpageData;
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isHideTooltipIcon, setIsHideTooltipIcon] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const rpAuthInfo =
    authenticateType() === "myinfo" ? reviewdata.myinfo : reviewdata.manual;
  const [productDetails, setProductDetails] = useState({
    productName: "",
  });
  const [filterLinkList, setFilterLinkList] = useState([]);
  const [productCategory, setProductCategory] = useState("");
  useEffect(() => {
    dispatch(dispatchLoader(false));
    setProductDetails((prevValue) => {
      if (
        stageSelector &&
        stageSelector[0].stageInfo &&
        stageSelector[0].stageInfo.products.length >= 1
      ) {
        prevValue.productName = stageSelector[0].stageInfo.products[0].name;
      }
      return { ...prevValue };
    });

    const productCtg = getProductCategory(stageSelector[0].stageInfo.products);
    setProductCategory(productCtg);
    const checkProductCategory =
      productCtg === "CA" || productCtg === "SA" ? true : false;
    setIsHideTooltipIcon(checkProductCategory);
    if (checkProductCategory === true) {
      setIsChecked(true);
    }

    let reviewLinks =
      productCtg === "PL" ? reviewdata.PLLinks : reviewdata.CCPLReviewContent;
    const fliteredLink: any = Object.entries(reviewLinks.contentLink).filter(
      (link: KeyWithAnyModel) => {
        return link;
      }
    );
    setFilterLinkList(fliteredLink);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (isHideTooltipIcon) {
      props.updateCheckboxStatus(true);
    } else {
      props.updateCheckboxStatus(isChecked);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecked]);

  return (
    <>
      {/*CASA begins */}
      {productDetails && isHideTooltipIcon === true && (
        <div className="field__group">
          <div className="review__content">
            <label className="review__content--header">
              <p>{reviewdata.confirm.reviewPageHeader1}</p>
            </label>
            {rpAuthInfo.header && <label>{rpAuthInfo.header}</label>}
            {rpAuthInfo.reviewDesc_1 && (
              <div className="review__content--body">
                <p>
                  {rpAuthInfo.reviewDesc_1} {productDetails.productName}{" "}
                  {rpAuthInfo.reviewDesc_2}
                </p>
              </div>
            )}
            {rpAuthInfo.reviewMyInfoDesc_1 && (
              <div className="review__content--body">
                {rpAuthInfo.reviewMyInfoDesc_1 && (
                  <p>{rpAuthInfo.reviewMyInfoDesc_1}</p>
                )}
                {rpAuthInfo.reviewMyInfoDesc_1 && (
                  <ol type="a">
                    <li>{rpAuthInfo.reviewMyInfoDesc_2}</li>
                    <li>{rpAuthInfo.reviewMyInfoDesc_3}</li>
                    <li>{rpAuthInfo.reviewMyInfoDesc_4}</li>
                  </ol>
                )}
                {rpAuthInfo.reviewMyInfoDesc_5 && (
                  <p>
                    {rpAuthInfo.reviewMyInfoDesc_5} {productDetails.productName}{" "}
                    {rpAuthInfo.reviewMyInfoDesc_6}
                  </p>
                )}
              </div>
            )}
            <label>{reviewdata.confirm.reviewDesc}</label>
            <div className="review__content--body">
              <p>{reviewdata.confirm.reviewDesc_1}</p>
              <ol>
                <li>{reviewdata.confirm.reviewDesc_2}</li>
                <li>{reviewdata.confirm.reviewDesc_3}</li>
                <li>{reviewdata.confirm.reviewDesc_4}</li>
              </ol>
              <p>{reviewdata.confirm.reviewDesc_5}</p>
              <p>{reviewdata.confirm.reviewDesc_6}</p>
              <p>{reviewdata.confirm.reviewDesc_7}</p>
            </div>
          </div>
        </div>
      )}
      {/*CASA ends */}
      {/*CCPL begins */}
      {isHideTooltipIcon === false && (
        <>
          <div className="review__ccpl__content">
            <div className="review__title">
              <div className="review__title__label">
              <p>{reviewdata.CCPL.reviewTitle1}</p>
            </div>            
            <div className="tool-tip__icon">
              <div
                className="tool-tip"
                onClick={(event) =>
                  setIsTooltipOpen(isTooltipOpen ? false : true)
                }
              ></div>
            </div>             
            </div>
            {productCategory === "PL" && (
              <>
                <div className="review__top__content">
                  <div>{reviewdata.PLLinks.contentStart}</div>
                  {filterLinkList.map((links: KeyWithAnyModel) => {
                    return (
                      <>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={links[1].path}
                        >
                          {links[1].name},
                        </a>
                      </>
                    );
                  })}
                  {reviewdata.CCPLReviewContent.contentLinkDescp}
                </div>
                <div className="review__top__content">
                  {reviewdata.PL.reviewContent1}
                </div>
              </>
            )}
          </div>
          <div className="review__checkbox">
          <Checkbox
              reviewHeader={reviewdata.CCPL.reviewHeader}
              reviewDescp1={reviewdata.CCPL.reviewDescp1}
              reviewDescpoint1={reviewdata.CCPL.reviewDescpoint1}
              reviewDescpoint2={reviewdata.CCPL.reviewDescpoint2}
              reviewDescp2={reviewdata.CCPL.reviewDescp2}
              reviewDescp3={reviewdata.CCPL.reviewDescp3}
              reviewDescp4={reviewdata.CCPL.reviewDescp4}
              checkedStatus={isChecked}
              setCheckedStatus={setIsChecked}
            />                        
          </div>
          {productCategory === "CC" && (
            <div className="review__ccpl__content">
              <div className="review__content--header">
                <label>{reviewdata.CCPLReviewContent.contentHeading}</label>
              </div>
              <div>
                {reviewdata.CCPLReviewContent.contentStart}
                {filterLinkList.map((links: KeyWithAnyModel) => {
                  return (
                    <>
                      <a target="_blank" rel="noreferrer" href={links[1].path}>
                        {links[1].name},
                      </a>
                    </>
                  );
                })}
                {reviewdata.CCPLReviewContent.contentLinkDescp},
                {reviewdata.CCPLReviewContent.contentEnd}
              </div>
            </div>
          )}
        </>
      )}
      {/*CCPL ends */}
      {isTooltipOpen && (
        <TooltipModel
          isTooltipOpen={isTooltipOpen}
          data="review"
          setIsTooltipOpen={setIsTooltipOpen}
          productCategory={productCategory}
        />
      )}
    </>
  );
};

export default ReviewPage;

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import ReviewPage from "./review-page";

// Mock data and dependencies
jest.mock("../../../utils/common/change.utils", () => ({
  authenticateType: jest.fn(() => "manual"),
}));

jest.mock("../../../services/common-service", () => ({
  dispatchLoader: jest.fn(),
  getProductCategory: jest.fn(() => "CA"),
}));

jest.mock("../../../shared/components/checkbox/checkbox", () => (props: any) => (
  <div>
    <div>Checkbox Mock</div>
    <input
      type="checkbox"
      checked={props.checkedStatus}
      onChange={() => props.setCheckedStatus(!props.checkedStatus)}
    />
  </div>
));

jest.mock("../../../shared/components/model/tooltip-model", () => (props: any) => (
  <div>
    <div>TooltipModel Mock</div>
    <button onClick={() => props.setIsTooltipOpen(false)}>Close Tooltip</button>
  </div>
));

jest.mock("../../../assets/_json/review.json", () => ({
  confirm: {
    reviewPageHeader1: "Review Page Header",
    reviewDesc: "Confirm Description",
    reviewDesc_1: "Confirm Description 1",
    reviewDesc_2: "Confirm Description 2",
    reviewDesc_3: "Confirm Description 3",
    reviewDesc_4: "Confirm Description 4",
    reviewDesc_5: "Confirm Description 5",
    reviewDesc_6: "Confirm Description 6",
    reviewDesc_7: "Confirm Description 7",
  },
  manual: {
    header: "Manual Header",
    reviewDesc_1: "Manual Description 1",
    reviewMyInfoDesc_1: "MyInfo Description 1",
    reviewMyInfoDesc_2: "MyInfo Description 2",
    reviewMyInfoDesc_3: "MyInfo Description 3",
    reviewMyInfoDesc_4: "MyInfo Description 4",
    reviewMyInfoDesc_5: "MyInfo Description 5",
    reviewMyInfoDesc_6: "MyInfo Description 6",
  },
  PLLinks: {
    contentStart: "PL Content Start",
    contentLink: {
      link1: { path: "http://example.com", name: "Example Link" },
    },
  },
  CCPLReviewContent: {
    contentLinkDescp: "Content Link Description",
    contentHeading: "Content Heading",
    contentStart: "Content Start",
    contentEnd: "Content End",
  },
  CCPL: {
    reviewTitle1: "Review Title",
    reviewHeader: "Review Header",
    reviewDescp1: "Review Description 1",
    reviewDescpoint1: "Description Point 1",
    reviewDescpoint2: "Description Point 2",
    reviewDescp2: "Review Description 2",
    reviewDescp3: "Review Description 3",
    reviewDescp4: "Review Description 4",
  },
}));

describe("ReviewPage Component", () => {
  const mockStore = configureStore([thunk]);
  let store;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageInfo: {
              products: [{ name: "Product Name", product_type: "601" }],
            },
          },
        ],
        userInput: { applicants: {} },
      },
    });
  });

  it("renders the ReviewPage component correctly for CASA", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("Review Page Header")).toBeInTheDocument();
    expect(screen.getByText("Manual Header")).toBeInTheDocument();
    expect(screen.getByText("Confirm Description")).toBeInTheDocument();
  });

  it("renders the ReviewPage component correctly for PL", () => {
    jest.mock("../../../services/common-service", () => ({
      getProductCategory: jest.fn(() => "PL"),
    }));

    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("PL Content Start")).toBeInTheDocument();
    expect(screen.getByText("Example Link")).toBeInTheDocument();
  });

  it("renders tooltip when clicked on tooltip icon", () => {
    jest.mock("../../../services/common-service", () => ({
      getProductCategory: jest.fn(() => "CC"),
    }));

    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    fireEvent.click(screen.getByText("TooltipModel Mock"));
    expect(screen.getByText("TooltipModel Mock")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Tooltip"));
    expect(screen.queryByText("TooltipModel Mock")).not.toBeInTheDocument();
  });

  it("checkbox toggles correctly", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import ReviewPage from "./review-page";
import reviewpageData from "../../../assets/_json/review.json";
import { dispatchLoader, getProductCategory } from "../../../services/common-service";

// Mock Redux hooks and external modules
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../../services/common-service", () => ({
  dispatchLoader: jest.fn(),
  getProductCategory: jest.fn(),
}));

jest.mock("../../../shared/components/checkbox/checkbox", () => jest.fn((props) => (
  <div data-testid="checkbox" onClick={() => props.setCheckedStatus(!props.checkedStatus)}>
    Checkbox
  </div>
)));

describe("ReviewPage Component", () => {
  let mockDispatch: jest.Mock;
  const mockStageSelector = [
    {
      stageInfo: {
        products: [
          {
            name: "Test Product",
          },
        ],
      },
    },
  ];

  beforeEach(() => {
    // Reset mocks
    mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockReturnValue(mockStageSelector);
    (getProductCategory as jest.Mock).mockReturnValue("CC");

    jest.clearAllMocks();
  });

  it("should render ReviewPage with CCPL content", () => {
    render(<ReviewPage />);

    // Check CCPL content is rendered
    expect(screen.getByText(reviewpageData.CCPL.reviewTitle1)).toBeInTheDocument();
    

    // Verify loader dispatch
    expect(dispatchLoader).toHaveBeenCalledWith(false);
  });

  

  it("should set product details and product category on mount", () => {
    render(<ReviewPage />);

   expect(getProductCategory).toHaveBeenCalledWith(mockStageSelector[0].stageInfo.products);
                          
    expect(screen.getByText(reviewpageData.CCPL.reviewTitle1)).toBeInTheDocument();
  });

 
it("should filter and render dynamic links for CCPL content", () => {
    render(<ReviewPage />);
    const links = reviewpageData.CCPLReviewContent.contentLink;
    Object.entries(links).forEach(([key, value]) => {
      expect(screen.getByText(/Customer Terms/)).toBeInTheDocument();
    });
  });
it("should handle dispatch call when component mounts", () => {
    render(<ReviewPage />);

    // Verify dispatch call for loader
    expect(mockDispatch).toHaveBeenCalledWith(undefined);
  });

 });

 import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import ReviewPage from "./review-page";

// Mock data and dependencies
jest.mock("../../../utils/common/change.utils", () => ({
  authenticateType: jest.fn(() => "manual"),
}));

jest.mock("../../../services/common-service", () => ({
  dispatchLoader: jest.fn(),
  getProductCategory: jest.fn(() => "CA"),
}));

jest.mock("../../../shared/components/checkbox/checkbox", () => (props: any) => (
  <div>
    <div>Checkbox Mock</div>
    <input
      type="checkbox"
      checked={props.checkedStatus}
      onChange={() => props.setCheckedStatus(!props.checkedStatus)}
    />
  </div>
));

jest.mock("../../../shared/components/model/tooltip-model", () => (props: any) => (
  <div>
    <div>TooltipModel Mock</div>
    <button onClick={() => props.setIsTooltipOpen(false)}>Close Tooltip</button>
  </div>
));

jest.mock("../../../assets/_json/review.json", () => ({
  confirm: {
    reviewPageHeader1: "Review Page Header",
    reviewDesc: "Confirm Description",
    reviewDesc_1: "Confirm Description 1",
    reviewDesc_2: "Confirm Description 2",
    reviewDesc_3: "Confirm Description 3",
    reviewDesc_4: "Confirm Description 4",
    reviewDesc_5: "Confirm Description 5",
    reviewDesc_6: "Confirm Description 6",
    reviewDesc_7: "Confirm Description 7",
  },
  manual: {
    header: "Manual Header",
    reviewDesc_1: "Manual Description 1",
    reviewMyInfoDesc_1: "MyInfo Description 1",
    reviewMyInfoDesc_2: "MyInfo Description 2",
    reviewMyInfoDesc_3: "MyInfo Description 3",
    reviewMyInfoDesc_4: "MyInfo Description 4",
    reviewMyInfoDesc_5: "MyInfo Description 5",
    reviewMyInfoDesc_6: "MyInfo Description 6",
  },
  PLLinks: {
    contentStart: "PL Content Start",
    contentLink: {
      link1: { path: "http://example.com", name: "Example Link" },
    },
  },
  CCPLReviewContent: {
    contentLinkDescp: "Content Link Description",
    contentHeading: "Content Heading",
    contentStart: "Content Start",
    contentEnd: "Content End",
  },
  CCPL: {
    reviewTitle1: "Review Title",
    reviewHeader: "Review Header",
    reviewDescp1: "Review Description 1",
    reviewDescpoint1: "Description Point 1",
    reviewDescpoint2: "Description Point 2",
    reviewDescp2: "Review Description 2",
    reviewDescp3: "Review Description 3",
    reviewDescp4: "Review Description 4",
  },
}));

describe("ReviewPage Component", () => {
  const mockStore = configureStore([thunk]);
  let store;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageInfo: {
              products: [{ name: "Product Name", product_type: "601" }],
            },
          },
        ],
        userInput: { applicants: {} },
      },
    });
  });

  it("renders the ReviewPage component correctly for CASA", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("Review Page Header")).toBeInTheDocument();
    expect(screen.getByText("Manual Header")).toBeInTheDocument();
    expect(screen.getByText("Confirm Description")).toBeInTheDocument();
    expect(screen.getByText("Confirm Description 1")).toBeInTheDocument();
    expect(screen.getByText("Confirm Description 7")).toBeInTheDocument();
  });

  it("renders the ReviewPage component correctly for PL", () => {
    jest.spyOn(require("../../../services/common-service"), "getProductCategory").mockReturnValue("PL");

    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("PL Content Start")).toBeInTheDocument();
    expect(screen.getByText("Example Link")).toBeInTheDocument();
  });

  it("renders tooltip when clicked on tooltip icon", () => {
    jest.spyOn(require("../../../services/common-service"), "getProductCategory").mockReturnValue("CC");

    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("TooltipModel Mock")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Tooltip"));
    expect(screen.queryByText("TooltipModel Mock")).not.toBeInTheDocument();
  });

  it("checkbox toggles correctly", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("calls updateCheckboxStatus correctly based on isChecked and isHideTooltipIcon", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(updateCheckboxStatus).toHaveBeenCalledWith(true);
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import ReviewPage from "./review-page";

// Mock dependencies
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

jest.mock("../../../utils/common/change.utils", () => ({
  authenticateType: jest.fn(() => "manual"),
}));

jest.mock("../../../services/common-service", () => ({
  dispatchLoader: jest.fn(),
  getProductCategory: jest.fn(() => "CA"),
}));

jest.mock("../../../shared/components/checkbox/checkbox", () => (props: any) => (
  <div>
    <div>Checkbox Mock</div>
    <input
      type="checkbox"
      checked={props.checkedStatus}
      onChange={() => props.setCheckedStatus(!props.checkedStatus)}
    />
  </div>
));

jest.mock("../../../shared/components/model/tooltip-model", () => (props: any) => (
  <div>
    <div>TooltipModel Mock</div>
    <button onClick={() => props.setIsTooltipOpen(false)}>Close Tooltip</button>
  </div>
));

jest.mock("../../../assets/_json/review.json", () => ({
  confirm: {
    reviewPageHeader1: "Review Page Header",
    reviewDesc: "Confirm Description",
    reviewDesc_1: "Confirm Description 1",
    reviewDesc_2: "Confirm Description 2",
    reviewDesc_3: "Confirm Description 3",
    reviewDesc_4: "Confirm Description 4",
    reviewDesc_5: "Confirm Description 5",
    reviewDesc_6: "Confirm Description 6",
    reviewDesc_7: "Confirm Description 7",
  },
  manual: {
    header: "Manual Header",
    reviewDesc_1: "Manual Description 1",
    reviewMyInfoDesc_1: "MyInfo Description 1",
    reviewMyInfoDesc_2: "MyInfo Description 2",
    reviewMyInfoDesc_3: "MyInfo Description 3",
    reviewMyInfoDesc_4: "MyInfo Description 4",
    reviewMyInfoDesc_5: "MyInfo Description 5",
    reviewMyInfoDesc_6: "MyInfo Description 6",
  },
  PLLinks: {
    contentStart: "PL Content Start",
    contentLink: {
      link1: { path: "http://example.com", name: "Example Link" },
    },
  },
  CCPLReviewContent: {
    contentLinkDescp: "Content Link Description",
    contentHeading: "Content Heading",
    contentStart: "Content Start",
    contentEnd: "Content End",
  },
  CCPL: {
    reviewTitle1: "Review Title",
    reviewHeader: "Review Header",
    reviewDescp1: "Review Description 1",
    reviewDescpoint1: "Description Point 1",
    reviewDescpoint2: "Description Point 2",
    reviewDescp2: "Review Description 2",
    reviewDescp3: "Review Description 3",
    reviewDescp4: "Review Description 4",
  },
}));

describe("ReviewPage Component", () => {
  const mockStore = configureStore([thunk]);
  let store;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageInfo: {
              products: [{ name: "Product Name", product_type: "601" }],
            },
          },
        ],
        userInput: { applicants: {} },
      },
    });

    // Mock `useSelector` implementation
    jest.requireMock("react-redux").useSelector.mockImplementation((callback) =>
      callback({
        stages: {
          stages: [
            {
              stageInfo: {
                products: [{ name: "Product Name", product_type: "601" }],
              },
            },
          ],
          userInput: { applicants: {} },
        },
      })
    );
  });

  it("renders the ReviewPage component correctly for CASA", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("Review Page Header")).toBeInTheDocument();
    expect(screen.getByText("Manual Header")).toBeInTheDocument();
    expect(screen.getByText("Confirm Description")).toBeInTheDocument();
  });

  it("renders the ReviewPage component correctly for PL", () => {
    jest.requireMock("../../../services/common-service").getProductCategory.mockReturnValue("PL");

    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("PL Content Start")).toBeInTheDocument();
    expect(screen.getByText("Example Link")).toBeInTheDocument();
  });

  it("renders tooltip when clicked on tooltip icon", () => {
    jest.requireMock("../../../services/common-service").getProductCategory.mockReturnValue("CC");

    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(screen.getByText("TooltipModel Mock")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Tooltip"));
    expect(screen.queryByText("TooltipModel Mock")).not.toBeInTheDocument();
  });

  it("checkbox toggles correctly", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("calls updateCheckboxStatus correctly based on isChecked and isHideTooltipIcon", () => {
    const updateCheckboxStatus = jest.fn();

    render(
      <Provider store={store}>
        <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      </Provider>
    );

    expect(updateCheckboxStatus).toHaveBeenCalledWith(true);
  });
});


    Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

      170 |     const updateCheckboxStatus = jest.fn();
      171 |
    > 172 |     render(
          |           ^
      173 |       <Provider store={store}>
      174 |         <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
      175 |       </Provider>

      TypeError: Cannot convert undefined or null to object
        at Function.entries (<anonymous>)

      50 |     let reviewLinks =
      51 |       productCtg === "PL" ? reviewdata.PLLinks : reviewdata.CCPLReviewContent;
    > 52 |     const fliteredLink: any = Object.entries(reviewLinks.contentLink).filter(
         |                                      ^
      53 |       (link: KeyWithAnyModel) => {
      54 |         return link;
      55 |       }

       TypeError: props.updateCheckboxStatus is not a function

      65 |     }
      66 |     else {
    > 67 |       props.updateCheckboxStatus(isChecked);
         |             ^
      68 |     }
      69 |
      70 |     // eslint-disable-next-line react-hooks/exhaustive-deps


 ● ReviewPage Component › renders the ReviewPage component correctly for PL

    TypeError: Cannot read properties of undefined (reading 'reviewContent1')

      162 |                 </div>
      163 |                 <div className="review__top__content">
    > 164 |                   {reviewdata.PL.reviewContent1}
          |                                  ^
      165 |                 </div>
      166 |               </>
      167 |             )}
