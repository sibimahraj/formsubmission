import "./thank-you.scss";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import ThankYouTimeline from "./thankyou-timeline";
import ThankYouBanner from "./thankyou-banner";
import ThankYouSurvey from "./thankyou-survey";

const CCActivationSucess = (props: KeyWithAnyModel) => {
  const applicationDetails = props.applicationDetails;
  const thankyou = props.thankyou;
  return (
    <>
      <ThankYouBanner
        banner_header={thankyou.CCActivation.banner.banner_header}
        banner_content={false}
      />
      <div className="thankyou__body__outer">
        <div className="thankyou__body">
          <div className="thankyou__title">
            {thankyou.CCActivation.header}
          </div>
          <div className="thankyou__title">
            <div>{applicationDetails.productName}</div>
            <div>
              <label>{applicationDetails.cardNumber}</label>
            </div>
          </div>
          <ThankYouTimeline
            title={thankyou.CCActivation.timeline_header}
            data={thankyou.CCActivation.successTimeLine}
            checkCompletedStatus={true}
          />
          <ThankYouSurvey/>
          <div className="body__notes">
            <div className="body__notes__desc">
              {thankyou.CCActivation.successNote}
             </div> 
          </div>                
          <div className="body__app-details">
            <label>{thankyou.CCPL.refId_lbl}</label>
            {props.applicationReferenceNo!}
          </div>
          <div className="body__refno">
            <button
              onClick={(e) => props.goToIBanking(e)}
              className="thankyou__continue"
            >
              {thankyou[applicationDetails.thankyouText].iBankingButton}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CCActivationSucess;

import React from "react";
import {render, screen} from "@testing-library/react"
import { shallow } from "enzyme";
import CCActivationSucess from "./cc-activation-success";
import ThankYouBanner from "./thankyou-banner";
import ThankYouTimeline from "./thankyou-timeline";
import ThankYouSurvey from "./thankyou-survey";
 
 
jest.mock("./thankyou-banner", ()=>jest.fn(()=><div data-testid="thank-you-banner"/>));
jest.mock("./thankyou-banner", ()=>jest.fn(()=><div data-testid="thank-you-timeline"/>));
jest.mock("./thankyou-banner", ()=>jest.fn(()=><div data-testid="thank-you-survey"/>));
 
describe("CCActivationSuccess Component",()=>{
    let wrapper: any;
    beforeAll(()=>{
        wrapper= shallow(<CCActivationSucess {...defaultProps}/>);
    });
    const defaultProps ={
        applicationDetails:{
            productName:"Credit Card",
            cardNumber:"1234 5678 9876 5432",
        },
        thankyou:{
            CCActivation:{
                banner:{
                    banner_header:"Activation Successful!",
                },
                header:"Congratulations on your new card!",
                timeline_header: "Activation Timeline",
                successTimeline:[
                    {step:"Application Submitted",completed:true},
                    {step:"Verification completed",completed:true},
                    {step:"Card Activated",completed:true},
                ],
                successNote:"Your card is now ready to use.",
            },
            CCPL:{
                refId_lbl:"1212323"
            }
        },
    };


    it("render the ThankYouBanner component with correct props",()=>{
        expect(wrapper).toHaveLength(1);
    });
  
   
});


CCActivationSuccess Component › render the ThankYouBanner component with correct props

    TypeError: Cannot read properties of undefined (reading 'iBankingButton')

      45 |               className="thankyou__continue"
      46 |             >
    > 47 |               {thankyou[applicationDetails.thankyouText].iBankingButton}
         |                                                          ^
      48 |             </button>
      49 |           </div>
      50 |         </div>

