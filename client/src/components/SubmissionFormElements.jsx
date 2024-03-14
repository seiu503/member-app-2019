import React from "react";
import shortid from "shortid";
import PropTypes from "prop-types";
import { openSnackbar } from "../App";
import { useTranslation, Trans, Translation } from "react-i18next";

import {
  Box,
  TextField,
  Select,
  Checkbox,
  OutlinedInput,
  InputLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  InputAdornment
} from "@mui/material";

import LanguageIcon from "@mui/icons-material/Language";

import { camelCaseConverter, formatDate, formatDateTime } from "../utils";

import { forwardRef } from "react";

export const removeFalsy = obj => {
  let newObj = {};
  Object.keys(obj).forEach(prop => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

// hardcoded select options
export const stateList = [
  "",
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
];
export const monthList = [
  "",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12"
];
export const languageOptions = [
  "",
  "English",
  "ASL (Sign Language)",
  "Cantonese",
  "Cantonese AND Mandarin",
  "Mandarin",
  "Russian",
  "Somali",
  "Spanish",
  "Vietnamese",
  "Amharic",
  "Arabic",
  "Farsi",
  "Haitian Creole"
];
export const genderOptions = ["", "Female", "Male", "Non-Binary", "Other"];
export const genderPronounOptions = [
  "",
  "She/Her/Hers",
  "He/Him/His",
  "They/Them/Their(s)",
  "Other"
];
// set suggested donation amounts dynamically
// based on member's existing donation level
export const generateCAPEOptions = existingCAPE => {
  const optionSteps = [10, 13, 15, 18, 20, 23, 25, 28, 30, 33, 35, 38, 40, 50];
  const oneTimeSteps = [15, 20, 25, 30, 40, 50, 100];
  const monthlyOptions = [];
  const oneTimeOptions = [];
  if (existingCAPE) {
    // if the member has an existing monthly CAPE contribution,
    // start at the next highest amount and then
    // suggest two higher amounts as possible options
    const nextHighestOption = optionSteps.find(option => option > existingCAPE);
    const optionIndex = optionSteps.indexOf(nextHighestOption);
    monthlyOptions.push(
      optionSteps[optionIndex],
      optionSteps[optionIndex + 1],
      optionSteps[optionIndex + 2],
      "Other"
    );
    // console.log(monthlyOptions);
    const nextHighestOptionOneTime = oneTimeSteps.find(
      option => option > existingCAPE
    );
    const oneTimeIndex = oneTimeSteps.indexOf(nextHighestOptionOneTime);
    oneTimeOptions.push(
      oneTimeSteps[oneTimeIndex],
      oneTimeSteps[oneTimeIndex + 1],
      oneTimeSteps[oneTimeIndex + 2],
      "Other"
    );
    return {
      monthlyOptions,
      oneTimeOptions
    };
  } else {
    // if no existing contribution on file, then return the default amounts
    return {
      monthlyOptions: [10, 13, 15, "Other"],
      oneTimeOptions: [15, 20, 25, "Other"]
    };
  }
};

// switch helper for dateOptions
export const getMaxDay = month => {
  switch (month) {
    case "02":
      return 29;
    case "04":
    case "06":
    case "09":
    case "11":
      return 30;
    default:
      return 31;
  }
};
// function to adjust date select based on mm value
export const dateOptions = props => {
  const mm = props.formValues.mm;
  const max = getMaxDay(mm);
  let dates = [];
  for (let i = 1; i <= max; i++) {
    if (i < 10) {
      dates.push("0" + i);
    } else {
      dates.push(i.toString());
    }
  }
  dates.unshift("");
  return dates;
};
// dynamically fills yyyy select with last 110 years
export const yearOptions = () => {
  let years = [];
  for (
    let i = new Date().getFullYear() - 109;
    i <= new Date().getFullYear();
    i++
  ) {
    years.unshift(i.toString());
  }
  years.unshift("");
  return years;
};

export const paymentTypes = ["Check", "Card"];

// user-friendly names for employer type codes
export const employerTypeMap = {
  PNP: "Non-Profit",
  State: "State Agency",
  "Nursing Homes": "Nursing Home",
  "State Homecare": "State Homecare or Personal Support",
  "Higher Ed": "Higher Education",
  "Local Gov": "Local Government (City, County, School District)",
  "Private Homecare": "Private Homecare Agency",
  "SEIU LOCAL 503 OPEU": "",
  // "SEIU LOCAL 503 OPEU": "SEIU 503 Staff"
  // removing staff from picklist options
  test: "Please try reloading this page"
};

// helper function for reverse lookup from above object
export const getKeyByValue = (object, value) => {
  return Object.keys(object).find(
    key => object[key].toLowerCase() === value.toLowerCase()
  );
};

// date formatter for submitting to Salesforce
export const formatSFDate = date => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// convert MM DD YYYY to SF-formatted birthdate
export const formatBirthdate = formValues => {
  console.log("formatBirthdate");
  console.log(formValues);
  const dobRaw = `${formValues.mm}/${formValues.dd}/${formValues.yyyy}`;
  console.log(dobRaw);
  return formatSFDate(dobRaw);
};

// convert MM DD YYYY to SF-formatted hireDate
export const formatHireDate = formValues => {
  console.log("formatHireDate");
  console.log(formValues);
  const dobRaw = `${formValues.Wmm}/${formValues.Wdd}/${formValues.Wyyyy}`;
  console.log(dobRaw);
  return formatSFDate(dobRaw);
};

export const calcEthnicity = values => {
  const {
    africanOrAfricanAmerican,
    arabAmericanMiddleEasternOrNorthAfrican,
    asianOrAsianAmerican,
    hispanicOrLatinx,
    nativeAmericanOrIndigenous,
    nativeHawaiianOrOtherPacificIslander,
    white,
    other,
    declined
  } = values;
  if (declined) {
    return "declined";
  }
  let combinedEthnicities = "";
  const ethnicities = {
    africanOrAfricanAmerican,
    arabAmericanMiddleEasternOrNorthAfrican,
    asianOrAsianAmerican,
    hispanicOrLatinx,
    nativeAmericanOrIndigenous,
    nativeHawaiianOrOtherPacificIslander,
    white,
    other
  };
  const ethnicitiesArray = Object.entries(ethnicities);
  ethnicitiesArray.forEach(i => {
    if (i[1]) {
      if (combinedEthnicities === "") {
        combinedEthnicities = i[0];
      } else {
        combinedEthnicities += `, ${i[0]}`;
      }
    }
  });
  return combinedEthnicities;
};

// placeholder employerObject while waiting for API to return live data
export const placeholderEmployerObjects = [
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002ASaS0QAL"
    },
    Id: "0014N00002ASaS0QAL",
    Name: "State PSW",
    Sub_Division__c: "State Homecare",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw1c2AAB"
      },
      Id: "0016100000Pw1c2AAB"
    },
    Agency_Number__c: 100
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002ASaRyQAL"
    },
    Id: "0014N00002ASaRyQAL",
    Name: "PPL PSW",
    Sub_Division__c: "State Homecare",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw1c2AAB"
      },
      Id: "0016100000Pw1c2AAB"
    },
    Agency_Number__c: 150
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002ASaRxQAL"
    },
    Id: "0014N00002ASaRxQAL",
    Name: "HCW Holding",
    Sub_Division__c: "State Homecare",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw1c2AAB"
      },
      Id: "0016100000Pw1c2AAB"
    },
    Agency_Number__c: 151
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002yPa4YQAS"
    },
    Id: "0014N00002yPa4YQAS",
    Name: "ARETE LIVING (Avamere ALFs)",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0014N00002yPa5bQAC"
      },
      Id: "0014N00002yPa5bQAC"
    },
    Agency_Number__c: 379
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3aUAAR"
    },
    Id: "0016100000Pw3aUAAR",
    Name: "Portland Public School Employees",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 810
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Sb6fTAAR"
    },
    Id: "0016100000Sb6fTAAR",
    Name: "CASCADE AIDS PROJECT",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 901
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Sb6fiAAB"
    },
    Id: "0016100000Sb6fiAAB",
    Name: "OREGON SUPPORTED LIVING PROGRAM",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 902
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Sb6fsAAB"
    },
    Id: "0016100000Sb6fsAAB",
    Name: "Riverview Center for Growth (formerly The Child Center)",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 904
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Sb6guAAB"
    },
    Id: "0016100000Sb6guAAB",
    Name: "EDUCATION NORTHWEST (Formerly NWREL)",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 905
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3iYAAR"
    },
    Id: "0016100000Pw3iYAAR",
    Name: "LCOG SDSD",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 908
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dJAAR"
    },
    Id: "0016100000Pw3dJAAR",
    Name: "THE DALLES CITY OF EMPLOYEES ASSN.",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 910
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3QtAAJ"
    },
    Id: "0016100000Pw3QtAAJ",
    Name: "CITY OF CANNON BEACH",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 921
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dYAAR"
    },
    Id: "0016100000Pw3dYAAR",
    Name: "WALLOWA CO. ROADS DEPT.",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 923
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3diAAB"
    },
    Id: "0016100000Pw3diAAB",
    Name: "WALLOWA CTY PROFESSIONAL EMPS",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 924
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3caAAB"
    },
    Id: "0016100000Pw3caAAB",
    Name: "JACKSON COUNTY EMPLOYEES",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 925
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3RhAAJ"
    },
    Id: "0016100000Pw3RhAAJ",
    Name: "CITY OF WILSONVILLE",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 926
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3RrAAJ"
    },
    Id: "0016100000Pw3RrAAJ",
    Name: "COOS BAY-NORTH BEND WATER BOARD",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 935
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3d4AAB"
    },
    Id: "0016100000Pw3d4AAB",
    Name: "OREGON CASCADES WEST COG",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 937
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3cGAAR"
    },
    Id: "0016100000Pw3cGAAR",
    Name: "CITY OF PENDLETON",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 938
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3cuAAB"
    },
    Id: "0016100000Pw3cuAAB",
    Name: "MARION COUNTY EMPLOYEES",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 940
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3RwAAJ"
    },
    Id: "0016100000Pw3RwAAJ",
    Name: "JOSEPHINE COUNTY",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 951
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Sb6hEAAR"
    },
    Id: "0016100000Sb6hEAAR",
    Name: "CODA",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 963
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000WEvHqAAL"
    },
    Id: "0016100000WEvHqAAL",
    Name: "Healthcare Services Group",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 969
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3b3AAB"
    },
    Id: "0016100000Pw3b3AAB",
    Name: "BAKER COUNTY EMPLOYEES",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 970
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3fFAAR"
    },
    Id: "0016100000Pw3fFAAR",
    Name: "Prestige Nursing Homes",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 971
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3eRAAR"
    },
    Id: "0016100000Pw3eRAAR",
    Name: "Empres Health Care",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 972
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002yPa5bQAC"
    },
    Id: "0014N00002yPa5bQAC",
    Name: "AVAMERE HEALTH SERVICES",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 973
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3e2AAB"
    },
    Id: "0016100000Pw3e2AAB",
    Name: "Avamere Skilled Nursing Facilities (SNFs)",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0014N00002yPa5bQAC"
      },
      Id: "0014N00002yPa5bQAC"
    },
    Agency_Number__c: 973
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3evAAB"
    },
    Id: "0016100000Pw3evAAB",
    Name: "VOLARE HEALTH",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 974
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3QZAAZ"
    },
    Id: "0016100000Pw3QZAAZ",
    Name: "BASIN TRANSIT SERVICE",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 977
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3eMAAR"
    },
    Id: "0016100000Pw3eMAAR",
    Name: "Sapphire Health Services",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 980
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3cpAAB"
    },
    Id: "0016100000Pw3cpAAB",
    Name: "LINN COUNTY EMPLOYEES ASSN",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 981
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3hfAAB"
    },
    Id: "0016100000Pw3hfAAB",
    Name: "ADDUS",
    Sub_Division__c: "Private Homecare",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 982
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3eCAAR"
    },
    Id: "0016100000Pw3eCAAR",
    Name: "Benicia Senior Care",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 983
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3UgAAJ"
    },
    Id: "0016100000Pw3UgAAJ",
    Name: "CURRY COUNTY EMPLOYEES",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 985
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Sb6hJAAR"
    },
    Id: "0016100000Sb6hJAAR",
    Name: "PARRY CENTER FOR CHILDREN",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 987
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002ASaRzQAL"
    },
    Id: "0014N00002ASaRzQAL",
    Name: "State APD",
    Sub_Division__c: "State Homecare",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw1c2AAB"
      },
      Id: "0016100000Pw1c2AAB"
    },
    Agency_Number__c: 988
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3ebAAB"
    },
    Id: "0016100000Pw3ebAAB",
    Name: "Caldera Care",
    Sub_Division__c: "Nursing Homes",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3dsAAB"
      },
      Id: "0016100000Pw3dsAAB"
    },
    Agency_Number__c: 989
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3cBAAR"
    },
    Id: "0016100000Pw3cBAAR",
    Name: "CITY OF BEAVERTON EMPLOYEES",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 990
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3bNAAR"
    },
    Id: "0016100000Pw3bNAAR",
    Name: "CENTRAL OREGON IRRIG DISTRICT",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 992
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3RIAAZ"
    },
    Id: "0016100000Pw3RIAAZ",
    Name: "CITY OF TIGARD EMPLOYEES",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 993
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3KqAAJ"
    },
    Id: "0016100000Pw3KqAAJ",
    Name: "CITY OF SPRINGFIELD EMPLOYEES",
    Sub_Division__c: "Local Gov",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3JnAAJ"
      },
      Id: "0016100000Pw3JnAAJ"
    },
    Agency_Number__c: 995
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Pw3ZlAAJ"
    },
    Id: "0016100000Pw3ZlAAJ",
    Name: "ALVORD TAYLOR",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 999
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kdn9qAAB"
    },
    Id: "0016100000Kdn9qAAB",
    Name: "Department of Human Services",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 10000
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TbAAJ"
    },
    Id: "0016100000Kb1TbAAJ",
    Name: "DEPARTMENT OF ADMINISTRATIVE SERVICES",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 10700
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00001iFT9CQAW"
    },
    Id: "0014N00001iFT9CQAW",
    Name: "BOARD OF LICENSED PROFESSIONAL COUNSELORS AND THERAPISTS (MHRA)",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 10800
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kdn9rAAB"
    },
    Id: "0016100000Kdn9rAAB",
    Name: "Oregon Department of Aviation",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 10900
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kdn9sAAB"
    },
    Id: "0016100000Kdn9sAAB",
    Name: "PSYCHOLOGISTS EXAMINERS BOARD",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 12200
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00001iG3m6QAC"
    },
    Id: "0014N00001iG3m6QAC",
    Name: "Oregon Advocacy Commission",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 13100
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TmAAJ"
    },
    Id: "0016100000Kb1TmAAJ",
    Name: "DEPARTMENT OF JUSTICE",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 13700
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TqAAJ"
    },
    Id: "0016100000Kb1TqAAJ",
    Name: "DEPARTMENT OF REVENUE",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 15000
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TtAAJ"
    },
    Id: "0016100000Kb1TtAAJ",
    Name: "DEPARTMENT OF TREASURY",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 17000
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kdn9tAAB"
    },
    Id: "0016100000Kdn9tAAB",
    Name: "DEPARTMENT OF VETERANS AFFAIRS",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 27400
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TuAAJ"
    },
    Id: "0016100000Kb1TuAAJ",
    Name: "OREGON YOUTH AUTHORITY",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 41500
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TeAAJ"
    },
    Id: "0016100000Kb1TeAAJ",
    Name: "DEPARTMENT OF CONSUMER & BUSINESS SERVICES",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 44000
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00001kyageQAA"
    },
    Id: "0014N00001kyageQAA",
    Name: "OREGON HEALTH AUTHORITY",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 44300
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TpAAJ"
    },
    Id: "0016100000Kb1TpAAJ",
    Name: "PUBLIC EMPLOYEES RETIREMENT SYSTEM",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 45900
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TgAAJ"
    },
    Id: "0016100000Kb1TgAAJ",
    Name: "EMPLOYMENT DEPARTMENT",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 47100
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100001UoJfLAAV"
    },
    Id: "0016100001UoJfLAAV",
    Name: "Higher Education Coordination Committee (HECC)",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 52500
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kdn9wAAB"
    },
    Id: "0016100000Kdn9wAAB",
    Name: "OREGON STATE LIBRARY",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 54300
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Sb6hYAAR"
    },
    Id: "0016100000Sb6hYAAR",
    Name: "PUBLIC BROADCASTING COMM",
    Sub_Division__c: "PNP",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Pw3YTAAZ"
      },
      Id: "0016100000Pw3YTAAZ"
    },
    Agency_Number__c: 57000
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kdn9yAAB"
    },
    Id: "0016100000Kdn9yAAB",
    Name: "EASTERN OREGON UNIVERSITY",
    Sub_Division__c: "Higher Ed",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kdn8sAAB"
      },
      Id: "0016100000Kdn8sAAB"
    },
    Agency_Number__c: 58010
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kdn9zAAB"
    },
    Id: "0016100000Kdn9zAAB",
    Name: "OREGON INSTITUTE OF TECHNOLOGY",
    Sub_Division__c: "Higher Ed",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kdn8sAAB"
      },
      Id: "0016100000Kdn8sAAB"
    },
    Agency_Number__c: 58018
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA0AAJ"
    },
    Id: "0016100000KdnA0AAJ",
    Name: "WESTERN OREGON UNIVERSITY",
    Sub_Division__c: "Higher Ed",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kdn8sAAB"
      },
      Id: "0016100000Kdn8sAAB"
    },
    Agency_Number__c: 58020
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA1AAJ"
    },
    Id: "0016100000KdnA1AAJ",
    Name: "OREGON STATE UNIVERSITY",
    Sub_Division__c: "Higher Ed",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kdn8sAAB"
      },
      Id: "0016100000Kdn8sAAB"
    },
    Agency_Number__c: 58030
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA2AAJ"
    },
    Id: "0016100000KdnA2AAJ",
    Name: "SOUTHERN OREGON UNIVERSITY",
    Sub_Division__c: "Higher Ed",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kdn8sAAB"
      },
      Id: "0016100000Kdn8sAAB"
    },
    Agency_Number__c: 58040
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA3AAJ"
    },
    Id: "0016100000KdnA3AAJ",
    Name: "UNIVERSITY OF OREGON",
    Sub_Division__c: "Higher Ed",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kdn8sAAB"
      },
      Id: "0016100000Kdn8sAAB"
    },
    Agency_Number__c: 58050
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA4AAJ"
    },
    Id: "0016100000KdnA4AAJ",
    Name: "PORTLAND STATE UNIVERSITY",
    Sub_Division__c: "Higher Ed",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kdn8sAAB"
      },
      Id: "0016100000Kdn8sAAB"
    },
    Agency_Number__c: 58090
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TfAAJ"
    },
    Id: "0016100000Kb1TfAAJ",
    Name: "DEPARTMENT OF EDUCATION",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 58100
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA5AAJ"
    },
    Id: "0016100000KdnA5AAJ",
    Name: "OFFICE OF COMM COLLEGE SERVICES",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 58120
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TrAAJ"
    },
    Id: "0016100000Kb1TrAAJ",
    Name: "TEACHER STANDARDS & PRACTICES",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 58400
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TdAAJ"
    },
    Id: "0016100000Kb1TdAAJ",
    Name: "COMMISSION FOR THE BLIND",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 58500
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA6AAJ"
    },
    Id: "0016100000KdnA6AAJ",
    Name: "COMMUNITY COLLEGE BOARD",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 58600
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00003SKqKxQAL"
    },
    Id: "0014N00003SKqKxQAL",
    Name: "Department of Early Learning and Childcare (DELC)",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 58800
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TcAAJ"
    },
    Id: "0016100000Kb1TcAAJ",
    Name: "DEPARTMENT OF AGRICULTURE",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 60300
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TiAAJ"
    },
    Id: "0016100000Kb1TiAAJ",
    Name: "DEPARTMENT OF FORESTRY",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 62900
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00001gLdHiQAK"
    },
    Id: "0014N00001gLdHiQAK",
    Name: "Department of Geology and Mineral Industries (DOGAMI)",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 63200
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA8AAJ"
    },
    Id: "0016100000KdnA8AAJ",
    Name: "OPRD",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 63400
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1ThAAJ"
    },
    Id: "0016100000Kb1ThAAJ",
    Name: "OREGON DEPARTMENT OF FISH AND WILDLIFE",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 63500
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnA9AAJ"
    },
    Id: "0016100000KdnA9AAJ",
    Name: "WATER RESOURCES DEPARTMENT",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 69000
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002yPGQhQAO"
    },
    Id: "0014N00002yPGQhQAO",
    Name: "OREGON WATER ENHANCEMENT BOARD",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 69100
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100001UoJbRAAV"
    },
    Id: "0016100001UoJbRAAV",
    Name: "OR Watershed Enhancement Board (OWEB)",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100001UoDg2AAF"
      },
      Id: "0016100001UoDg2AAF"
    },
    Agency_Number__c: 69100
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TsAAJ"
    },
    Id: "0016100000Kb1TsAAJ",
    Name: "DEPARTMENT OF TRANSPORTATION",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 73000
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100001UoJZVAA3"
    },
    Id: "0016100001UoJZVAA3",
    Name: "HEALTH LICENSING AGENCY",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 83300
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Ri4CmAAJ"
    },
    Id: "0016100000Ri4CmAAJ",
    Name: "Board of Mortuary Cemetery",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 83317
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00001iG4RgQAK"
    },
    Id: "0014N00001iG4RgQAK",
    Name: "OREGON HEALTH RELATED LICENSING BOARD",
    Sub_Division__c: "State",
    Parent: null,
    Agency_Number__c: 83318
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Ri4C8AAJ"
    },
    Id: "0016100000Ri4C8AAJ",
    Name: "Board of Medical Imaging",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 83326
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00001iG3i4QAC"
    },
    Id: "0014N00001iG3i4QAC",
    Name: "Board of Examiners for Speech-Lang Path and Audiology",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 83328
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnADAAZ"
    },
    Id: "0016100000KdnADAAZ",
    Name: "Dentistry Board",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 83400
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnAEAAZ"
    },
    Id: "0016100000KdnAEAAZ",
    Name: "BUREAU OF LABOR & INDUSTRIES",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 83900
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnAFAAZ"
    },
    Id: "0016100000KdnAFAAZ",
    Name: "OREGON MEDICAL BOARD",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 84700
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnAGAAZ"
    },
    Id: "0016100000KdnAGAAZ",
    Name: "BOARD OF NURSING",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 85100
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnAHAAZ"
    },
    Id: "0016100000KdnAHAAZ",
    Name: "BOARD OF PHARMACY",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 85500
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00002Od1VjQAJ"
    },
    Id: "0014N00002Od1VjQAJ",
    Name: "OREGON MILITARY DEPARTMENT FEDERAL EMPLOYEES",
    Sub_Division__c: "State",
    Parent: null,
    Agency_Number__c: 88400
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000Kb1TkAAJ"
    },
    Id: "0016100000Kb1TkAAJ",
    Name: "OREGON HOUSING & COMMUNITY SERV",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 91400
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0014N00001iDCBGQA4"
    },
    Id: "0014N00001iDCBGQA4",
    Name: "Board of Examiners for Engineering and Land Surveying (OSBEELS)",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 96600
  },
  {
    attributes: {
      type: "Account",
      url: "/services/data/v42.0/sobjects/Account/0016100000KdnAIAAZ"
    },
    Id: "0016100000KdnAIAAZ",
    Name: "State Board of Massage Therapists",
    Sub_Division__c: "State",
    Parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
      },
      Id: "0016100000Kb1RQAAZ"
    },
    Agency_Number__c: 96800
  }
];

export const placeholderEmployerNames = placeholderEmployerObjects.map(
  obj => obj.Name
);

// find matching employer object from redux store
export const findEmployerObject = (employerObjects, employerName) =>
  employerObjects
    ? employerObjects.filter(obj => {
        if (
          employerName &&
          employerName.toLowerCase() === "personal support worker (paid by ppl)"
        ) {
          return obj.Name === "PPL PSW";
        } else if (
          employerName &&
          employerName.toLowerCase() ===
            "personal support worker (paid by state of oregon)"
        ) {
          return obj.Name === "State PSW";
        } else if (
          employerName &&
          employerName.toLowerCase() ===
            "homecare worker (aging and people with disabilities)"
        ) {
          return obj.Name === "State APD";
        } else if (employerName && employerName.toLowerCase() === "") {
          // console.log(`no agency number found for ${values.employerName}`);
          return obj.Name === "Unknown (DEFAULT)";
        } else {
          return obj.Name.toLowerCase() === employerName.toLowerCase();
        }
      })[0]
    : { Name: "" };

// MUI styles objects
export const classesPage1 = {
  buttonWrap: {
    width: "100%",
    padding: "0 20px 40px 0",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px"
  },
  buttonWrapTab3: {
    width: "100%",
    padding: "40px 20px 0 0",
    display: "flex",
    justifyContent: "flex-start"
  },
  buttonWrapCAPE: {
    width: "100%",
    padding: "0 20px 40px 0",
    display: "flex",
    justifyContent: "space-between"
  },
  verticalGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },
  horizGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },
  formSection: {
    paddingTop: "20px"
  },
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  groupLeft: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  select: {
    width: "100%",
    margin: "0 0 30px 0"
  },
  selectRight: {
    textAlign: "right",
    width: "100%",
    margin: "0 0 30px 0",
    direction: "rtl"
  },
  failedText: {
    color: "red"
  },
  formButton: {
    width: "100%",
    padding: "20px",
    margin: "25px 0 40px"
  },
  clearButton: {
    width: "100%",
    padding: "10px",
    margin: "0"
  },
  formControl: {
    width: "100%"
  },
  formControlLabel: {
    width: "100%"
  },
  formControlDate: {
    width: "15%",
    minWidth: "80px"
  },
  formLabel: {
    margin: "10px 0"
  },
  formHelperText: {
    margin: "-25px 0 30px 0"
  },
  checkboxErrorText: {
    margin: "-10px 0 10px 0"
  },
  formGroup: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start"
  },
  formGroup2ColShort: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    width: "280px"
  },
  formGroupTopMargin: {
    marginTop: "30px"
  },
  input: {
    width: "100%",
    margin: "0 0 30px 0"
  },
  controlCheckbox: {
    margin: "-35px 0 0 0"
  },
  controlCheckboxMargin: {
    margin: "-35px 0 40px 0"
  },
  controlCheckboxMarginBold: {
    margin: "-35px 0 40px 0",
    fontWeight: 700
  },
  controlCheckboxMarginBoldSpacer: {
    margin: "0 0",
    fontWeight: 700
  },
  formHelperTextLegal: {
    margin: "-50px 0 50px 0",
    fontSize: "14px",
    lineHeight: "1.2em"
  },
  sigBox: {
    border: "1px solid lightgrey",
    "border-radius": "5px",
    margin: "0 0 32px",
    width: "100%"
  },
  buttonLink: {
    background: "none",
    border: "none",
    padding: "0",
    font: " inherit",
    "border-bottom": "1px solid blue",
    cursor: " pointer",
    color: "blue"
  },
  horizRadio: {
    display: "flex",
    flexDirection: "row"
  },
  horizRadioCenter: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    margin: "auto",
    textAlign: "center"
  },
  horizRadioBold: {
    fontWeight: 700
  },
  paymentCopy: {
    paddingBottom: "1.5em"
  },
  details: {
    display: "flex",
    flexDirection: "column"
  },
  content: {
    flex: "1 0 auto"
  },
  cover: {
    minWidth: "200px",
    minHeight: "200px"
  },
  pullQuote: {
    textIndent: "20px"
  },
  suggestedAmounts: {
    display: "block",
    flexWrap: "wrap",
    margin: "0 -1.666666666666667% 13px",
    paddingTop: "20px",
    marginTop: "15px",
    backgroundColor: "#FBE796"
  },
  suggestedAmountBoxes: {
    flexDirection: "row",
    flexWrap: "nowrap"
  },
  suggestedAmountBox: {
    width: "21%",
    height: "60px",
    margin: "13px 1.666666666666667% 0",
    display: "inline-block"
  },
  boxLabel: {
    height: "100%",
    fontSize: 20,
    lineHeight: "60px",
    fontWeight: 300,
    color: "#4C4C4C",
    textAlign: "center",
    border: "1px solid #C4C3C3",
    borderRadius: "3px",
    display: "block",
    transition:
      "color 0.1s, background-color 0.1s, border-color 0.1s, font-weight 0.1s",
    position: "relative",
    cursor: "pointer",
    margin: 0
  },
  boxInput: {
    float: "left",
    opacity: 0,
    width: 0,
    height: 0,
    position: "absolute",
    padding: 0,
    margin: 0,
    border: 0,
    "&:focus + label": {
      outline: "rgba(83,16,120, 0.5) auto 3px"
    },
    "&:checked + label": {
      borderColor: "#531078",
      color: "#531078",
      borderWidth: "2px",
      fontWeight: 700
    },
    "&:checked + $boxLabel": {
      borderColor: "#531078",
      color: "#531078",
      borderWidth: "2px",
      fontWeight: 700
    }
  },
  capeAmount: {
    display: "flex",
    flexDirection: "row",
    width: "100%"
  },
  boxCurrency: {
    fontSize: 14,
    lineHeight: "14px",
    fontWeight: 400,
    verticalAlign: "text-top",
    position: "absolute",
    top: 22,
    left: -22,
    whiteSpace: "nowrap"
  },
  boxItem: {
    position: "absolute",
    height: "100%"
  },
  boxAmount: {
    position: "relative",
    left: -10
  },
  radioLabel: {
    textAlign: "center"
  },
  bodyCenter: {
    width: "100%",
    textAlign: "center"
  },
  checkboxLabelBold: {
    "& span": {
      fontWeight: "700 !important"
    }
  },
  checkboxLabelMini: {
    "& span": {
      fontWeight: "400 !important",
      fontSize: 14
    }
  }
};

// helper functions for localization package when translating labels
// this is required so that only the label is translated and the not value
// of select, checkbox, and text inputs
export const inputLabelTranslateHelper = (id, label, t) => {
  // console.log(`id, label: ${id}, ${label}`);
  // console.log(`t(id): ${t(id)}`);
  if (t(id) === id) {
    // console.log(`t(id): ${t(id)}`);
    // console.log(`missingKey: ${id}, ${label}`);
    return label;
  } else {
    return t(id);
  }
};
export const optionsLabelTranslateHelper = (id, item, t) => {
  let translatedLabel;
  if (id.includes("State")) {
    return item;
  }
  if (parseInt(item, 10)) {
    return item;
  }
  if (id.includes("employer")) {
    translatedLabel = t(camelCaseConverter(item));
  } else {
    translatedLabel = t(item.toLowerCase());
  }
  if (translatedLabel === camelCaseConverter(item)) {
    return item;
  } else {
    return translatedLabel;
  }
};

// custom MUI friendly TEXT input with translated label
export const renderTextField = ({
  input,
  id,
  name,
  label,
  meta: { touched, error },
  classes,
  twocol,
  short,
  mobile,
  t,
  additionalOnChange,
  dataTestId,
  ...custom
}) => {
  return (
    <Translation>
      {(t, { i18n }) => (
        <TextField
          label={inputLabelTranslateHelper(id, label, t)}
          InputLabelProps={{ htmlFor: id }}
          error={!!(touched && error)}
          variant="outlined"
          style={
            twocol && !mobile
              ? { width: "48%" }
              : short
              ? { width: 150 }
              : { marginBottom: 30, width: "100%" }
          }
          helperText={touched && error}
          required={!!(touched && error)}
          {...input}
          {...custom}
          data-testid={dataTestId}
          inputProps={{
            id: id,
            "aria-label": inputLabelTranslateHelper(id, label, t)
          }}
          onBlur={event => {
            input.onBlur();
            if (additionalOnChange) {
              additionalOnChange(event);
            }
          }}
        />
      )}
    </Translation>
  );
};

const selectStyle = align => (align === "right" ? { direction: "ltr" } : {});

export const languageMap = {
  English: "en",
  Español: "es",
  Русский: "ru",
  "Tiếng Việt": "vi",
  简体中文: "zh"
};

export const LanguagePicker = React.forwardRef((props, ref) => {
  return (
    <Translation>
      {(t, { i18n }) => (
        <FormControl
          variant="outlined"
          // className={props.classes.languagePicker}
        >
          <InputLabel
            htmlFor={props.id}
            sx={{
              color: "white !important",
              // marginTop: "-2px",
              marginLeft: "25px",
              padding: "0 4px",
              backgroundColor: "#2c0940 !important"
              // className={props.classes.languagePickerLabel}
            }}
            classes={{
              shrink: props.classes.labelShrink,
              focused: props.classes.labelFocused,
              outlined: props.classes.labelOutlined
            }}
          >
            {inputLabelTranslateHelper(props.id, props.label, t)}
          </InputLabel>
          <Select
            native
            autoWidth={true}
            onChange={props.onChange}
            startAdornment={
              <InputAdornment
                position="start"
                sx={{
                  color: "white"
                }}
              >
                <LanguageIcon />
              </InputAdornment>
            }
            input={
              <OutlinedInput
                inputRef={ref}
                classes={{
                  notchedOutline: props.classes.notched,
                  adornedStart: props.classes.adornedStart
                }}
                className={props.classes.lpInput}
                sx={{
                  border: "1px solid white",
                  paddingLeft: "7px !important",
                  "& .MuiSvgIcon-root": {
                    color: "white"
                  }
                }}
                // labelWidth={100}
                style={{
                  width: 195,
                  color: "white"
                }}
                size="small"
                notched={false}
                value={props.userSelectedLanguage}
                inputProps={{
                  id: props.id,
                  style: {
                    height: 30,
                    width: 195,
                    padding: "0px 15px",
                    borderColor: "white",
                    color: "white",
                    borderRadius: 4
                  }
                }}
              />
            }
            // value={props.input.value}
            // onChange={props.input.onChange}
            data-testid="component-select"
            variant="standard"
          >
            {props.options.map(item => (
              <option key={shortid()} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </Translation>
  );
});

// custom MUI friendly SELECT input with translated label
export const renderSelect = ({
  input,
  name,
  id,
  label,
  classes,
  align,
  meta: { error, touched },
  // labelWidth,
  style,
  options,
  short,
  mobile,
  formControlName,
  dataTestId,
  ...custom
}) => (
  <Translation>
    {(t, { i18n }) => {
      // console.log(input.onChange);
      // console.log(name);
      // console.log(id);
      // console.log(input.value);
      return (
        <FormControl
          variant="outlined"
          // className={classes[formControlName] || classes.formControl}
          error={!!(error && touched)}
          {...custom}
          required={touched && error === "Required"}
          style={
            short
              ? { width: 80 }
              : // : mobile
                // ? { width: "100%" }
                { width: "100%" }
          }
        >
          <InputLabel htmlFor={id} id={`${id}Label`}>
            {inputLabelTranslateHelper(id, label, t)}
          </InputLabel>
          <Select
            native
            input={
              // <OutlinedInput labelWidth={labelWidth} inputProps={{ id: id }} />
              <OutlinedInput
                inputProps={{
                  id: id,
                  name: name,
                  style: { ...style },
                  "aria-labelledby": `${id}Label`
                }}
              />
            }
            // className={align === "right" ? classes.selectRight : classes.select}
            sx={
              align === "right"
                ? {
                    textAlign: "right",
                    width: "100%",
                    margin: "0 0 30px 0",
                    direction: "rtl"
                  }
                : {
                    width: "100%",
                    margin: "0 0 30px 0"
                  }
            }
            value={input.value ? input.value.toLowerCase() : ""}
            onChange={input.onChange}
            {...custom}
            data-testid={dataTestId}
            variant="standard"
          >
            {options &&
              options.map(item => (
                <option
                  key={shortid()}
                  data-testid={item}
                  value={item ? item.toLowerCase() : ""}
                  style={selectStyle(align)}
                >
                  {optionsLabelTranslateHelper(id, item, t)}
                </option>
              ))}
          </Select>
        </FormControl>
      );
    }}
  </Translation>
);

// custom MUI friendly CHECKBOX input with translated label
export const renderCheckbox = ({
  input,
  label,
  id,
  validate,
  classes,
  meta: { touched, error },
  formControlName,
  bold,
  mini,
  block,
  dataTestId,
  ...custom
}) => (
  <Translation>
    {(t, { i18n }) => {
      const boldClass = {
        "& span": {
          fontWeight: "700 !important",
          margin: "0 0"
        }
      };
      const miniClass = {
        "& span": {
          fontWeight: "400 !important",
          fontSize: 14,
          margin: "0 0 35px 0"
        }
      };
      const blockClass = {
        display: "block !important"
      };
      return (
        <FormControl
          error={!!(touched && error)}
          // className={classes[formControlName] || classes.formControl}
          variant="standard"
          sx={block ? blockClass : {}}
        >
          <Box
            sx={bold ? boldClass : mini ? miniClass : block ? blockClass : {}}
          >
            <FormControlLabel
              label={inputLabelTranslateHelper(id, label, t)}
              control={
                <Checkbox
                  color="primary"
                  checked={input.value ? true : false}
                  {...custom}
                  {...input}
                  // className={classes.checkbox}
                  data-testid="component-checkbox"
                  name="checkbox"
                  inputProps={{ id: id }}
                  data-testid={dataTestId}
                />
              }
            />
          </Box>
          {touched && error && (
            <FormHelperText
              // className={classes.checkboxErrorText}
              sx={{
                margin: "-10px 0 10px 0"
              }}
            >
              {error}
            </FormHelperText>
          )}
        </FormControl>
      );
    }}
  </Translation>
);

export const renderCAPERadioGroup = ({
  input,
  label,
  id,
  options,
  validate,
  classes,
  direction,
  meta: { touched, error },
  formControlName,
  legendClass,
  dataTestId,
  ...custom
}) => (
  <Translation>
    {(t, { i18n }) => (
      <FormControl
        component="fieldset"
        error={!!(touched && error)}
        // className={classes[formControlName] || classes.formControl}
        sx={{
          width: "100%"
        }}
        variant="standard"
      >
        <FormLabel
          component="legend"
          // className={classes.capeRadioLabel}
          sx={{
            fontSize: "1.2em",
            color: "#531078", // medium purple // theme.palette.primary.light
            fontWeight: 700,
            textAlign: "center"
          }}
        >
          {t(id)}
        </FormLabel>

        <RadioGroup
          data-testid="component-cape-radio-group"
          aria-label={formControlName}
          name={formControlName}
          id={formControlName}
          // className={classes.horizGroup}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}
          onChange={input.onChange}
          data-testid={dataTestId}
        >
          {options &&
            options.map(item => {
              let labelText = `$${item}`;
              if (item === "Other") {
                labelText = inputLabelTranslateHelper(item, item, t);
              }
              return (
                <FormControlLabel
                  key={shortid()}
                  value={item}
                  // className={classes.suggestedAmountBox}
                  sx={{
                    width: "21%",
                    height: "60px",
                    margin: "13px 1.666666666666667% 0",
                    display: {
                      xs: "flex",
                      sm: "inline-block"
                    },
                    textAlign: "center"
                  }}
                  label={labelText}
                  labelPlacement="bottom"
                  control={
                    <Radio
                      checked={item.toString() === input.value.toString()}
                      color="primary"
                      inputProps={{ id: id }}
                      data-testid="component-radio"
                      style={{ paddingBottom: 0 }}
                    />
                  }
                />
              );
            })}
        </RadioGroup>
        {touched && error && (
          <FormHelperText
            // className={classes.checkboxErrorText}
            sx={{
              margin: "-10px 0 10px 0",
              textAlign: "center"
            }}
          >
            {error}
          </FormHelperText>
        )}
      </FormControl>
    )}
  </Translation>
);

export const blankSig =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCABkAlIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k=";

export const submTableFieldList = [
  { title: "Submission Status", field: "submission_status", hidden: false },
  {
    title: "Submission Date",
    field: "submission_date",
    hidden: false,
    render: rowData => formatDateTime(rowData.submission_date),
    defaultSort: "desc"
  },
  { title: "Submission Errors", field: "submission_errors", hidden: false },
  { title: "First Name", field: "first_name", hidden: false },
  { title: "Last Name", field: "last_name", hidden: false },
  { title: "Home Email", field: "home_email", hidden: false },
  { title: "Employer", field: "employer_name", hidden: false },
  {
    title: "Online Campaign Source",
    field: "online_campaign_source",
    hidden: false
  },
  { title: "Contact ID", field: "salesforce_id", hidden: false },
  { title: "IP Address", field: "ip_address", hidden: false },
  { title: "Agency Number", field: "agency_number", hidden: false },
  { title: "Subdivision", field: "account_subdivision", hidden: false },
  { title: "Birthdate", field: "birthdate", hidden: true },
  { title: "Cell Phone", field: "cell_phone", hidden: true },
  { title: "Home Street", field: "home_street", hidden: true },
  { title: "Home City", field: "home_city", hidden: true },
  { title: "Home State", field: "home_state", hidden: true },
  { title: "Home Zip", field: "home_zip", hidden: true },
  { title: "Preferred Language", field: "preferred_language", hidden: true },
  { title: "termsagree", field: "terms_agree", hidden: true },
  { title: "Signature", field: "signature", hidden: true },
  {
    title: "Text Authorization Opt Out",
    field: "text_auth_opt_out",
    hidden: true
  },
  { title: "Legal Language", field: "legal_language", hidden: true },
  {
    title: "Maintenance of Effort",
    field: "maintenance_of_effort",
    hidden: true
  },
  {
    title: "503 CBA App Date",
    field: "seiu503_cba_app_date",
    type: "date",
    render: rowData => formatDateTime(rowData.seiu503_cba_app_date),
    hidden: true
  },
  {
    title: "Direct Pay Authorization",
    field: "direct_pay_auth",
    type: "date",
    render: rowData => formatDateTime(rowData.direct_pay_auth),
    hidden: true
  },
  {
    title: "Direct Deposit Authorization",
    field: "direct_deposit_auth",
    type: "date",
    render: rowData => formatDateTime(rowData.direct_deposit_auth),
    hidden: true
  },
  {
    title: "Immediate Past Member Status",
    field: "immediate_past_member_status",
    hidden: true
  },
  { title: "Dues Day", field: "deduction_day_of_month", hidden: true },
  {
    title: "Active Account Last 4",
    field: "active_method_last_four",
    hidden: true
  },
  { title: "Unioni.se MemberID", field: "member_short_id", hidden: true },
  { title: "Payment Method", field: "payment_method", hidden: true },
  {
    title: "AFH Number of Residents",
    field: "medicaid_residents",
    hidden: true
  },
  { title: "Job Class/Title", field: "job_title", hidden: true },
  { title: "Legal Language", field: "cape_legal", hidden: true },
  { title: "CAPE Amount", field: "cape_amount", hidden: true },
  { title: "Employer Type", field: "employer_type", hidden: true },
  { title: "Mail-To City", field: "mail_to_city", hidden: true },
  { title: "Mail-To State/Province", field: "mail_to_state", hidden: true },
  { title: "Mail-To Street", field: "mail_to_street", hidden: true },
  {
    title: "Mail-To Zip/Postal Code",
    field: "mail_to_postal_code",
    hidden: true
  },
  { title: "Ethnicity", field: "ethnicity", hidden: true },
  { title: "LGBTQIA+ ID", field: "lgbtq_id", hidden: true },
  { title: "Trans ID", field: "trans_id", hidden: true },
  { title: "Disability ID", field: "disability_id", hidden: true },
  {
    title: "Deaf or hard-of-hearing",
    field: "deaf_or_hard_of_hearing",
    hidden: true
  },
  {
    title: "Blind or visually impaired",
    field: "blind_or_visually_impaired",
    hidden: true
  },
  { title: "Gender", field: "gender", hidden: true },
  {
    title: "Gender Other - Description",
    field: "gender_other_description",
    hidden: true
  },
  { title: "Pronouns", field: "gender_pronoun", hidden: true },
  {
    title: "Hire date",
    field: "hire_date",
    hidden: true,
    type: "date",
    render: rowData => formatDate(rowData.hire_date)
  },
  { title: "Worksite", field: "worksite", hidden: true },
  { title: "Work Phone", field: "work_phone", hidden: true },
  { title: "Work email", field: "work_email", hidden: true }
];

export const renderImage = rowData => {
  if (rowData.content_type === "image") {
    const filename = rowData.content.split(".s3-us-west-2.amazonaws.com/")[1];
    return <img src={rowData.content} height="100" alt={filename} />;
  } else {
    return "";
  }
};

export const renderText = rowData => {
  if (rowData.content_type === "image") {
    return rowData.content.split(".s3-us-west-2.amazonaws.com/")[1];
  } else {
    return rowData.content;
  }
};

export const renderDate = rowData => formatDateTime(rowData.updated_at);

export const contentTableFieldList = [
  { title: "Id", field: "id", hidden: false },
  { title: "Content Type", field: "content_type", hidden: false },
  {
    title: "Image",
    field: "content",
    hidden: false,
    render: renderImage
  },
  {
    title: "Text",
    field: "content",
    hidden: false,
    render: renderText
  },
  {
    title: "Updated At",
    field: "updated_at",
    hidden: false,
    defaultSort: "desc",
    render: renderDate
  }
];

TextField.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrop: PropTypes.func,
    onFocus: PropTypes.func,
    value: PropTypes.string
  }),
  name: PropTypes.string,
  label: PropTypes.string,
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  helperText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.element
  ])
};
Select.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrop: PropTypes.func,
    onFocus: PropTypes.func,
    value: PropTypes.string
  }),
  name: PropTypes.string,
  label: PropTypes.string,
  style: PropTypes.object,
  formControlName: PropTypes.string,
  options: PropTypes.array,
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
Checkbox.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrop: PropTypes.func,
    onFocus: PropTypes.func,
    value: PropTypes.string
  }),
  name: PropTypes.string,
  label: PropTypes.string,
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  checked: PropTypes.bool
};
FormControl.propTypes = {
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
