const validate = values => {
  const errors = {};
  const requiredFields = [
    "firstName",
    "lastName",
    "dd",
    "mm",
    "yyyy",
    "preferredLanguage",
    "homeStreet",
    "homePostalCode",
    "homeState",
    "homeCity",
    "homeEmail",
    "mobilePhone",
    "employerName",
    "signature",
    "termsAgree"
  ];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required";
    }
  });
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
  if (values.homePostalCode && values.homePostalCode.length !== 5) {
    errors.homePostalCode = `Must be at exactly 5 characters long`;
  }
  if (values.mailToPostalCode && values.mailToPostalCode.length !== 5) {
    errors.mailToPostalCode = `Must be at exactly 5 characters long`;
  }
  return errors;
};

export default validate;
