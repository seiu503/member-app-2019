import { Translate } from "react-localize-redux";
import React from "react";
export const validate = values => {
  // console.log(values);
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
    "MOECheckbox",
    "signature"
  ];
  requiredFields.forEach(field => {
    if (!values[field]) {
      // console.log(`missing ${field}`);
      errors[field] = <Translate id="requiredError" />;
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
    errors.paymentMethodAdded = <Translate id="addPaymentError" />;
  }
  if (
    values.employerType &&
    values.employerType.toLowerCase() === "adult foster home" &&
    values.medicaidResidents < 1
  ) {
    errors.medicaidResidents = <Translate id="medicaidResidentsError" />;
  }
  if (
    values.homeEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.homeEmail)
  ) {
    errors.homeEmail = <Translate id="invalidEmailError" />;
  }
  if (
    values.workEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.workEmail)
  ) {
    errors.workEmail = <Translate id="invalidEmailError" />;
  }
  if (
    values.mobilePhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(
      values.mobilePhone
    )
  ) {
    errors.mobilePhone = <Translate id="invalidPhoneError" />;
  }
  if (
    values.workPhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(values.workPhone)
  ) {
    errors.workPhone = <Translate id="invalidPhoneError" />;
  }
  if (
    values.hireDate &&
    !/^\(?([0-9]{4})\)?[-]?([0-9]{2})[-]?([0-9]{2})$/.test(values.hireDate)
  ) {
    errors.hireDate = <Translate id="invalidDateError" />;
  }
  if (values.homeZip && values.homeZip.length !== 5) {
    errors.homeZip = <Translate id="charLength5Error" />;
  }
  if (values.mailToZip && values.mailToZip.length !== 5) {
    errors.mailToZip = <Translate id="charLength5Error" />;
  }
  console.log("errors");
  console.dir(errors);
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
      errors[obj["requiredField"]] = <Translate id="requiredError" />;
    }
  });
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = <Translate id="requiredError" />;
    }
  });
  if (values.capeAmountOther && !/^\d+$/i.test(values.capeAmountOther)) {
    errors.capeAmountOther = <Translate id="wholeDollarError" />;
  }
  if (
    values.homeEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.homeEmail)
  ) {
    errors.homeEmail = <Translate id="invalidEmailError" />;
  }
  if (
    values.mobilePhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(
      values.mobilePhone
    )
  ) {
    errors.mobilePhone = <Translate id="invalidPhoneError" />;
  }
  if (values.homeZip && values.homeZip.length !== 5) {
    errors.homeZip = <Translate id="charLength5Error" />;
  }
  return errors;
};
