import "./thank-you.scss";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import ThankYouTimeline from "./thankyou-timeline";
import ThankYouBanner from "./thankyou-banner";
import validateService from "../../../services/validation-service";
import ThankYouSurvey from "./thankyou-survey";
const ThankYouPL = (props: KeyWithAnyModel) => {
  const applicationDetails = props.applicationDetails;
  const thankyou = props.thankyou;
  const getTimelineData = () => {
    if (!applicationDetails.isStp) {
      return thankyou[applicationDetails.thankyouProp].CCPL.timeLine;
    }
    return thankyou.PLSTPTimeLine;
  };
  return (
    <>
      <ThankYouBanner
        banner_header={
          !applicationDetails.isStp
            ? thankyou[applicationDetails.thankyouProp].banner_header
            : thankyou.STPPLBanner.banner_header
        }
        banner_content={false}
      />
      <div className="thankyou__body__outer">
        <div className="thankyou__body">
          {!applicationDetails.isStp && (
            <>
              <div className="thankyou__title">
                <label>
                  {thankyou[applicationDetails.thankyouProp].CCPL.title}
                </label>
              </div>
              <div className="thankyou__content">
                <label>
                  {thankyou[applicationDetails.thankyouProp].CCPL.content}
                </label>
              </div>
            </>
          )}
          {applicationDetails.isStp && (
            <>
              {applicationDetails.productType ===
                thankyou.CCPL.CreditCardFundsTransfer && (
                <div className="body__app-desc">
                  <div className="thankyou__pl__content">
                    {thankyou.STPPLBanner.banner_body_1}
                    {applicationDetails.productName}{" "}
                    {thankyou.STPPLBanner.banner_body_2}
                  </div>
                  <div className="thankyou__pl__content">
                    <div className="pl__right__ctr">
                      <div className="pl__icon_2"></div>
                      {thankyou.STPPLBanner.approved_loan_lbl}
                      <div>S$ {applicationDetails.approvedLoan}</div>
                    </div>
                  </div>
                  {applicationDetails.feeAmount && (
                    <div className="thankyou__pl__content">
                      <div className="pl__icon_4"></div>
                      <div className="pl__right__ctr">
                        {thankyou.STPPLBanner.fee_amount_lbl}
                        <div>{applicationDetails.feeAmount}</div>
                      </div>
                    </div>
                  )}
                  {props.enableActivation && props.showPlatinum && (
                    <div>{thankyou.STPPLBanner.banner_body_4}</div>
                  )}
                </div>
              )}
              {applicationDetails.productType !==
                thankyou.CCPL.CreditCardFundsTransfer && (
                <>
                  {props.isCampaignBenefits && (
                    <label>{thankyou.STPPLBanner.banner_header_1}</label>
                  )}
                  {/* {!props.isCampaignBenefits && (
                    <label>{thankyou.STPPLBanner.banner_header_2}</label>
                  )} */}
                  <div className="body__app-desc">
                    <div className="thankyou__pl__content">
                      <div className="thankyou__title">
                        {thankyou.STPPLBanner.title}{" "}
                      </div>
                      <div className="thankyou__pl__subtitle">
                        {thankyou.STPPLBanner.banner_body_1}
                        {applicationDetails.productName}{" "}
                        {thankyou.STPPLBanner.banner_body_2}
                      </div>
                    </div>
                    <div className="thankyou__pl__content__inner">
                      <div className="thankyou__pl__accounticon"></div>
                      <div className="pl__right__ctr">
                        <div className="pl__content__label">
                          {applicationDetails.productName}{" "}
                          {thankyou.STPPLBanner.account}
                        </div>
                        <div>{applicationDetails.accountNum}</div>
                      </div>
                    </div>
                    <div className="thankyou__pl__content__inner">
                      <div className="thankyou__pl__loanicon"></div>
                      <div className="pl__right__ctr">
                        <div className="pl__content__label">
                          {thankyou.STPPLBanner.approved_loan_lbl}
                        </div>
                        <div>S$ {validateService.formateCurrency(applicationDetails.approvedLoan)}</div>
                      </div>
                    </div>
                    <div className="thankyou__pl__content__inner">
                      <div className="thankyou__pl__tenureicon"></div>
                      <div className="pl__right__ctr">
                        <div className="pl__content__label">
                          {thankyou.STPPLBanner.loan_tenure_lbl}
                        </div>
                        <div>
                          {applicationDetails.loanTenureMonths}
                          {thankyou.STPPLBanner.months_lbl}
                        </div>
                      </div>
                    </div>
                    {!props.isCampaignBenefits && (
                      <div className="thankyou__pl__content__inner">
                        <div className="thankyou__pl__disbursedicon"></div>
                        <div className="pl__right__ctr">
                          <div className="pl__content__label">
                            {thankyou.STPPLBanner.disbursed_loan_amt_lbl}
                          </div>
                          <div>
                            S${" "}
                            {validateService.formateCurrency(
                              (
                                applicationDetails.approvedLoan -
                                thankyou.CCPL.PLFeeAmount
                              ).toFixed(2)
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {props.enableActivation && props.showPlatinum && (
                      <div className="thankyou__pl__content">
                        {thankyou.STPPLBanner.banner_body_3}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          <ThankYouTimeline
            title={thankyou[applicationDetails.thankyouText].timeLine}
            data={getTimelineData()}
            checkCompletedStatus={true}
          />
          {/* {applicationDetails.isStp && (
            <div>
              <div>
                {thankyou[applicationDetails.thankyouText].timeline_header}
              </div>
              <div>
                {thankyou[applicationDetails.thankyouText].timeline_desc}
              </div>
            </div>
          )} */}
          <div>
            <div className="thankyou__note__content">
              <label>{thankyou.CCPL.note_title}</label>
            </div>
            <div className="thankyou__note__content">
              <div>{thankyou.CCPL.note_content_1}</div>
              <div>{thankyou.CCPL.note_content_2}</div>
            </div>
            <div className="thankyou__note__content">
              <div>{thankyou.CCPL.note_content_3}</div>
              <div>
                <a
                  target="_blank"
                  rel="feedback noreferrer"
                  href={thankyou.CCPL.note_link}
                >
                  {thankyou.CCPL.note_content_4}
                </a>
              </div>
            </div>
          </div>
          <div className="body__app-details appnum__details">
            <label>
              {thankyou[applicationDetails.thankyouText].applicationNumber}
            </label>
            {props.applicationReferenceNo!}
          </div>
        </div>
        <ThankYouSurvey/>
      </div>
      <div className="body__refno">
        <button
          onClick={(e) => props.submitForm(e)}
          className="thankyou__continue"
        >
          {thankyou[applicationDetails.thankyouText].doneButton}
        </button>
      </div>
    </>
  );
};
export default ThankYouPL;
