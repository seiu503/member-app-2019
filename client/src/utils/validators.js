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
    "homePostalCode",
    "homeState",
    "homeCity",
    "homeEmail",
    "mobilePhone",
    "employerName",
    "agencyNumber",
    "textAuthOptOut",
    "termsAgree",
    "signature",
    "onlineCampaignSource"
  ];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required";
    }
  });
  if (
    values.email &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
  ) {
    errors.email = "Invalid email address";
  }
  return errors;
};
