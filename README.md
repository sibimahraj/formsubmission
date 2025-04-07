import { AppDispatch } from "../../../services/common-service";
import {
  KeyWithAnyModel,
  StageDetails,
} from "../../../utils/model/common-model";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import { getUrl } from "../../../utils/common/change.utils";

export const getFields = (
  getStages: Array<StageDetails>,
  phoneSelector: any,
): any => {
  return (dispatch: AppDispatch) => {
    const stageId = getStages[0].stageId;
    const stageIndex =  getStages[0].stageInfo.fieldmetadata.data.stages.findIndex(
      (id: any) => id.stageId.toLowerCase() === stageId.toLowerCase()
    );
    let fields: Array<KeyWithAnyModel> | undefined = getStages[0].stageInfo.fieldmetadata.data.stages[stageIndex === -1?0:stageIndex].fields;
    let newFileds: Array<KeyWithAnyModel> = [];
    let newFieldsArray: Array<string> = [];
    const journeyType = getUrl.getJourneyType();

    let getClonedField = (logical_field_name: string) => {
      if (fields) {
        let field = fields.find(
          fieldData => fieldData.logical_field_name === logical_field_name
        );
        if (field && field.logical_field_name) {
          return { ...field };
        } else {
          return null;
        }
      } else {
        return null;
      }
    };

    phoneSelector.fields.forEach((field: string) => {
      let phone = getClonedField("mobile_number_rwb");
      if (field && phone) {
        phone.logical_field_name = "mobile_number";
        phone.component_type = "Phone";
        phone.rwb_label_name = "";
        if (journeyType) {
          phone.hide_remove_btn = true;
        }
        newFileds.push(phone);
        newFieldsArray.push(phone.logical_field_name);
      }
    });

    if (newFieldsArray.length > 0) {
      dispatch(fieldErrorAction.getMandatoryFields(newFieldsArray));
      dispatch(
        stagesAction.removeAddToggleField({
          removeFields: [],
          newFields: newFieldsArray,
          value: ""
        })
      );
    }

    return newFileds;
  };
};


phoneSelector.fields.forEach((field: string) => {
  // Check if this logical_field_name is already present in the fields array
  const alreadyCloned = fields?.some(
    (f) => f.logical_field_name === field
  );

  if (!alreadyCloned) {
    const originalField = getClonedField("mobile_number_rwb"); // or use a mapping if needed
    if (originalField) {
      const clonedField = {
        ...originalField,
        logical_field_name: field,
        component_type: "Phone",
        rwb_label_name: "",
        hide_remove_btn: !!journeyType,
      };

      newFileds.push(clonedField);
      newFieldsArray.push(clonedField.logical_field_name);
    }
  }
});
phoneSelector.fields.forEach((field: string) => {
      let phone = getClonedField(phoneSelector.fields[0]);
      console.log("Phone", phone)
      console.log("field", field)
      if (field && phone) {
        if(phoneSelector.fields[0] === "mobile_number_rwb"){
          debugger;
          phone.logical_field_name = "mobile_number";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "mobile_1"){
          debugger;
          phone.logical_field_name = "mobile_1_add";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }
        else if(phoneSelector.fields[0] === "mobile_2"){
          phone.logical_field_name = "mobile_2_add";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "overseas_mobile1_contact_no"){
          phone.logical_field_name = "overseas_mobile1";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "overseas_mobile2_contact_no"){
          phone.logical_field_name = "overseas_mobile2";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "ofc1_number"){
          phone.logical_field_name = "ofc1";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "ofc2_number"){
          phone.logical_field_name = "ofc2";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "home_phone2_number"){
          phone.logical_field_name = "home_phone2";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "office_phone1_number"){
          phone.logical_field_name = "office_phone1";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "office_phone2_number"){
          phone.logical_field_name = "office_phone2";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "ohph1_number"){
          phone.logical_field_name = "ohph1";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }else if(phoneSelector.fields[0] === "ohph2_number"){
          phone.logical_field_name = "ohph2";
          phone.component_type = "Phone";
          phone.rwb_label_name = "";
        }
        if (journeyType) {
          phone.hide_remove_btn = true;
        }
        newFileds.push(phone);
        newFieldsArray.push(phone.logical_field_name);
      }
    });
