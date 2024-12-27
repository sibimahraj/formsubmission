import "./thank-you.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import ThankYouTimeline from "./thankyou-timeline";
import ThankYouBanner from "./thankyou-banner";
import { lazy, useEffect, useState } from "react";
import { getUrl } from "../../../utils/common/change.utils";
import { useSelector } from "react-redux";
import { store } from "../../../utils/store/store";
import ThankYouSurvey from "./thankyou-survey";
const CasaBanner = lazy(
  () => import("../../../shared/components/casa-banner/casa-banner")
);
const ThankYouCASA = (props: KeyWithAnyModel) => {
  const applicationDetails = props.applicationDetails;
  const thankyou = props.thankyou;
  const [isFunding, setIsFunding] = useState(false);
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const getTimelineData = () => {
    return [
      {
        header: thankyou[applicationDetails.thankyouProp].timeline_header,
        content: thankyou[applicationDetails.thankyouProp].timeline_desc,
        completed_status: true,
      },
      {
        header: thankyou[applicationDetails.thankyouText].timeline_header,
        content: thankyou[applicationDetails.thankyouText].timeline_desc,
        completed_status: true,
      },
    ];
  };

  useEffect(() => {
    if(getUrl.getParameterByName("auth") != "upload" && !store.getState().stages.isDocumentUpload){
    const auth = getUrl.getParameterByName("auth");
    const isMyInfoVirtual = getUrl.getParameterByName("isMyInfoVirtual");
    const prodCategory =
      stageSelector[0].stageInfo.products[0].product_category;
    setIsFunding(
      stageSelector[0].stageInfo.application.source_system_name === "3" &&
        (auth === "myinfo" || isMyInfoVirtual === "true") &&
        (prodCategory === "CA" || prodCategory === "SA")
        ? true
        : false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, []);

  return (
    <>
      {!applicationDetails.isStp && (
        <ThankYouBanner
          banner_header={
            thankyou[applicationDetails.thankyouProp].banner_header
          }
          banner_content={true}
          banner_body_1={
            thankyou[applicationDetails.thankyouProp].banner_body_1
          }
          productName={applicationDetails.productName}
          banner_body_2={
            thankyou[applicationDetails.thankyouProp].banner_body_2
          }
          resumeUrl={thankyou[applicationDetails.thankyouProp].resumeUrl}
        />
      )}
      {applicationDetails.isStp && (
        <ThankYouBanner
          banner_header={thankyou.STP.banner_header}
          banner_content={true}
          banner_body_1={thankyou.STP.banner_body_1}
          productName={applicationDetails.productName}
          banner_body_2={thankyou.STP.banner_body_2}
        />
      )}
      <div className="thankyou__body__outer">
        <div className="thankyou__body">
          {isFunding && applicationDetails.isStp && <CasaBanner />}
          <div className="body__app-details">
            <label>
              {thankyou[applicationDetails.thankyouText].applicationNumber}
            </label>
            <div className="app-details__ref-no">
              {props.applicationReferenceNo!}
            </div>
          </div>
          {applicationDetails.isStp && (
            <div className="body__accn-no">
              <label>
                {thankyou[applicationDetails.thankyouProp].accountNumber}{" "}
                {applicationDetails.accountNum}
              </label>
            </div>
          )}
          <ThankYouTimeline
            title={thankyou[applicationDetails.thankyouText].timeLine}
            data={getTimelineData()}
            checkCompletedStatus={false}
          />
        </div>
        <ThankYouSurvey/>
      </div>
      <div className="body__refno">
        <button
          onClick={(e) => props.submitForm(e)}
          className="thankyou__continue"
        >
          {thankyou[applicationDetails.thankyouText].nextButton}
        </button>
      </div>
    </>
  );
};

export default ThankYouCASA;


import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { useSelector } from "react-redux";
import ThankYouCASA from "./thank-you-casa";

jest.mock("../../../shared/components/casa-banner/casa-banner", () => () => (
  <div>Mocked CasaBanner</div>
));

jest.mock("../../../utils/common/change.utils", () => ({
  getUrl: {
    getParameterByName: jest.fn((param: string) =>
      param === "auth" ? "myinfo" : param === "isMyInfoVirtual" ? "true" : null
    ),
  },
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../../../services/validation-service", () => ({
  formateCurrency: jest.fn((value) => value),
}));

describe("ThankYouCASA Component", () => {
  const mockStore = configureStore([]);
  let store: any;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageInfo: {
              application: { source_system_name: "3" },
              products: [{ product_category: "CA" }],
            },
          },
        ],
        isDocumentUpload: false,
      },
    });
    (useSelector as jest.Mock).mockImplementation((callback) =>
      callback(store.getState())
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockProps = {
    applicationDetails: {
      isStp: false,
      productName: "Savings Account",
      thankyouProp: "thankYouProp",
      thankyouText: "thankYouText",
      accountNum: "12345678",
    },
    thankyou: {
      thankYouProp: {
        banner_header: "Thank You Header",
        banner_body_1: "Banner Body 1",
        banner_body_2: "Banner Body 2",
        resumeUrl: "http://example.com/resume",
        timeline_header: "Timeline Header",
        timeline_desc: "Timeline Description",
        accountNumber: "Account Number",
      },
      thankYouText: {
        timeLine: "Timeline Title",
        applicationNumber: "Application Number",
        nextButton: "Next",
      },
      STP: {
        banner_header: "STP Banner Header",
        banner_body_1: "STP Body 1",
        banner_body_2: "STP Body 2",
      },
    },
    applicationReferenceNo: "REF123",
    submitForm: jest.fn(),
  };

  it("renders ThankYouCASA component for non-STP flow", () => {
    render(
      <Provider store={store}>
        <ThankYouCASA {...mockProps} />
      </Provider>
    );

    expect(screen.getByText("Thank You Header")).toBeInTheDocument();
    expect(screen.getByText("Banner Body 1")).toBeInTheDocument();
    expect(screen.getByText("Application Number")).toBeInTheDocument();
    expect(screen.getByText("REF123")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders ThankYouCASA component for STP flow with CasaBanner", () => {
    const stpProps = {
      ...mockProps,
      applicationDetails: {
        ...mockProps.applicationDetails,
        isStp: true,
      },
    };

    render(
      <Provider store={store}>
        <ThankYouCASA {...stpProps} />
      </Provider>
    );

    expect(screen.getByText("STP Banner Header")).toBeInTheDocument();
    expect(screen.getByText("Mocked CasaBanner")).toBeInTheDocument();
    expect(screen.getByText("Timeline Title")).toBeInTheDocument();
  });

  it("calls submitForm when the button is clicked", () => {
    render(
      <Provider store={store}>
        <ThankYouCASA {...mockProps} />
      </Provider>
    );

    const button = screen.getByText("Next");
    fireEvent.click(button);

    expect(mockProps.submitForm).toHaveBeenCalled();
  });

  it("handles missing timeline data gracefully", () => {
    const invalidProps = {
      ...mockProps,
      thankyou: {
        ...mockProps.thankyou,
        thankYouText: {
          timeLine: undefined,
        },
      },
    };

    render(
      <Provider store={store}>
        <ThankYouCASA {...invalidProps} />
      </Provider>
    );

    expect(screen.queryByText("Timeline Title")).not.toBeInTheDocument();
    expect(screen.getByText("Thank You Header")).toBeInTheDocument();
  });
});
