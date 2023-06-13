import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
import Recaptcha from "react-google-invisible-recaptcha";

global.fetch = require("jest-fetch-mock");
global.canvas = require("jest-canvas-mock");

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

module.exports = {
  testEnvironment: "jsdom"
};
