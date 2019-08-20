import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./styles/css/index.css";
import App from "./App";
import store from "./store/store";
import { unregister } from "./serviceWorker";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import theme from "./styles/theme";
import ScrollToTop from "./components/ScrollToTop";
import { LocalizeProvider } from "react-localize-redux";

render(
  <Provider store={store}>
    <LocalizeProvider>
      <BrowserRouter>
        <ScrollToTop>
          <MuiThemeProvider theme={theme}>
            <App />
          </MuiThemeProvider>
        </ScrollToTop>
      </BrowserRouter>
    </LocalizeProvider>
  </Provider>,
  document.getElementById("root")
);
unregister();
