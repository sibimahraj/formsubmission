import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ThankYouPL from "./thankyou-pl";
import ThankYouTimeline from "./thankyou-timeline";
import ThankYouBanner from "./thankyou-banner";
import ThankYouSurvey from "./thankyou-survey";
import validateService from "../../../services/validation-service";

jest.mock("./thankyou-timeline", () => jest.fn(() => <div>Mocked Timeline</div>));
jest.mock("./thankyou-banner", () => jest.fn(() => <div>Mocked Banner</div>));
jest.mock("./thankyou-survey", () => jest.fn(() => <div>Mocked Survey</div>));
jest.mock("../../../services/validation-service", () => ({
  formateCurrency: jest.fn((amount) => `Formatted ${amount}`),
}));

describe("ThankYouPL Component", () => {
  const mockProps = {
    applicationDetails: {
      isStp: false,
      thankyouProp: "nonStpThankYou",
      thankyouText: "thankYouText",
      productType: "SomeProductType",
      productName: "Mock Product",
      accountNum: "123456789",
      approvedLoan: 10000,
      loanTenureMonths: 12,
      feeAmount: 100,
    },
    thankyou: {
      nonStpThankYou: {
        banner_header: "Non-STP Banner Header",
        CCPL: {
          title: "Non-STP Title",
          content: "Non-STP Content",
          timeLine: "Non-STP Timeline",
          note_title: "Note Title",
          note_content_1: "Note Content 1",
          note_content_2: "Note Content 2",
          note_content_3: "Note Content 3",
          note_content_4: "Note Content 4",
          note_link: "http://example.com",
        },
      },
      STPPLBanner: {
        banner_header: "STP Banner Header",
        banner_body_1: "Body 1",
        banner_body_2: "Body 2",
        approved_loan_lbl: "Approved Loan Label",
        loan_tenure_lbl: "Loan Tenure Label",
        months_lbl: "months",
        disbursed_loan_amt_lbl: "Disbursed Loan Amount Label",
        banner_body_3: "Platinum Banner",
        banner_body_4: "Another Platinum Banner",
        title: "STP Title",
        account: "Account",
      },
      CCPL: {
        CreditCardFundsTransfer: "SomeProductType",
        PLFeeAmount: 50,
      },
      PLSTPTimeLine: "STP Timeline",
      thankYouText :{
        timeLine:"Mocked Timeline Title"
      }
    },
    enableActivation: true,
    showPlatinum: true,
    isCampaignBenefits: false,
    applicationReferenceNo: "APP12345",
    submitForm: jest.fn(),
  };

  it("renders the ThankYouPL component correctly for non-STP flow", () => {
    render(<ThankYouPL {...mockProps} />);
    expect(screen.getByText(/APP12345/)).toBeInTheDocument();
    expect(screen.getByText("Non-STP Title")).toBeInTheDocument();
    expect(screen.getByText("Non-STP Content")).toBeInTheDocument();
  });

  it("renders the ThankYouPL component correctly for STP flow", () => {
    const stpProps = {
      ...mockProps,
      applicationDetails: { ...mockProps.applicationDetails, isStp: true },
    };
    render(<ThankYouPL {...stpProps} />);
    expect(screen.getByText(/Another Platinum Banner/)).toBeInTheDocument();
    expect(screen.getByText("Approved Loan Label")).toBeInTheDocument();
    expect(screen.getByText(/APP12345/)).toBeInTheDocument();
  });

 
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ThankYou from "./thank-you"; // Importing your ThankYou component

const mockStore = configureStore([]);

describe("ThankYou Component", () => {
  let store;
  const mockProps = {
    enableActivation: true,
    isCampaignBenefits: false,
    showPlatinum: true,
    applicationReferenceNo: "APP98765",
  };

  beforeEach(() => {
    store = mockStore({
      stage: {
        currentStage: "ThankYou",
      },
      store: {
        thankyouDetails: {
          applicationDetails: {
            isStp: false,
          },
        },
      },
    });
  });

  it("renders ThankYou component correctly with non-STP flow", () => {
    render(
      <Provider store={store}>
        <ThankYou {...mockProps} />
      </Provider>
    );

    // Check if application reference number is displayed
    expect(screen.getByText(/APP98765/)).toBeInTheDocument();

    // Check for other static texts or elements unique to the ThankYou component
    expect(screen.getByText("Mocked Timeline")).toBeInTheDocument();
    expect(screen.getByText("Mocked Banner")).toBeInTheDocument();
    expect(screen.getByText("Mocked Survey")).toBeInTheDocument();
  });

  it("renders ThankYou component with STP flow", () => {
    const stpStore = mockStore({
      stage: {
        currentStage: "ThankYou",
      },
      store: {
        thankyouDetails: {
          applicationDetails: {
            isStp: true,
          },
        },
      },
    });

    render(
      <Provider store={stpStore}>
        <ThankYou {...mockProps} />
      </Provider>
    );

    // Verify STP flow renders specific elements
    expect(screen.getByText(/APP98765/)).toBeInTheDocument();
    expect(screen.getByText("Mocked Timeline")).toBeInTheDocument();
    expect(screen.getByText("Mocked Banner")).toBeInTheDocument();
  });

  it("handles button click to proceed", () => {
    render(
      <Provider store={store}>
        <ThankYou {...mockProps} />
      </Provider>
    );

    const button = screen.getByRole("button", { name: /Proceed/i });
    fireEvent.click(button);

    // Mock the button action (You can add more specific assertions depending on what the button does)
    expect(button).toBeInTheDocument();
  });
});
