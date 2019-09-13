export const validate = values => {
  const errors = {};
  const requiredFields = [
    "firstName",
    "lastName",
    "dd",
    "mm",
    "yyyy",
    "preferredLanguage",
    "homeStreet",
    "homeZip",
    "homeState",
    "homeCity",
    "homeEmail",
    "mobilePhone",
    "employerName",
    "employerType",
    "termsAgree",
    "signature"
  ];
  const conditionalRequiredFields = [
    {
      requiredField: "directPayAuth",
      controllingField: "employerType",
      controllingValues: ["adult foster home", "retired", "community member"]
    },
    {
      requiredField: "medicaidResidents",
      controllingField: "employerType",
      controllingValues: ["adult foster home"]
    },
    {
      requiredField: "paymentType",
      controllingField: "employerType",
      controllingValues: ["retired"]
    },
    {
      requiredField: "paymentMethodAdded",
      controllingField: "employerType",
      controllingValues: ["adult foster home", "retired", "community member"]
    }
  ];
  conditionalRequiredFields.forEach(obj => {
    let matchValue = values[obj["controllingField"]]
      ? values[obj["controllingField"]].toLowerCase()
      : "";
    if (
      obj["controllingValues"].includes(matchValue) &&
      !values[obj["requiredField"]]
    ) {
      errors[obj["requiredField"]] = "Required";
    }
  });
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required";
    }
  });
  if (
    values.employerType &&
    (values.employerType.toLowerCase() === "adult foster home" ||
      values.employerType.toLowerCase() === "retired" ||
      values.employerType.toLowerCase() === "community member") &&
    values.paymentMethod === "Card" &&
    !values.paymentMethodAdded
  ) {
    errors.paymentMethodAdded = `Please add a payment method.`;
  }
  if (
    values.employerType &&
    values.employerType.toLowerCase() === "adult foster home" &&
    values.medicaidResidents < 1
  ) {
    errors.medicaidResidents = `Please enter the number of Medicaid Residents in your home(s).`;
  }
  if (
    values.homeEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.homeEmail)
  ) {
    errors.homeEmail = "Invalid email address (e.g. sample@email.com)";
  }
  if (
    values.workEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.workEmail)
  ) {
    errors.workEmail = "Invalid email address (e.g. sample@email.com)";
  }
  if (
    values.mobilePhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(
      values.mobilePhone
    )
  ) {
    errors.mobilePhone = "Invalid phone number (e.g. 555-123-456)";
  }
  if (
    values.workPhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(values.workPhone)
  ) {
    errors.workPhone = "Invalid phone number (e.g. 555-123-456)";
  }
  if (
    values.hireDate &&
    !/^\(?([0-9]{4})\)?[-]?([0-9]{2})[-]?([0-9]{2})$/.test(values.hireDate)
  ) {
    errors.hireDate = "Invalid Date (please us 'yyyy-mm-dd' format)";
  }
  if (values.homeZip && values.homeZip.length !== 5) {
    errors.homeZip = `Must be at exactly 5 characters long`;
  }
  if (values.mailToZip && values.mailToZip.length !== 5) {
    errors.mailToZip = `Must be at exactly 5 characters long`;
  }
  return errors;
};

export const capeValidate = values => {
  // console.log('capeValidate');
  const errors = {};
  const requiredFields = [
    "firstName",
    "lastName",
    "homeStreet",
    "homeZip",
    "homeState",
    "homeCity",
    "homeEmail",
    "mobilePhone",
    "employerName",
    "employerType",
    "capeAmount",
    "jobTitle"
  ];
  const conditionalRequiredFields = [
    {
      requiredField: "capeAmountOther",
      controllingField: "capeAmount",
      controllingValues: ["Other"]
    }
  ];
  conditionalRequiredFields.forEach(obj => {
    let matchValue = values[obj["controllingField"]];
    if (
      obj["controllingValues"].includes(matchValue) &&
      !values[obj["requiredField"]]
    ) {
      errors[obj["requiredField"]] = "Required";
    }
  });
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required";
    }
  });
  if (values.capeAmountOther && !/^\d+$/i.test(values.capeAmountOther)) {
    errors.capeAmountOther = "Please enter a whole dollar amount.";
  }
  if (
    values.employerType &&
    (values.employerType.toLowerCase() === "adult foster home" ||
      values.employerType.toLowerCase() === "retired" ||
      values.employerType.toLowerCase() === "community member") &&
    values.paymentType === "Card" &&
    !values.paymentMethodAdded
  ) {
    errors.paymentMethodAdded = `Please add a payment method.`;
  }
  if (
    values.homeEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.homeEmail)
  ) {
    errors.homeEmail = "Invalid email address (e.g. sample@email.com)";
  }
  if (
    values.mobilePhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(
      values.mobilePhone
    )
  ) {
    errors.mobilePhone = "Invalid phone number (e.g. 555-123-456)";
  }
  if (values.homeZip && values.homeZip.length !== 5) {
    errors.homeZip = `Must be at exactly 5 characters long`;
  }
  return errors;
};
