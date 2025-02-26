import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
// import Recaptcha from "react-google-invisible-recaptcha";
import { TextEncoder } from 'node:util'

global.TextEncoder = TextEncoder;

global.fetch = require("jest-fetch-mock");

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// let windowSpy;
// // append and load gRecaptcha script
// const script = document.createElement("script")
// script.src = "https://www.google.com/recaptcha/enterprise.js?render=6LcIuOIqAAAAALoIbgk8ij8a_wggmfj8cQDyD_iW"
// document.body.appendChild(script)

// windowSpy = jest.spyOn(window, "window", "grecaptcha");
// windowSpy.mockImplementation(() => ({
//   enterprise: {
//     execute: jest.fn().mockImplementation(() => {
//       Promise.resolve("token")
//     })
//   }
// }));


// afterAll(() => {
//   windowSpy.mockRestore();
// });

const Environment = require("jest-environment-jsdom");

// jest.useFakeTimers();

// jest.mock("window.grecaptcha.enterprise", () => {
//   execute: jest.fn().mockImplementation(() => {
//     Promise.resolve("token")
//   })
// });

// grecaptchaMock = jest.spyOn(window.grecaptcha, "enterprise", "execute");
// grecaptchaMock.mockReturnValue(Promise.resolve("token"));

// jest.doMock("react-google-invisible-recaptcha", () => {
//   const RecaptchaV2 = React.forwardRef((props, ref) => {
//     React.useImperativeHandle(ref, () => ({
//       reset: jest.fn(),
//       execute: jest.fn().mockImplementation(() => {
//         // console.log('mockExecute');
//         Promise.resolve(0.9);
//       }),
//       executeAsync: jest.fn(() => "token"),
//       getResponse: jest.fn().mockImplementation(() => {
//         console.log("getResponse");
//         Promise.resolve("token");
//       })
//     }));
//     return <input ref={ref} data-testid="mock-v2-captcha-element" />;
//   });

//   return RecaptchaV2;
// });

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
