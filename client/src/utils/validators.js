import { Trans } from "react-i18next";
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
      errors[field] = <Trans i18nKey="requiredError" />;
    }
  });
  if (
    values.homeEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.homeEmail)
  ) {
    errors.homeEmail = <Trans i18nKey="invalidEmailError" />;
  }
  if (
    values.workEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.workEmail)
  ) {
    errors.workEmail = <Trans i18nKey="invalidEmailError" />;
  }
  if (
    values.mobilePhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(
      values.mobilePhone
    )
  ) {
    errors.mobilePhone = <Trans i18nKey="invalidPhoneError" />;
  }
  if (
    values.workPhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(values.workPhone)
  ) {
    errors.workPhone = <Trans i18nKey="invalidPhoneError" />;
  }
  if (
    values.hireDate &&
    !/^\(?([0-9]{4})\)?[-]?([0-9]{2})[-]?([0-9]{2})$/.test(values.hireDate)
  ) {
    errors.hireDate = <Trans i18nKey="invalidDateError" />;
  }
  if (values.homeZip && values.homeZip.length !== 5) {
    errors.homeZip = <Trans i18nKey="charLength5Error" />;
  }
  if (values.mailToZip && values.mailToZip.length !== 5) {
    errors.mailToZip = <Trans i18nKey="charLength5Error" />;
  }
  // console.log("errors");
  // console.dir(errors);
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
      errors[obj["requiredField"]] = <Trans i18nKey="requiredError" />;
    }
  });
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = <Trans i18nKey="requiredError" />;
    }
  });
  if (values.capeAmountOther && !/^\d+$/i.test(values.capeAmountOther)) {
    errors.capeAmountOther = <Trans i18nKey="wholeDollarError" />;
  }
  if (
    values.homeEmail &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.homeEmail)
  ) {
    errors.homeEmail = <Trans i18nKey="invalidEmailError" />;
  }
  if (
    values.mobilePhone &&
    !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(
      values.mobilePhone
    )
  ) {
    errors.mobilePhone = <Trans i18nKey="invalidPhoneError" />;
  }
  if (values.homeZip && values.homeZip.length !== 5) {
    errors.homeZip = <Trans i18nKey="charLength5Error" />;
  }
  console.log(errors);
  return errors;
};
