const [hideMap, setHideMap] = useState<{ [key: string]: boolean }>({});

useEffect(() => {
  const updatedHideMap: { [key: string]: boolean } = {};
  const suffixes = [2, 3, 4, 5, 6, 7, 8];

  suffixes.forEach(num => {
    const fieldKey = `debit_card_request_rwb_${num}_a_1`;
    const fieldValue = userInputSelector.applicants?.[fieldKey];

    if (fieldValue === "N" && props.data?.logical_field_name === fieldKey) {
      updatedHideMap[fieldKey] = false;
    } else if (fieldValue === "Y" && props.data?.logical_field_name === fieldKey) {
      updatedHideMap[fieldKey] = true;
    } else if (!fieldValue) {
      updatedHideMap[fieldKey] = false;
    }
  });

  setHideMap(updatedHideMap);
}, [userInputSelector.applicants]);

{hideMap[props.data.logical_field_name] && (
  <div>... your field JSX ...</div>
)}

useEffect(() => {
  const updatedHideMap: { [key: string]: boolean } = {};
  const suffixes = [2, 3, 4, 5, 6, 7, 8];

  suffixes.forEach(num => {
    const fieldKey = `debit_card_request_rwb_${num}_a_1`;
    const fieldValue = userInputSelector.applicants?.[fieldKey];

    if (fieldValue === "N" && props.data?.logical_field_name === fieldKey) {
      updatedHideMap[fieldKey] = false;
    } else if (fieldValue === "Y" && props.data?.logical_field_name === fieldKey) {
      updatedHideMap[fieldKey] = true;
    } else if (!fieldValue) {
      updatedHideMap[fieldKey] = false;
    }
  });

  setHideMap(updatedHideMap);
}, [userInputSelector.applicants]);

const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});

const extractSuffix = (fieldName: string): string | null => {
  const match = fieldName.match(/issuance_type_(\d+)/);
  return match ? match[1] : null;
};
useEffect(() => {
  const logicalFieldName = props.data.logical_field_name;

  const suffix = extractSuffix(logicalFieldName); // get "2" from "issuance_type_2"
  if (!suffix) return;

  const rwbFieldKey = `debit_card_request_rwb_${suffix}_a_1`;

  const rwbValue = userInputSelector.applicants?.[rwbFieldKey];

  let show = true;

  if (rwbValue === "N") {
    show = true;
  } else if (rwbValue === "Y") {
    show = false;
  } else {
    show = true; // default fallback
  }

  setVisibility(prev => ({
    ...prev,
    [logicalFieldName]: show
  }));
}, [userInputSelector.applicants, props.data.logical_field_name]);


