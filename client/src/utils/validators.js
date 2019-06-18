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
    "agencyNumber",
    "signature"
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
  return errors;
};

export default validate;

// export const required = value => (value ? undefined : 'Required');

// export const nonEmpty = value => (
//   value.trim() !== '' ? undefined : 'Cannot be empty');

// export const isTrimmed = value => (
//   value.trim() === value ? undefined : 'Cannot start or end with whitespace');

// export const minMaxlength = length => value => {
//   if (length.min && value.length < length.min) {
//     return `Must be at least ${length.min} characters long`;
//   }
//   if (length.max && value.length > length.max) {
//     return `Must be at most ${length.max} characters long`;
//   }
// };

// export const exactLength = length => value => {
//   if (value.length !== length) {
//     return `Must be at exactly ${length.min} characters long`;
//   }
// };

// export const validEmail = email => {
//   if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
//     return "Please enter a valid email address (e.g. sample@email.com)";
//   }
// }

// export const validPhone = phone => {
//   var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
//   if (!(phone.match(phoneno))) {
//     return "Please enter a valid phone number with area code (e.g. 555-123-456";
//   }
// }

// export const matches = field => (value, allValues) =>
//     field in allValues && value.trim() === allValues[field].trim()
//         ? undefined
//         : 'Does not match';
