import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./styles/css/index.css";
import App from "./App";
import store from "./store/store";
import { unregister } from "./serviceWorker";
import { ThemeProvider } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/material";
import theme from "./styles/theme";
import ScrollToTop from "./components/ScrollToTop";
import { LocalizeProvider } from "react-localize-redux";

global.fetch = require("node-fetch");

render(
  <StyledEngineProvider injectFirst>
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop>
          <ThemeProvider theme={theme}>
            <LocalizeProvider store={store}>
              <App />
            </LocalizeProvider>
          </ThemeProvider>
        </ScrollToTop>
      </BrowserRouter>
    </Provider>
  </StyledEngineProvider>
);
unregister();
