import "./thank-you.scss";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import ThankYouBanner from "./thankyou-banner";

const ThankyouError = (props: KeyWithAnyModel) => {
  const applicationDetails = props.applicationDetails;
  const thankyou = props.thankyou;
  return (
    <>
      <ThankYouBanner
        banner_header={thankyou.CCPL.error.banner_header}
        banner_content={false}
      />
      <div className="thankyou__body__outer">
        <div className="thankyou__body">
          <div className="thankyou__title">{thankyou.CCPL.error.title}</div>
          <div className="body__notes">
            <div className="body__notes__desc">
              <div>{thankyou.CCPL.error.content_1}</div>
              <div>{thankyou.CCPL.error.content_2}</div>
              {applicationDetails.errorID && (
                <div>
                  <label>{thankyou.CCPL.error.error_id_lbl}</label>{" "}
                  {applicationDetails.errorID}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="body__refno">
          <button
            onClick={(e) => props.goToIBanking(e)}
            className="thankyou__continue"
          >
            {thankyou[applicationDetails.thankyouText].doneButton}
          </button>
      </div>
    </>
  );
};

export default ThankyouError;

import React from "react";
import {render , screen, fireEvent} from "@testing-library/react"
import { shallow } from "enzyme";
import ThankyouError from "./thankyou-error";
jest.mock("@lottiefiles/react-lottie-player",()=>({
    Player:jest.fn(()=><div data-testid="mock-lottie-player"></div>)
  }));
  

describe("ThankYouError Component",()=>{
    it("renders the ThankYouError Component with the provide data", ()=>{
        const mockProps ={
            applicationDetails:{
                errorID: "12345",
                thankyouText: {
                    doneButton:"Go to Banking",
                },
            },
            thankyou:{
                CCPL:{
                    error:{
                        banner_header: 'Error Header',
                        title: 'Error Title',
                        content_1: "Content 1",
                        content_2: "Content 2",
                        error_id_lbl: "Error ID"
                    },
                },
            },
            goToBanking:jest.fn(),
        };
        let wrapper = shallow(<ThankyouError{...mockProps}/>);
        expect(wrapper).toHaveLength(1);
   
    });
    it("renders the ThankYouError Component with the provide data", ()=>{
        const mockProps ={
            applicationDetails:{
                errorID: "12345",
                thankyouText: {
                    doneButton:"Go to Banking",
                },
                isStp:undefined,
                thankProp:"applicationDetails"
            },
            thankyou:{
                applicationDetails:{
                    CCPL:{
                        timeLine:"",
                        banner_header:""
                    },
                    thankyouProp:{
                        CCPL:{
                            timeLine:""
                        }
                    },
                    isStp:false,
                    
                },
                CCPL:{
                    error:{
                        banner_header: 'Error Header',
                        title: 'Error Title',
                        content_1: "Content 1",
                        content_2: "Content 2",
                        error_id_lbl: "Error ID"
                    },
                },
            },
            goToBanking:jest.fn(),
        };
        let wrapper = shallow(<ThankyouError applicationDetails={mockProps.applicationDetails} thankyou={mockProps.thankyou}/>);
        expect(wrapper).toHaveLength(1);
   
    });
   
    });

     ● ThankYouError Component › renders the ThankYouError Component with the provide data

    TypeError: Cannot read properties of undefined (reading 'doneButton')

      34 |             className="thankyou__continue"
      35 |           >
    > 36 |             {thankyou[applicationDetails.thankyouText].doneButton}
         |                                                        ^
      37 |           </button>
      38 |       </div>
      39 |     </>
