export const fieldIdAppend = (() => {
  const callTracker: Record<string, number> = {};

  return (props: KeyWithAnyModel): string => {
    const stages = getUrl.getStageInfo();
    const repeatCount = stages[0]?.stageInfo?.applicants?.no_of_accounts_rwb_a_1 ?? 1;

    const fieldId = props.data.logical_field_name;

    if (fieldId === "mobile_number") {
      return fieldId + "_rwb_a_1";
    }

    if (fieldId === "purpose_of_account_rwb") {
      // Increment tracker
      callTracker[fieldId] = (callTracker[fieldId] || 0) + 1;

      // If it exceeds repeatCount, reset it to 1
      if (callTracker[fieldId] > repeatCount) {
        callTracker[fieldId] = 1;
      }

      return fieldId + `_rwb_p_${callTracker[fieldId]}`;
    }

    return fieldId + "_a_1";
  };
})();
