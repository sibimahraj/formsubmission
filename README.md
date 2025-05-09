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
