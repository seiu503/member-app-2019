import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
import Recaptcha from "react-google-invisible-recaptcha";

// const rtl = require('@testing-library/react')

// const AllTheProviders = ({children}) => {
//   return (
//     <ThemeProvider theme={theme}>
//       {children}
//     </ThemeProvider>
//   )
// }

// const customRender = (ui, options) =>
//   render(ui, {wrapper: AllTheProviders, ...options})

// const customRender = (ui, options) =>
//   rtl.render(ui, {
//     wrapper: AllTheProviders,
//     ...options,
//   });

// module.exports = {
//   ...rtl,
//   render: customRender,
// }

// // re-export everything
// export * from '@testing-library/react'

// // override render method
// export {customRender as render}

Enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true
});

global.fetch = require("jest-fetch-mock");
global.canvas = require("jest-canvas-mock");

const Environment = require("jest-environment-jsdom");

// let mockRecaptchaV2 = React.forwardRef((props, ref) => {
//     React.useImperativeHandle(ref, () => ({
//       reset: jest.fn(),
//       execute: jest.fn(),
//       executeAsync: jest.fn(() => 'token'),
//     }));
//     return <input ref={ref} type="checkbox" data-testid="mock-v2-captcha-element" {...props} />;
//   });

// jest.doMock('react-google-invisible-recaptcha', () => ({
//   default: mockRecaptchaV2
// }));

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

/**
 * A custom environment to set the TextEncoder
 */
// module.exports = class CustomTestEnvironment extends Environment {
//   constructor({ globalConfig, projectConfig }, context) {
//     super({ globalConfig, projectConfig }, context);
//     if (typeof this.global.TextEncoder === "undefined") {
//       const { TextEncoder } = require("util");
//       this.global.TextEncoder = TextEncoder;
//     }
//   }
// };

module.exports = {
  testEnvironment: "jsdom"
};

// export class CustomTestEnvironment extends Environment {
//   constructor({ globalConfig, projectConfig }, context) {
//     super({ globalConfig, projectConfig }, context);
//     if (typeof this.global.TextEncoder === "undefined") {
//       const { TextEncoder } = require("util");
//       this.global.TextEncoder = TextEncoder;
//     }
//   }
// };
