import React from "react";
import '@testing-library/jest-dom';
import { within } from "@testing-library/dom";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import * as utils from "../../utils";
import { storeFactory } from "../../utils/testUtils";
const theme = createTheme(adaptV4Theme);
import {
  I18nextProvider,
  useTranslation,
  withTranslation
} from "react-i18next";
import i18n from "../../translations/i18n";

import WelcomeInfo, {
  WelcomeInfoUnconnected
} from "../../components/WelcomeInfo";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store, wrapper;

const initialState = {
  appState: {
    headline: {
    id: 1,
    text: ""
  },
    image: {
      id: 2,
      url: "blah"
    },
    body: {
      id: 3,
      text: ""
    },
    snackbar: {},
    loading: false
  }, 
};

const defaultProps = {
  location: {
    search: ""
  },
  appState: {
    loggedIn: false,
    authToken: "",
    loading: false,
    userType: "",
    tab: undefined,
    spf: false,
    userSelectedLanguage: "",
    embed: false,
    headline: {
      text: "",
      id: 0
    },
    body: {
      text: "",
      id: 0
    },
    image: {},
    snackbar: {
      open: false,
      variant: "info",
      message: null
    },
    open: false,
    capeOpen: false,
    legalLanguage: "",
    displayCapePaymentFields: false
  },  
  actions: {
    setTab: jest.fn(),
    setSpinner: jest.fn(),
    setSPF: jest.fn(),
    setEmbed: jest.fn(),
    setUserSelectedLanguage: jest.fn(),
    setSnackbar: jest.fn(),
    setOpen: jest.fn(),
    setCapeOpen: jest.fn(),
    setLegalLanguage: jest.fn(),
    setDisplayCapePaymentFields: jest.fn()
  },
  classes: {},
  renderBodyCopy: jest.fn(),
  renderHeadline: jest.fn()
};

store = storeFactory(initialState);

const setup = (props = {}) => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <WelcomeInfoUnconnected {...setupProps} {...props} />
      </Provider>
    </ThemeProvider>
  );
};

const connectedSetup = (props = {}) => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <WelcomeInfo {...setupProps} {...props} />
        </I18nextProvider>
      </Provider>
    </ThemeProvider>
  );
};

describe("<WelcomeInfo />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup();
    const component = getByTestId("component-welcome-info");
    expect(component).toBeInTheDocument();
  });

  it("renders connected component", () => {
    const { getByTestId } = connectedSetup();
    const component = getByTestId("component-welcome-info");
    expect(component).toBeInTheDocument();
  });
});
