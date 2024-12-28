import TagManager from "react-gtm-module";
import { getUrl } from "../utils/common/change.utils";
import { KeyWithAnyModel } from "../utils/model/common-model";
import { store } from "../utils/store/store";
import { CONSTANTS } from "../utils/common/constants";
import { getProductCategory } from "./common-service";

class service {
    getProductsInfoForGA = (stage: KeyWithAnyModel) => {
        let response: Array<{}> = [];
        const products = stage.stages.stages[0].stageInfo.products;
        products.forEach((product: KeyWithAnyModel) => {
            response.push({
                name: product.name.toLowerCase().replace(/ /g, "-"), // string in required format
                id: product.product_type, // id of product  string (can be populated from backend CRM)
                price: "0",
                brand: "scb", // constant
                category: product.product_category === 'CC' ? 'credit-cards' : product.product_category === 'CA' ? 'current-account' : product.product_category === 'SA' ? 'savings-account' : 'borrow',
                categoryForPgViewEvnt: product.product_category === "CC" ? "credit-cards" : "borrow",
                variant: "deposits", // constant
                quantity: 1, // integer always 1
                campaignCode: product.campaign
            });
        });
        return response;
    };

    getStepPath = (stage: any) => {
        let stageId = stage.stages.stages[0].stageId;
        let journeyType = stage.stages.journeyType;
        let journeyCtnType;
        const productCategory = getProductCategory(stage.stages.stages[0].stageInfo.products);
        if (journeyType === "ETC") {
            journeyCtnType =
                productCategory === "CA" || productCategory === "SA"
                    ? "ETC_CASA"
                    : "ETC_CC";
        } else {
            journeyCtnType =
                productCategory === "CA" || productCategory === "SA"
                    ? "NON_ETC_CASA"
                    : "NON_ETC_CC";
        }
        const steps: KeyWithAnyModel = CONSTANTS[journeyCtnType];
        return steps[stageId].name;
    };

    pageView = (eventName: string, isStp?: boolean) => {
        const stage = store.getState();
        if (
            stage &&
            stage.stages.stages &&
            stage.stages.stages.length > 0 &&
            stage.stages.stages[0].stageInfo && getUrl.getParameterByName("auth") !== "upload"
            && !store.getState().stages.isDocumentUpload
        ) {
            let productsInfo = this.getProductsInfoForGA(stage);
            let product: KeyWithAnyModel = productsInfo[0];
            let stepName = this.getStepPath(stage);
            let code = getUrl.getParameterByName("instance");
            let productName = "";
            let subProductName = "";
            let campaignCode = "";
            productsInfo.forEach(function (product: KeyWithAnyModel, index: number) {
                let subCategoryName = product.name;
                if (index >= 1) {
                    productName += "|" + productName + "|" + product.category;
                    subProductName += "|" + subProductName + "|" + subCategoryName;
                    campaignCode += "|" + campaignCode + "|" + product.campaignCode;
                } else {
                    productName = product.category;
                    subProductName = subCategoryName;
                    campaignCode = product.campaignCode;
                }
            });
            let pageViewEvent: KeyWithAnyModel = {};
            pageViewEvent = {
                CountryCode: "sg",
                ProductName: productName,
                SubProductName: subProductName,
                FormStep: stepName,
                Language: "en",
                event: "RTOBPageview",
                offerCode: campaignCode,
            };
            let bundleProduct = productsInfo.length > 1 ? "/bundled" : "";

            if (eventName === "basic-info") {
                pageViewEvent.Pageview =
                    "/sg/" +
                    product.categoryForPgViewEvnt +
                    "/" +
                    product.name +
                    bundleProduct +
                    "/apply/step/" +
                    stepName +
                    (code !== "" && code ? "?instance=" + code : "");

            } else {
                let clientType = stage.stages.journeyType ? stage.stages.journeyType.toLowerCase() : "na";
                pageViewEvent.Pageview =
                    "/sg/" +
                    product.categoryForPgViewEvnt +
                    "/" +
                    product.name +
                    (clientType === "etb" ? "-clients" : "") +
                    "/apply/step/" +
                    stepName +
                    (code !== "" && code ? "?instance=" + code : "");
                pageViewEvent.ClientType = clientType;
                pageViewEvent.ApplicationNumber = getUrl.getChannelRefNo().applicationRefNo;

                if (stepName === 'Thank You') {
                    pageViewEvent.ApprovalStatus = isStp ? 'approved' : 'pending';
                }
            }

            if (getUrl.getParameterByName("source") === "scmobile_offers") {
                pageViewEvent.ReferralSource = "SC Mobile - Offers Flow";
            }
            TagManager.dataLayer({ dataLayer: pageViewEvent });
        }
    };
}

const gaTrackEvents = new service();

export default gaTrackEvents;


import gaTrackEvents from "./service"; // Adjust the path based on your file structure
import TagManager from "react-gtm-module";
import { getUrl } from "../utils/common/change.utils";
import { store } from "../utils/store/store";
import { CONSTANTS } from "../utils/common/constants";
import { getProductCategory } from "./common-service";

// Mock dependencies
jest.mock("react-gtm-module", () => ({
  dataLayer: jest.fn(),
}));

jest.mock("../utils/common/change.utils", () => ({
  getUrl: {
    getParameterByName: jest.fn(),
    getChannelRefNo: jest.fn(() => ({ applicationRefNo: "APP12345" })),
  },
}));

jest.mock("../utils/store/store", () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock("./common-service", () => ({
  getProductCategory: jest.fn(),
}));

describe("GA Track Events Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProductsInfoForGA", () => {
    it("should return the correct products info array", () => {
      const mockStage = {
        stages: {
          stages: [
            {
              stageInfo: {
                products: [
                  {
                    name: "Credit Card",
                    product_type: "CC01",
                    product_category: "CC",
                    campaign: "CAM123",
                  },
                  {
                    name: "Savings Account",
                    product_type: "SA01",
                    product_category: "SA",
                    campaign: "CAM456",
                  },
                ],
              },
            },
          ],
        },
      };

      const result = gaTrackEvents.getProductsInfoForGA(mockStage);

      expect(result).toEqual([
        {
          name: "credit-card",
          id: "CC01",
          price: "0",
          brand: "scb",
          category: "credit-cards",
          categoryForPgViewEvnt: "credit-cards",
          variant: "deposits",
          quantity: 1,
          campaignCode: "CAM123",
        },
        {
          name: "savings-account",
          id: "SA01",
          price: "0",
          brand: "scb",
          category: "savings-account",
          categoryForPgViewEvnt: "borrow",
          variant: "deposits",
          quantity: 1,
          campaignCode: "CAM456",
        },
      ]);
    });
  });

  describe("getStepPath", () => {
    it("should return the correct step name based on stageId and journey type", () => {
      const mockStage = {
        stages: {
          stages: [
            {
              stageId: "ssf-2",
              stageInfo: {
                products: [{ product_category: "CA" }],
              },
            },
          ],
          journeyType: "ETC",
        },
      };

      CONSTANTS["ETC_CASA"] = { "ssf-2": { name: "Step 2" } };
      (getProductCategory as jest.Mock).mockReturnValue("CA");

      const result = gaTrackEvents.getStepPath(mockStage);
      expect(result).toBe("Step 2");
    });
  });

  describe("pageView", () => {
    it("should trigger TagManager.dataLayer with the correct event data", () => {
      const mockStage = {
        stages: {
          stages: [
            {
              stageInfo: {
                products: [
                  {
                    name: "Credit Card",
                    product_type: "CC01",
                    product_category: "CC",
                    campaign: "CAM123",
                  },
                ],
              },
              stageId: "ssf-2",
            },
          ],
          journeyType: "ETC",
          isDocumentUpload: false,
        },
      };

      store.getState.mockReturnValue(mockStage);
      getUrl.getParameterByName.mockImplementation((param) => {
        if (param === "auth") return "apply";
        if (param === "instance") return "INST123";
        return null;
      });

      gaTrackEvents.pageView("basic-info");

      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: {
          CountryCode: "sg",
          ProductName: "credit-cards",
          SubProductName: "credit-card",
          FormStep: undefined,
          Language: "en",
          event: "RTOBPageview",
          offerCode: "CAM123",
          Pageview:
            "/sg/credit-cards/credit-card/apply/step/undefined?instance=INST123",
        },
      });
    });
  });
});

Test suite failed to run

    TypeError: (0 , _change.authenticateType) is not a function

      260 | }
      261 | export const getStageCounts = () =>{
    > 262 |   const flowType = authenticateType();
          |                                    ^
      263 |   return getTotalStep(flowType);
      264 | }
      265 |

      at getStageCounts (src/utils/common/constants.ts:262:36)
      at Object.getStageCounts (src/utils/common/constants.ts:266:30)
      at Object.require (src/services/ga-track-events.ts:5:1)
      at Object.require (src/services/ga-track-events.test.ts:1:1)
