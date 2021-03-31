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
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./styles/theme";
import ScrollToTop from "./components/ScrollToTop";
import { LocalizeProvider } from "react-localize-redux";

global.fetch = require("node-fetch");

render(
  <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop>
        <MuiThemeProvider theme={theme}>
          <LocalizeProvider store={store}>
            <App />
          </LocalizeProvider>
        </MuiThemeProvider>
      </ScrollToTop>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
unregister();
