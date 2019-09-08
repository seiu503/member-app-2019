import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { withLocalize, setActiveLanguage } from "react-localize-redux";
import { renderToStaticMarkup } from "react-dom/server";
import { loadReCaptcha, ReCaptcha } from "react-recaptcha-v3";

import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";

import * as Actions from "./store/actions";
import * as apiProfileActions from "./store/actions/apiProfileActions";
import * as apiSubmissionActions from "./store/actions/apiSubmissionActions";
import { detectDefaultLanguage } from "./utils/index";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import FormThankYou from "./components/FormThankYou";
import NotFound from "./components/NotFound";
import Logout from "./containers/Logout";
import Dashboard from "./containers/Dashboard";
import TextInputForm from "./containers/TextInputForm";
import SubmissionFormPage1 from "./containers/SubmissionFormPage1";
import SubmissionFormPage2 from "./containers/SubmissionFormPage2";
import Notifier from "./containers/Notifier";
import ContentLibrary from "./containers/ContentLibrary";
import Spinner from "./components/Spinner";
import LinkRequest from "./containers/LinkRequest";

import SamplePhoto from "./img/sample-form-photo.jpg";

const styles = theme => ({
  root: {
    flexGrow: 1,
    boxSizing: "border-box"
  },
  notFound: {
    height: "80vh",
    width: "auto",
    marginTop: "-60px"
  },
  container: {
    maxWidth: 1200,
    margin: "auto",
    height: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  appRoot: {
    width: "100vw",
    height: "100%",
    minHeight: "80vh",
    backgroundImage: `url("${SamplePhoto}")`,
    backgroundAttachment: "fixed",
    backgroundPosition: "bottom",
    [theme.breakpoints.down("sm")]: {
      backgroundImage: "none"
    },
    [theme.breakpoints.up("xl")]: {
      backgroundSize: "cover"
    }
  },
  message: {
    margin: "auto",
    width: "50%",
    textAlign: "center",
    height: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: "100%"
    },
    lineHeight: "2em",
    background: "white",
    borderRadius: "4px",
    padding: 60,
    fontSize: "1.2em"
  },
  row: {
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      flexWrap: "wrap"
    }
  },
  button: {
    height: 100,
    margin: "20px auto",
    width: 100
  },
  footer: {
    width: "100vw",
    margin: "auto",
    position: "fixed",
    backgroundColor: theme.palette.primary.main,
    bottom: 0,
    padding: 25,
    height: 73,
    [theme.breakpoints.down("sm")]: {
      height: 53
    },
    display: "flex",
    justifyContent: "center",
    alignItems: "middle",
    boxShadow: "0 1px 5px 2px rgba(0,0,0,.2)",
    zIndex: 2,
    color: "white"
  },
  footerIcon: {
    width: 30,
    height: "auto",
    marginTop: 15,
    [theme.breakpoints.down("sm")]: {
      marginTop: 5
    },
    fill: theme.palette.secondary.main
  },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "block"
  },
  form: {
    background: "white"
  }
});

export class AppUnconnected extends Component {
  constructor(props) {
    super(props);
    this.main_ref = React.createRef();
    this.legal_language = React.createRef();
    this.direct_pay = React.createRef();
    this.direct_deposit = React.createRef();
    this.sigBox = React.createRef();
    this.props.initialize({
      languages: [
        { name: "English", code: "en" },
        { name: "Spanish", code: "es" },
        { name: "Russian", code: "ru" },
        { name: "Vietnamese", code: "vi" },
        { name: "Chinese", code: "zh" }
      ],
      options: {
        renderToStaticMarkup,
        renderInnerHtml: false,
        defaultLanguage: "en"
      }
    });
    this.state = {
      deleteDialogOpen: false,
      animation: false,
      more: false
    };
  }

  componentDidMount() {
    // If not logged in, check local storage for authToken
    // if it doesn't exist, it returns the string "undefined"
    if (!this.props.appState.loggedIn) {
      const authToken = window.localStorage.getItem("authToken");
      const userId = window.localStorage.getItem("userId");
      if (
        authToken &&
        authToken !== "undefined" &&
        userId &&
        userId !== "undefined"
      ) {
        this.props.apiProfile
          .validateToken(authToken, userId)
          .then(result => {
            if (result.type === "VALIDATE_TOKEN_FAILURE") {
              window.localStorage.clear();
            }
          })
          .catch(err => console.log(err));
      }
    }
    const defaultLanguage = detectDefaultLanguage();
    this.props.setActiveLanguage(defaultLanguage);
    loadReCaptcha("6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O");
  }

  verifyCallback = recaptchaToken => {
    console.log(recaptchaToken, "<= your recaptcha token");
    this.props.apiSubmission.handleInput({
      target: { name: "reCaptchaValue", value: recaptchaToken }
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div data-test="component-app" className={classes.appRoot}>
        <ReCaptcha
          sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
          action="homepage"
          verifyCallback={this.verifyCallback}
        />
        <CssBaseline />
        <NavBar scroll={this.scroll} main_ref={this.main_ref} />
        <Notifier />
        {this.props.appState.loading && <Spinner />}
        <main className={classes.container} id="main" ref={this.main_ref}>
          <Switch>
            <Route
              exact
              path="/"
              render={routeProps => (
                <SubmissionFormPage1
                  setRedirect={this.setRedirect}
                  legal_language={this.legal_language}
                  direct_pay={this.direct_pay}
                  direct_deposit={this.direct_deposit}
                  sigBox={this.sigBox}
                  verifyCallback={this.verifyCallback}
                  {...routeProps}
                />
              )}
            />
            <Route
              exact
              path="/thankyou"
              render={routeProps => (
                <FormThankYou
                  setRedirect={this.setRedirect}
                  classes={this.props.classes}
                  {...routeProps}
                />
              )}
            />
            <Route
              path="/admin/:id?/:token?"
              render={routeProps => <Dashboard {...routeProps} />}
            />
            <Route
              path="/library"
              render={routeProps => (
                <ContentLibrary
                  setRedirect={this.setRedirect}
                  {...routeProps}
                />
              )}
            />
            <Route
              path="/new"
              render={routeProps => (
                <TextInputForm setRedirect={this.setRedirect} {...routeProps} />
              )}
            />
            <Route
              path="/edit/:id"
              render={routeProps => (
                <TextInputForm
                  edit={true}
                  setRedirect={this.setRedirect}
                  {...routeProps}
                />
              )}
            />
            <Route
              path="/logout"
              render={routeProps => (
                <Logout classes={this.props.classes} {...routeProps} />
              )}
            />
            <Route
              exact
              path="/page2"
              render={routeProps => (
                <SubmissionFormPage2
                  setRedirect={this.setRedirect}
                  {...routeProps}
                />
              )}
            />
            <Route
              exact
              path="/linkrequest"
              render={routeProps => <LinkRequest {...routeProps} />}
            />
            <Route
              path="*"
              render={routeProps => (
                <NotFound classes={this.props.classes} {...routeProps} />
              )}
            />
          </Switch>
        </main>
        <Footer classes={this.props.classes} />
      </div>
    );
  }
}

AppUnconnected.propTypes = {
  classes: PropTypes.object.isRequired,
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool,
    authToken: PropTypes.string
  }).isRequired,
  apiProfile: PropTypes.shape({
    validateToken: PropTypes.func
  }).isRequired,
  apiSubmission: PropTypes.shape({
    handleInput: PropTypes.func
  }).isRequired,
  content: PropTypes.shape({
    form: PropTypes.shape({
      content_type: PropTypes.string,
      content: PropTypes.string
    }),
    error: PropTypes.string,
    deleteDialogOpen: PropTypes.bool,
    currentContent: PropTypes.shape({
      content_type: PropTypes.string,
      content: PropTypes.string
    })
  }).isRequired,
  profile: PropTypes.shape({
    profile: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
      avatar_url: PropTypes.string
    })
  }).isRequired
};

const mapStateToProps = state => ({
  appState: state.appState,
  profile: state.profile,
  content: state.content
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiProfile: bindActionCreators(apiProfileActions, dispatch),
  setActiveLanguage: bindActionCreators(setActiveLanguage, dispatch)
});

export const AppConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppUnconnected);

export default withStyles(styles)(withRouter(withLocalize(AppConnected)));
