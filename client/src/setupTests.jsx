import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
import { TextEncoder } from 'node:util'

global.TextEncoder = TextEncoder;

global.fetch = require("jest-fetch-mock");

global.setImmediate = jest.useRealTimers;

const Environment = require("jest-environment-jsdom");

beforeEach(() => {
  Object.defineProperty(window, "grecaptcha", {
    configurable: true,
    writable: true,
    value: {
      enterprise: {
        execute: jest
          .fn()
          .mockResolvedValue("test-recaptcha-token")
      }
    }
  });
});

module.exports = {
  testEnvironment: "node"
};
