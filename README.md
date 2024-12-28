import eirRates from '../assets/_json/aip-eir-rate.json';
import { KeyWithAnyModel } from '../utils/model/common-model.js';
import loanDetailsConst from "../assets/_json/loan-details.json";
class service {
  allowOnlyCharacter = (event: any, fieldName: string) => {
    let regex = /^[0-9]{0,4}$/;
    if (
      fieldName === "mobile_number" ||
      fieldName === "preferred_credit_limit" ||
      fieldName === 'required_annual_income' 
      || fieldName === 'home_phone_number' || fieldName === 'office_phone_number' || fieldName === 'postal_code'
    ) {
      regex = /^[0-9]{0,8}$/;
    }
    if(fieldName === 'referral_id_2'){
      regex =  /^[0-9a-zA-Z]+$/; 
    }
    if (!`${event.target.value}${event.key}`.match(regex)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  /*
   * Method : Use to check given NRIC is valid or not
   * @param : NRIC string value
   * @returns : If valid NRIC return true else it will returns false
   */
  isValidNRIC = (nric: string) => {
    if (!nric || nric.length !== 9) {
      return false;
    } else {
      let nricLastChar;
      const multiplyer = [0, 2, 7, 6, 5, 4, 3, 2];
      let weight = 0;
      for (let i = 1; i < 8; i++) {
        weight += parseInt(nric[i], 10) * multiplyer[i];
      }
      const index =
        nric[0] === "T" || nric[0] === "G" ? (4 + weight) % 11 : weight % 11;
      const st = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
      const fg = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];
      if (nric[0] === "S" || nric[0] === "T") {
        nricLastChar = st[index];
      } else if (nric[0] === "F" || nric[0] === "G") {
        nricLastChar = fg[index];
      }
      return nric[8] === nricLastChar;
    }
  };

  /*
   * Method : Use to check given Date is valid or not
   * @param :  Date in string format with pattern 'YYYY-MM-DD'
   * @returns : If valid Date return true else it will returns false
   */
  isValidDate(date: string): boolean {
    if (!date) {
      return false;
    } else if (date && date.split("-").length > 2) {
      let monthDay = new Date(date).toDateString().split(" ")[2];
      if (date.split("-")[2] === monthDay) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /*
   * Method : Use this method to calculate age
   * @param :  Date in string format with pattern 'YYYY-MM-DD'
   * @returns : If Date is emtry return 0 else i will return calculated age
   */
  calculateAge(date: string): number {
    if (!date) {
      return 0;
    } else {
      let ageDiff = Date.now() - new Date(date).getTime();
      let ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
  }

  /*
   * Method : Use this method to validate age based on product type
   * @param : age and productType
   * @returns : valid as true if age is valid for the product else returns false
   */
  validateAge(
    age: number,
    productType: string,
    productCategory: string
  ): any {
    if (productCategory === "CA" || productCategory === "SA") {
      switch (productType) {
        case "310":
        case "318":
        case "324":
        case "331":
        case "334":
        case "335":
        case "337":
        case "507":
        case "307":
        case "314":
        case "508":
        case "328":
        case "512":
        case "329":
        case "338":
        case "153":
          return age < 18;
        case "504":
        case "330":
        case "339":
        case "340":
          return age < 21;
        case "505":
          return age < 15;
        case "516":
          return age < 55;
        case "514":
          return age < 18 || age > 26;
        default:
          return false;
      }
    } else {
      return age < 21;
    }
  }

  /*
   * Method : Use this method to get the validation message for age
   * @param : productType
   * @returns : returns the validation message bsed on product and age
   */
  getValidationMsg(productType: string, productCategory: string): any {
    if (productCategory === "CA" || productCategory === "SA") {
      switch (productType) {
        case "310":
        case "318":
        case "324":
        case "331":
        case "334":
        case "335":
        case "337":
        case "507":
        case "307":
        case "314":
        case "508":
        case "328":
        case "512":
        case "329":
        case "338":
        case "153":
          return "should not be less than 18 years";
        case "504":
        case "330":
        case "339":
        case "340":
          return "should not be less than 21 years";
        case "505":
          return "should not be less than 15 years";
        case "516":
          return "should not be less than 55 years";
        case "514":
          return "should not be less than 18 years and greater than 26 years";
        default:
          return "must be valid";
      }
    } else {
      return "must be greater than 21 years";
    }
  }

  formateCurrency = (amount: string, withDecimal? : boolean) => {
    if (amount) {
      amount = amount.replaceAll(",", "");
      let formatedAmount = parseFloat(amount).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      if(withDecimal) {
        formatedAmount = formatedAmount.replaceAll("$", "");
      } else {
        formatedAmount = formatedAmount.replaceAll("$", "").replaceAll(".00", "");
      }
      return formatedAmount;
    } else {
      return amount;
    }
  };

  nextEirIteration = (filteredEIRData:any, staff:string, tenor:string, roi:string, journey_type:string, journey_type_offline:string) => {
    const filteredJourneyType = (eirRates.filter((eir: KeyWithAnyModel) => eir.Staff === staff && eir.Journey === journey_type)).sort((a, b) => parseFloat(a.AR) - parseFloat(b.AR));
    const result:any = filteredJourneyType.filter((item: KeyWithAnyModel) => {
        if(item.AR > roi) {
            if(item['EIR (' + tenor + ')'] !== 'N/A') {
              return item;
            }
        }
    })
    if(result.length > 0) {
        //return result[0]['EIR (' + tenor + ')'];
        return result[0]['EIR (' + tenor + ')']+','+result[0].AR;
    } else {
        filteredEIRData = eirRates.filter((eir: KeyWithAnyModel) => eir.Staff === staff && eir.Journey === journey_type_offline)
          for (var j = 0; j < filteredEIRData.length; j++) {
            if (filteredEIRData[j]['EIR (' + tenor + ')'] && filteredEIRData[j]['EIR (' + tenor + ')'] !== 'N/A') {
              return filteredEIRData[j]['EIR (' + tenor + ')']+','+filteredEIRData[j].AR;
            }
          }
          return "";
    }
  }

  getEIR = (journey: string, staff: string, roi: string, tenor: string) => {
    roi = roi === "0"? loanDetailsConst.ARDefaultRate.toString() : roi;
    let filteredEIRData: any;
    const journey_type_offline = journey === 'ETC' ? 'ETC-Offline' : 'NTB/ NTC/ ETB-Offline';
    const journey_type = journey === 'ETC' ? 'ETC' : 'NTB/ NTC/ ETB';
    if (staff === "N") {
      filteredEIRData = eirRates.find((eir: KeyWithAnyModel) => eir.AR === roi && eir.Staff === staff && eir.Journey === journey_type)
    } else {
      filteredEIRData = eirRates.filter((eir: KeyWithAnyModel) => eir.Staff === staff && eir.Journey === journey_type)
    }
    if (staff === "Y" && filteredEIRData) {
      for (var i = 0; i < filteredEIRData.length; i++) {
        if (filteredEIRData[i]['EIR (' + tenor + ')'] && filteredEIRData[i]['EIR (' + tenor + ')'] !== 'N/A') {
          return filteredEIRData[i]['EIR (' + tenor + ')'] +','+ filteredEIRData[i].AR;
        } 
        // else {
        //   return this.nextEirIteration(filteredEIRData, staff, tenor, roi, journey_type, journey_type_offline);
        // }
      }
    } else if (filteredEIRData && filteredEIRData.length !== 0) {
        return filteredEIRData['EIR (' + tenor + ')'] +','+ filteredEIRData.AR;
    } else {
      return this.nextEirIteration(filteredEIRData, staff, tenor, roi, journey_type, journey_type_offline);
    }
  }

  getExcelRate = (periods: number, payment: number, present: number, future: number, type: number) => {
    const guess =  0.01;
    future = (future === undefined) ? 0 : future;
    type = (type === undefined) ? 0 : type;
  
    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;
  
    // Set maximum number of iterations
    var iterMax = 10;
  
    // Implement Newton's method
    var y, y0, y1, x0, x1 = 0,
      f = 0,
      i = 0;
    var rate = guess;
    if (Math.abs(rate) < epsMax) {
      y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
    } else {
      f = Math.exp(periods * Math.log(1 + rate));
      y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    }
    y0 = present + payment * periods + future;
    y1 = present * f + payment * (1 / rate + type) * (f - 1) + future;
    i = x0 = 0;
    x1 = rate;
    while ((Math.abs(y0 - y1) > epsMax) && (i < iterMax)) {
      rate = (y1 * x0 - y0 * x1) / (y1 - y0);
      x0 = x1;
      x1 = rate;
        if (Math.abs(rate) < epsMax) {
          y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
        } else {
          f = Math.exp(periods * Math.log(1 + rate));
          y = present * f + payment * (1 / rate + type) * (f - 1) + future;
        }
      y0 = y1;
      y1 = y;
      ++i;
    }
    return rate;
  }
}
const validateService = new service();

export default validateService;


import validateService from "../path/to/service"; // Update with the correct import path

describe("validateService Comprehensive Test Suite", () => {
  it("should validate all methods in the service", () => {
    // Test `allowOnlyCharacter`
    const mockEvent1 = { target: { value: "123" }, key: "4", preventDefault: jest.fn(), stopPropagation: jest.fn() };
    const mockEvent2 = { target: { value: "1234" }, key: "5", preventDefault: jest.fn(), stopPropagation: jest.fn() };
    const allowResult1 = validateService.allowOnlyCharacter(mockEvent1, "default_field");
    const allowResult2 = validateService.allowOnlyCharacter(mockEvent2, "default_field");
    expect(allowResult1).toBeUndefined();
    expect(mockEvent1.preventDefault).not.toHaveBeenCalled();
    expect(allowResult2).toBe(false);
    expect(mockEvent2.preventDefault).toHaveBeenCalled();

    // Test `isValidNRIC`
    const validNRIC = validateService.isValidNRIC("S1234567D");
    const invalidNRIC = validateService.isValidNRIC("A1234567Z");
    expect(validNRIC).toBe(true);
    expect(invalidNRIC).toBe(false);

    // Test `isValidDate`
    const validDate = validateService.isValidDate("2023-12-19");
    const invalidDate = validateService.isValidDate("2023-13-01");
    expect(validDate).toBe(true);
    expect(invalidDate).toBe(false);

    // Test `calculateAge`
    const age = validateService.calculateAge("1990-12-19");
    const noAge = validateService.calculateAge("");
    expect(age).toBe(34); // Assuming today is 2024-12-19
    expect(noAge).toBe(0);

    // Test `validateAge`
    const validAge1 = validateService.validateAge(17, "310", "CA");
    const validAge2 = validateService.validateAge(20, "500", "OTHER");
    expect(validAge1).toBe(true);
    expect(validAge2).toBe(true);

    // Test `formateCurrency`
    const currencyWithDecimal = validateService.formateCurrency("1000", true);
    const currencyWithoutDecimal = validateService.formateCurrency("1000", false);
    expect(currencyWithDecimal).toBe("1,000.00");
    expect(currencyWithoutDecimal).toBe("1,000");

    // Test `getEIR`
    const eirResult1 = validateService.getEIR("ETC", "N", "5.0", "12");
    const eirResult2 = validateService.getEIR("NTC", "Y", "0", "24");
    expect(eirResult1).toBeDefined();
    expect(eirResult2).toBeDefined();

    // Test `getExcelRate`
    const excelRate = validateService.getExcelRate(12, 1000, 10000, 0, 0);
    expect(excelRate).toBeCloseTo(0.007, 3);
  });
});
