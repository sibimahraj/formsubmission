import { getUrl } from "../../utils/common/change.utils";
import { filterDisableFields } from "../../utils/common/change.utils";
import {
  KeyWithAnyModel,
  ValidationObjModel,
} from "../../utils/model/common-model";
import rulesUtils from "./rules.utils";

const RulesSSFTwo = (
  props: KeyWithAnyModel,
  stages: KeyWithAnyModel,
  myinfoMissingFields?: Array<string>
): KeyWithAnyModel => {
  const validationObj: ValidationObjModel = {
    nonEditable: [],
    hidden: [],
  };

  const fieldSet = props.flat();
  let nonEditableFields: Array<string> = ["NRIC", "date_of_birth"];
  let myInfoMissingValues: Array<string> = myinfoMissingFields
    ? myinfoMissingFields
    : [];
  let hiddenFields: Array<string> = [];
  //Removing this condition as fields here in ssf-2 are from myinfo only, have to re-write the logic for manual cases
  /*istanbul ignore else */
  if (stages.application.source_system_name === "3") {
    if (stages.applicants["residency_status_a_1"] === "FR") {
      hiddenFields = ["NRIC"];
      if (myInfoMissingValues.length > 0) {
        myInfoMissingValues.push("passport_no", "pass_exp_date");
      }
    } else {
      hiddenFields = ["FIN", "passport_no", "pass_exp_date"];
    }
    /*istanbul ignore else */
    if(!stages.applicants["year_of_assessment_fff_1_a_1"]){
      hiddenFields.push("year_of_assessment_fff_1");
    }
    /*istanbul ignore else */
    if(!stages.applicants["annual_income_fff_1_a_1"]){
      hiddenFields.push("annual_income_fff_1");
    }

    if (getUrl.getJourneyType()) {
      let fields= [];
      fields = fieldSet.map((item:any) => item.fields);      
      nonEditableFields = filterDisableFields(fields.flat(), []);
    } else {
      const filteredMissingFields = fieldSet.filter(
        (item: any) => item.field_set_name !== "Missing Myinfo Details"
      );
      const default_editable = ['marital_status']
      if (myInfoMissingValues.length > 0) {
        nonEditableFields = filterDisableFields(
          filteredMissingFields[0].fields,
          myInfoMissingValues,
          default_editable
        );
      } else {
        nonEditableFields = filterDisableFields(
          filteredMissingFields[0].fields,
          myInfoMissingValues,
          default_editable
        );
      }
    }
  }
  if(stages.applicants["NRIC_a_1"]){
    nonEditableFields.push("NRIC");
  }
  if(stages.applicants["date_of_birth_a_1"]){
    nonEditableFields.push("date_of_birth");
  }
  validationObj.nonEditable.push(nonEditableFields);
  validationObj.hidden!.push(hiddenFields);

  return rulesUtils(props, validationObj);
};

export default RulesSSFTwo;

import RulesSSFTwo from './rules_ssf-2';
import { getUrl } from '../../utils/common/change.utils';
import rulesUtils from './rules.utils';

// Mock the dependencies
jest.mock('../../utils/common/change.utils', () => ({
  authenticateType: jest.fn(()=>"manual"),
  getUrl:{
    getJourneyType:jest.fn(),
    getParameterByName:jest.fn()
  },
  filterDisableFields:jest.fn()
}));

jest.mock('../../services/common-service', () => ({
  checkProductDetails: jest.fn(()=>true),
}));

jest.mock('./rules.utils', () => jest.fn());

describe('Rules_ssf2', () => {
  const mockProps = [[{field_set_name:"Employment Details", fields:[{"full_name":"testval"}]}]];
  const mockStageInfo = {
    products: [{'product_category':"CC"}],
    applicants: {
      residency_status_a_1: 'FR',
      

    },
    application:{
        journey_type:"NTC",
        source_system_name:"3"
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle rules ssf2 with auth as true', () => {
    (getUrl.getParameterByName as jest.Mock).mockReturnValue("true");
    (getUrl.getJourneyType as jest.Mock).mockReturnValue("NTC");
    const mockStageInfo1 = {
        products: [{'product_category':"PL"}],
        applicants: {
          residency_status_a_1: 'FR',
          mobile_number_a_1:"87878787",
      email_a_1:"test@xyz.com",
      account_currency_9_a_1:"SGD",
      account_currency_a_1:"DLR",
      NRIC_a_1:"S123121A",
      date_of_birth_a_1:"10-2-2011",
        },
        application:{
            source_system_name:"3"
          //  journey_type:"NTC"
        }
      };

    RulesSSFTwo(mockProps, mockStageInfo);
    RulesSSFTwo(mockProps, mockStageInfo1);

    expect(rulesUtils).toHaveBeenCalled();
  });


  it('should handle rules ssf2 with auth as true s', () => {
    (getUrl.getParameterByName as jest.Mock).mockReturnValue("true");
    // (getUrl.getJourneyType as jest.Mock).mockReturnValue("NTC");
    const mockStageInfo1 = {
        products: [{'product_category':"PL"}],
        applicants: {
          residency_status_a_1: 'CT',
          mobile_number_a_1:"87878787",
      email_a_1:"test@xyz.com",
      account_currency_9_a_1:"SGD",
      account_currency_a_1:"DLR",
        },
        application:{
            source_system_name:"3"
          //  journey_type:"NTC"
        }
      };

    RulesSSFTwo(mockProps, mockStageInfo,[""]);
    RulesSSFTwo(mockProps, mockStageInfo1,[]);

    expect(rulesUtils).toHaveBeenCalled();
  });

//   it('should handle manual or myinfo authentication in ssf1', () => {

   
//     const mockStageInfo1 = {
//         products: [{'product_category':"PL"}],
//         applicants: {
//             auth_mode_a_1: 'IX',
//             mobile_number_a_1:"87878787",
//       email_a_1:"test@xyz.com",
//       account_currency_9_a_1:"SGD",
//       account_currency_a_1:"DLR"
//         },
//         application:{
//             journey_type:"NTC"
//         }
//       };
// (getUrl.getJourneyType as jest.Mock).mockReturnValue("ETC")
//     RulesSSF(mockProps, mockStageInfo);
//     RulesSSF(mockProps, mockStageInfo1);

//     expect(rulesUtils).toHaveBeenCalled();
//   });

//   it('should handle manual in ssf1', () => {

//     (getUrl.getParameterByName as jest.Mock).mockReturnValue("manual");
//     const mockStageInfo1 = {
//         products: [{'product_category':"PL"}],
//         applicants: {
//           residency_status_a_1: 'FR',
//         },
//         application:{
//             journey_type:"ETC"
//         }
//       };
// (getUrl.getJourneyType as jest.Mock).mockReturnValue("NTB")
//     RulesSSF(mockProps, mockStageInfo);
//     RulesSSF(mockProps, mockStageInfo1);

//     expect(rulesUtils).toHaveBeenCalled();
//   });


});
 Rules_ssf2 › should handle rules ssf2 with auth as true

    TypeError: Cannot read properties of undefined (reading 'push')

      68 |   }
      69 |   if(stages.applicants["NRIC_a_1"]){
    > 70 |     nonEditableFields.push("NRIC");
         |                       ^
      71 |   }
      72 |   if(stages.applicants["date_of_birth_a_1"]){
      73 |     nonEditableFields.push("date_of_birth");

      at push (src/modules/rules/rules_ssf-2.ts:70:23)
      at Object.<anonymous> (src/modules/rules/rules_ssf-2.test.ts:64:16)
