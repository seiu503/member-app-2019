import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./styles/css/index.css";
import App from "./App";
import store from "./store/store";
import { ThemeProvider } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/material";
import theme from "./styles/theme";
import ScrollToTop from "./components/ScrollToTop";
import { I18nextProvider } from "react-i18next";
import i18n from "./translations/i18n";

// global.fetch = require("node-fetch");

render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n} defaultNS={"translation"}>
      <BrowserRouter>
        <ScrollToTop>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </ScrollToTop>
      </BrowserRouter>
    </I18nextProvider>
  </Provider>,
  document.getElementById("root")
);
