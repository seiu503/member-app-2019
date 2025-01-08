import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
import Recaptcha from "react-google-invisible-recaptcha";
import { TextEncoder } from 'node:util'

global.TextEncoder = TextEncoder;

global.fetch = require("jest-fetch-mock");

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const Environment = require("jest-environment-jsdom");

jest.doMock("react-google-invisible-recaptcha", () => {
  const RecaptchaV2 = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(),
      execute: jest.fn().mockImplementation(() => {
        // console.log('mockExecute');
        Promise.resolve(0.9);
      }),
      executeAsync: jest.fn(() => "token"),
      getResponse: jest.fn().mockImplementation(() => {
        console.log("getResponse");
        Promise.resolve("token");
      })
    }));
    return <input ref={ref} data-testid="mock-v2-captcha-element" />;
  });

  return RecaptchaV2;
});

// jest.mock('react-i18next', () => ({
//   // this mock makes sure any components using the translate hook can use it without a warning being shown
//   useTranslation: () => {
//     return {
//       t: (str) => str,
//       i18n: {
//         changeLanguage: () => new Promise(() => {}),
//       },
//     };
//   },
// }));

module.exports = {
  testEnvironment: "jsdom"
};
