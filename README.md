 useEffect(() => {
    taxSelector.fields.forEach(field => {
        const fieldIndex = field.split("_").pop(); 
        const fieldValue = userInputSelector.applicants[`${field}_a_1`];
        if (fieldValue && fieldValue.length >= 9) {
          const reasonField = `crs_reason_code_${fieldIndex}`;
          if (taxSelector.fields.includes(reasonField)) {
            dispatch(taxAction.removeTaxField(reasonField));
            dispatch(
              stagesAction.removeAddToggleField({
                removeFields: [reasonField],
                newFields: [],
              })
            );
          }
        }else if(fieldValue && fieldValue.length === 3){
          const reasonField = `crs_reason_code_${fieldIndex}_a_1`;
          if (userInputSelector.applicants[reasonField]==="B00") {
            const reasonFields = [
              "crs_reason_code_1_a_1",
              "crs_reason_code_2_a_1",
              "crs_reason_code_3_a_1",
              "crs_reason_code_4_a_1",
            ];
            reasonFields.forEach((field) => {
              const reasonValue = userInputSelector.applicants[field];
             if (reasonValue) {
                dispatch(taxAction.updateCrsComments({ [field]: reasonValue }));
              }
            });
           }
         else{
             const taxValue= `tax_id_no_${fieldIndex}_a_1`
            if(userInputSelector.applicants[taxValue]){
            dispatch(
              stagesAction.removeAddToggleField({
                removeFields: [`crs_reason_code_${fieldIndex}`],
                newFields: [],
              })
            );
            }else{
              dispatch(
                stagesAction.removeAddToggleField({
                  removeFields: [`tax_id_no_${fieldIndex}`],
                  newFields: [],
                })
              );
            }
          }
        }
    });
  }, [JSON.stringify(taxSelector.fields), JSON.stringify(userInputSelector.applicants)]);

import { createSlice } from "@reduxjs/toolkit";
import {taxStoreModel} from '../model/common-model'
const initialState: taxStoreModel = {
        maxCount: 5,
        count: 0,
        fields: []
};

const tax = createSlice({
        name: "tax",
        initialState,
        reducers: {
                addTaxFiled(state, action) {
                        state.fields.push(action.payload);
                },
                updateCount(state, action) {
                        state.count = action.payload;
                },
                removeTaxField(state, action) {
                       // if (state.count >= 0) {
                           if(action.payload!=="no_of_tax_residency_country"){
                                state.count = --state.count;
                                let findIndex = state.fields.findIndex(
                                        (field: string) => field === action.payload
                                );
                                state.fields.splice(findIndex,1);
                           }
                       // }
                        
                },
               
                updateTax(state, action) {
                        const updatedFields = [...state.fields]; 
                        const [field, value] = Object.entries(action.payload)[0];
                      
                        const normalizedField = field.replace(/_a_\d+$/, '');
                      
                        const index = updatedFields.findIndex(
                          (item) => item.replace(/_a_\d+$/, '') === normalizedField
                        );
                       const taxField = `tax_id_no_${field.split("_")[4]}`;
                       const reasonField = `crs_reason_code_${field.split("_")[4]}`;
                //        if(field.startsWith('crs_comments')){
                //         debugger
                //         const crsCommentsField = `crs_comments_${field.split("_")[2]}`;
                //         const existCrsComments = updatedFields.includes(crsCommentsField);         
                //         if (!existCrsComments) {
                //                 updatedFields.splice(index + 1, 0, `tax_id_no_${field.split("_")[4]}`, `crs_reason_code_${field.split("_")[4]}`, `crs_comments_${field.split("_")[4]}`);
                //         }  
                //        }
                       const taxAlone = updatedFields.includes(taxField)
                       const alreadyExists = updatedFields.includes(taxField) && updatedFields.includes(reasonField);
                      
                        if (value && index !== -1 &&!alreadyExists &&!taxAlone) {
                          updatedFields.splice(index + 1, 0, `tax_id_no_${field.split("_")[4]}`, `crs_reason_code_${field.split("_")[4]}`);
                        }
                      
                        state.fields = updatedFields; // Update state fields
                      },
                      updateCrsComments(state,action){
                        const updatedFields = [...state.fields];
                        const [field, value] = Object.entries(action.payload)[0];
                        const normalizedField = field.replace(/_a_\d+$/, '');
                        const index = updatedFields.findIndex(
                                (item) => item.replace(/_a_\d+$/, '') === normalizedField
                              );
                              const crsCmnts =`crs_comments_${field.split("_")[3]}`;
                              const crsExist = updatedFields.includes(crsCmnts)
                            if(value &&index!==-1 && !crsExist){
                                updatedFields.splice(index +1,0,`crs_comments_${field.split("_")[3]}`)
                              }  
                              state.fields = updatedFields;
                      }

                      ,
                resetTaxField(state, action) {
                        state.maxCount = 4;
                        state.count = 0;
                        state.fields = action.payload;
                }
                
        }
});
export const taxAction = tax.actions;
export default tax;
Remove one thing don't use slice method in the reducers your going to add i tried it it's not working because the index number is fluctuating 

Thanks for sharing the slice folder! I'll add a new slice function that removes the field when the reason is A (A00) or C while ensuring that it remains when the reason is B (B00).

Here's the updated slice with a new reducer removeTaxFieldByReason:

Updated Slice:

const tax = createSlice({
  name: "tax",
  initialState,
  reducers: {
    addTaxFiled(state, action) {
      state.fields.push(action.payload);
    },
    updateCount(state, action) {
      state.count = action.payload;
    },
    removeTaxField(state, action) {
      if (action.payload !== "no_of_tax_residency_country") {
        state.count = --state.count;
        let findIndex = state.fields.findIndex(
          (field: string) => field === action.payload
        );
        state.fields.splice(findIndex, 1);
      }
    },

    // New function to remove fields based on reason
    removeTaxFieldByReason(state, action) {
      const { field, reason } = action.payload;
      if (reason === "A00" || reason.startsWith("C")) {
        let findIndex = state.fields.findIndex(
          (existingField: string) => existingField === field
        );
        if (findIndex !== -1) {
          state.fields.splice(findIndex, 1);
        }
      }
    },

    updateTax(state, action) {
      const updatedFields = [...state.fields];
      const [field, value] = Object.entries(action.payload)[0];

      const normalizedField = field.replace(/_a_\d+$/, "");

      const index = updatedFields.findIndex(
        (item) => item.replace(/_a_\d+$/, "") === normalizedField
      );
      const taxField = `tax_id_no_${field.split("_")[4]}`;
      const reasonField = `crs_reason_code_${field.split("_")[4]}`;

      const taxAlone = updatedFields.includes(taxField);
      const alreadyExists =
        updatedFields.includes(taxField) && updatedFields.includes(reasonField);

      if (value && index !== -1 && !alreadyExists && !taxAlone) {
        updatedFields.splice(index + 1, 0, `tax_id_no_${field.split("_")[4]}`, `crs_reason_code_${field.split("_")[4]}`);
      }

      state.fields = updatedFields;
    },

    updateCrsComments(state, action) {
      const updatedFields = [...state.fields];
      const [field, value] = Object.entries(action.payload)[0];
      const normalizedField = field.replace(/_a_\d+$/, "");
      const index = updatedFields.findIndex(
        (item) => item.replace(/_a_\d+$/, "") === normalizedField
      );
      const crsCmnts = `crs_comments_${field.split("_")[3]}`;
      const crsExist = updatedFields.includes(crsCmnts);
      if (value && index !== -1 && !crsExist) {
        updatedFields.splice(index + 1, 0, `crs_comments_${field.split("_")[3]}`);
      }
      state.fields = updatedFields;
    },

    resetTaxField(state, action) {
      state.maxCount = 4;
      state.count = 0;
      state.fields = action.payload;
    },
  },
});

export const taxAction = tax.actions;
export default tax;

How to Use in useEffect

Modify your useEffect like this:

useEffect(() => {
  taxSelector.fields.forEach((field) => {
    const fieldIndex = field.split("_").pop();
    const fieldValue = userInputSelector.applicants[`${field}_a_1`];

    if (fieldValue && fieldValue.length >= 9) {
      const reasonField = `crs_reason_code_${fieldIndex}`;
      if (taxSelector.fields.includes(reasonField)) {
        dispatch(taxAction.removeTaxField(reasonField));
        dispatch(
          stagesAction.removeAddToggleField({
            removeFields: [reasonField],
            newFields: [],
          })
        );
      }
    } else if (fieldValue && fieldValue.length === 3) {
      const reasonField = `crs_reason_code_${fieldIndex}_a_1`;
      const reasonValue = userInputSelector.applicants[reasonField];

      if (reasonValue === "B00") {
        const reasonFields = [
          "crs_reason_code_1_a_1",
          "crs_reason_code_2_a_1",
          "crs_reason_code_3_a_1",
          "crs_reason_code_4_a_1",
        ];
        reasonFields.forEach((field) => {
          const fieldReasonValue = userInputSelector.applicants[field];
          if (fieldReasonValue) {
            dispatch(taxAction.updateCrsComments({ [field]: fieldReasonValue }));
          }
        });
      } else if (reasonValue === "A00" || reasonValue.startsWith("C")) {
        dispatch(
          taxAction.removeTaxFieldByReason({
            field: `crs_reason_code_${fieldIndex}`,
            reason: reasonValue,
          })
        );
      } else {
        const taxValue = `tax_id_no_${fieldIndex}_a_1`;
        if (userInputSelector.applicants[taxValue]) {
          dispatch(
            stagesAction.removeAddToggleField({
              removeFields: [`crs_reason_code_${fieldIndex}`],
              newFields: [],
            })
          );
        } else {
          dispatch(
            stagesAction.removeAddToggleField({
              removeFields: [`tax_id_no_${fieldIndex}`],
              newFields: [],
            })
          );
        }
      }
    }
  });
}, [JSON.stringify(taxSelector.fields), JSON.stringify(userInputSelector.applicants)]);

This will now properly remove the field when the reason is A00 or C while keeping it when the reason is B00. Let me know if you need any modifications!

Understood! I'll create a new slice that removes the field when the reason is A (A00) or C, ensuring that splice is not used in the reducers. Here's the updated slice:

New Slice for Handling Reason A (A00) & C

import { createSlice } from "@reduxjs/toolkit";
import { taxStoreModel } from "../model/common-model";

const initialState: taxStoreModel = {
  fields: [],
};

const taxReasonSlice = createSlice({
  name: "taxReason",
  initialState,
  reducers: {
    removeReasonField(state, action) {
      const updatedFields = state.fields.filter(
        (field) => !action.payload.includes(field)
      );
      state.fields = updatedFields;
    },
  },
});

export const taxReasonAction = taxReasonSlice.actions;
export default taxReasonSlice;

Usage in useEffect

Now, update your useEffect to dispatch this new action:

const reasonField = `crs_reason_code_${fieldIndex}_a_1`;
const reasonValue = userInputSelector.applicants[reasonField];

if (reasonValue === "A00" || reasonValue.startsWith("C")) {
  dispatch(taxReasonAction.removeReasonField([reasonField]));
}

This ensures that if the reason is A00 or C, the field gets removed without using splice, avoiding issues with fluctuating indexes. Let me know if you need further refinements!

Understood! I'll create a new slice that removes the field when the reason is A (A00) or C, ensuring that splice is not used in the reducers. Here's the updated slice:

New Slice for Handling Reason A (A00) & C

import { createSlice } from "@reduxjs/toolkit";
import { taxStoreModel } from "../model/common-model";

const initialState: taxStoreModel = {
  fields: [],
};

const taxReasonSlice = createSlice({
  name: "taxReason",
  initialState,
  reducers: {
    removeReasonField(state, action) {
      const updatedFields = state.fields.filter(
        (field) => !action.payload.includes(field)
      );
      state.fields = updatedFields;
    },
  },
});

export const taxReasonAction = taxReasonSlice.actions;
export default taxReasonSlice;

Usage in useEffect

Now, update your useEffect to dispatch this new action:

const reasonField = `crs_reason_code_${fieldIndex}_a_1`;
const reasonValue = userInputSelector.applicants[reasonField];

if (reasonValue === "A00" || reasonValue.startsWith("C")) {
  dispatch(taxReasonAction.removeReasonField([reasonField]));
}

This ensures that if the reason is A00 or C, the field gets removed without using splice, avoiding issues with fluctuating indexes. Let me know if you need further refinements!

