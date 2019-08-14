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
    "homeZip",
    "homeState",
    "homeCity",
    "homeEmail",
    "mobilePhone",
    "employerName",
    "employerType",
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

export default validate;
