import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { withLocalize, setActiveLanguage } from "react-localize-redux";
import { renderToStaticMarkup } from "react-dom/server";
import Recaptcha from "react-google-invisible-recaptcha";
import queryString from "query-string";
import { Translate } from "react-localize-redux";

import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import * as Actions from "./store/actions";
import * as apiContentActions from "./store/actions/apiContentActions";
import * as apiProfileActions from "./store/actions/apiProfileActions";
import * as apiSubmissionActions from "./store/actions/apiSubmissionActions";
import { detectDefaultLanguage, defaultWelcomeInfo } from "./utils/index";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import FormThankYou from "./components/FormThankYou";
import NoAccess from "./components/NoAccess";
import NotFound from "./components/NotFound";
import Logout from "./containers/Logout";
import Login from "./components/Login";
import Dashboard from "./containers/Dashboard";
import TextInputForm from "./containers/TextInputForm";
import SubmissionFormPage1 from "./containers/SubmissionFormPage1";
import SubmissionFormPage2 from "./containers/SubmissionFormPage2";
import Notifier from "./containers/Notifier";
import ContentLibrary from "./containers/ContentLibrary";
import Spinner from "./components/Spinner";
import LinkRequest from "./containers/LinkRequest";
import UserForm from "./containers/UserForm";

import SamplePhoto from "./img/sample-form-photo.jpg";

import globalTranslations from "./translations/globalTranslations";
import welcomeInfo from "./translations/welcomeInfo.json";

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
    // backgroundImage: `url("${SamplePhoto}")`,
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
    // this.recaptcha = React.createRef();
    this.main_ref = React.createRef();
    this.legal_language = React.createRef();
    this.cape_legal = React.createRef();
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
      more: false,
      headline: {
        text: defaultWelcomeInfo.headline,
        id: 0
      },
      body: {
        text: defaultWelcomeInfo.body,
        id: 0
      },
      image: {}
    };
    this.props.addTranslation(globalTranslations);
    this.setRedirect = this.setRedirect.bind(this);
    this.onResolved = this.onResolved.bind(this);
  }

  componentDidMount() {
    console.log("188");
    console.log(`NODE_ENV front end: ${process.env.REACT_APP_ENV_TEXT}`);
    const defaultLanguage = detectDefaultLanguage();
    this.props.setActiveLanguage(defaultLanguage);
    console.log("192");
    // If not logged in, check local storage for authToken
    // if it doesn't exist, it returns the string "undefined"
    if (!this.props.appState.loggedIn) {
      // don't run this sequence if landing on admin dash for first time
      // after google auth -- there will be nothing in localstorage yet
      if (!(this.props.match && this.props.match.params.id)) {
        // console.log("not logged in, looking for id & token in localStorage");
        const authToken = window.localStorage.getItem("authToken");
        const userId = window.localStorage.getItem("userId");
        // console.log(`authToken: ${!!authToken}, userId: ${userId}`);
        if (
          authToken &&
          authToken !== "undefined" &&
          userId &&
          userId !== "undefined"
        ) {
          // console.log("found id & token in localstorage, validating token");
          // console.log(!!authToken, userId);
          this.props.apiProfile
            .validateToken(authToken, userId)
            .then(result => {
              // console.log(result.type);
              if (result.type === "VALIDATE_TOKEN_FAILURE") {
                // console.log("VALIDATE_TOKEN_FAILURE: clearing localStorage");
                return window.localStorage.clear();
              }
              if (
                result.type === "VALIDATE_TOKEN_SUCCESS" &&
                authToken &&
                authToken !== "undefined" &&
                userId &&
                userId !== "undefined"
              ) {
                // console.log(
                //   `validate token success: ${!!authToken}, ${userId}`
                // );
                this.props.apiProfile
                  .getProfile(authToken, userId)
                  .then(result => {
                    // console.log(result.type);
                    if (result.type === "GET_PROFILE_SUCCESS") {
                      // console.log(
                      //   `setting user type here: ${result.payload.type}`
                      // );
                      this.props.actions.setLoggedIn(result.payload.type);
                      // check for redirect url in local storage
                      const redirect = window.localStorage.getItem("redirect");
                      if (redirect) {
                        // redirect to originally requested page and then
                        // clear value from local storage
                        this.props.history.push(redirect);
                        window.localStorage.removeItem("redirect");
                      }
                    } else {
                      // console.log("not logged in", authToken, userId);
                      // console.log(result.type);
                    }
                  });
              }
            })
            .catch(err => {
              console.log(err);
              return window.localStorage.clear();
            });
        }
      }
    }
    console.log("260");
    const values = queryString.parse(this.props.location.search);
    // fetch dynamic content
    if (values.h || values.b || values.i) {
      const { h, i, b } = values;
      let idArray = [h, i, b];
      const queryIds = idArray.filter(id => (id ? id : null));
      queryIds.forEach(id => {
        this.props.apiContent
          .getContentById(id)
          .then(result => {
            if (!result || result.payload.message) {
              console.log(
                result.payload.message ||
                  "there was an error loading the content"
              );
            } else {
              console.log("277");
              switch (result.payload.content_type) {
                case "headline":
                  return this.setState({
                    headline: {
                      text: result.payload.content,
                      id: id
                    }
                  });
                case "bodyCopy":
                  return this.setState({
                    body: {
                      text: result.payload.content,
                      id: id
                    }
                  });
                case "image":
                  console.log("293");
                  return this.setState({
                    image: {
                      url: result.payload.content,
                      id: id
                    }
                  });
                default:
                  break;
              }
            }
          })
          .catch(err => {
            // console.log(err);
          });
      });
    }
  }

  renderBodyCopy = id => {
    let paragraphIds = [];
    // find all paragraphs belonging to this bodyCopy id
    Object.keys(welcomeInfo).forEach(key => {
      if (key.includes(`bodyCopy${id}`)) {
        paragraphIds.push(key);
      }
    });
    // for each paragraph selected, generate translated text
    // in appropriate language rendered inside a <p> tag
    let paragraphs = (
      <React.Fragment>
        {paragraphIds.map((id, index) => (
          <p key={id}>
            <Translate id={id} />
          </p>
        ))}
      </React.Fragment>
    );
    // if this body copy has not yet been translated there will be no
    // translation ids in the welcomeInfo JSON object
    // just render the raw copy in English
    if (!paragraphIds.length) {
      let paragraphsRaw = this.state.body.text.split("\n");
      paragraphs = (
        <React.Fragment>
          {paragraphsRaw.map((paragraphString, index) => (
            <p key={index}>{paragraphString}</p>
          ))}
        </React.Fragment>
      );
    }
    // wrap in MUI typography element and return
    return (
      <Typography
        variant="body1"
        component="div"
        align="left"
        gutterBottom
        className={this.props.classes.body}
        data-test="body"
      >
        {paragraphs}
      </Typography>
    );
  };

  async onResolved() {
    const token = await this.recaptcha.getResponse();
    // console.log(token);
    this.props.apiSubmission.handleInput({
      target: { name: "reCaptchaValue", value: token }
    });
  }

  setRedirect() {
    const currentPath = this.props.history.location.pathname;
    window.localStorage.setItem("redirect", currentPath);
  }

  // resubmit submission and deleteSubmission methods here, to be passed to submission table
  // move prepForSubmission method up to App, possibly updateSubmission too?

  render() {
    const { classes } = this.props;
    const { loggedIn, userType, loading } = this.props.appState;
    // console.log(`loggedIn: ${loggedIn}, userType: ${userType}`);
    return (
      <div
        data-test="component-app"
        className={classes.appRoot}
        style={{
          backgroundImage: `url(${
            this.state.image && this.state.image.url
              ? this.state.image.url
              : SamplePhoto
          })`
        }}
      >
        <CssBaseline />
        <Recaptcha
          ref={ref => (this.recaptcha = ref)}
          sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
          onResolved={this.onResolved}
        />
        <NavBar main_ref={this.main_ref} />
        <Notifier />
        {loading && <Spinner />}
        <main className={classes.container} id="main" ref={this.main_ref}>
          <Switch>
            <Route
              exact
              path="/"
              render={routeProps => (
                <SubmissionFormPage1
                  setRedirect={this.setRedirect}
                  legal_language={this.legal_language}
                  cape_legal={this.cape_legal}
                  direct_pay={this.direct_pay}
                  direct_deposit={this.direct_deposit}
                  sigBox={this.sigBox}
                  recaptcha={this.recaptcha}
                  onResolved={this.onResolved}
                  headline={this.state.headline}
                  body={this.state.body}
                  image={this.state.image}
                  renderBodyCopy={this.renderBodyCopy}
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
              render={routeProps => (
                <Dashboard {...routeProps} setRedirect={this.setRedirect} />
              )}
            />
            <Route
              path="/content"
              render={routeProps =>
                loggedIn && ["admin", "edit"].includes(userType) ? (
                  <ContentLibrary
                    setRedirect={this.setRedirect}
                    {...routeProps}
                  />
                ) : (
                  <NoAccess
                    setRedirect={this.setRedirect}
                    classes={this.props.classes}
                    {...routeProps}
                  />
                )
              }
            />
            <Route
              path="/new"
              render={routeProps =>
                loggedIn && ["admin", "edit"].includes(userType) ? (
                  <TextInputForm
                    setRedirect={this.setRedirect}
                    {...routeProps}
                  />
                ) : (
                  <NoAccess
                    setRedirect={this.setRedirect}
                    classes={this.props.classes}
                    {...routeProps}
                  />
                )
              }
            />
            <Route
              path="/edit/:id"
              render={routeProps =>
                loggedIn && ["admin", "edit"].includes(userType) ? (
                  <TextInputForm
                    edit={true}
                    setRedirect={this.setRedirect}
                    {...routeProps}
                  />
                ) : (
                  <NoAccess
                    setRedirect={this.setRedirect}
                    classes={this.props.classes}
                    {...routeProps}
                  />
                )
              }
            />
            <Route
              path="/users"
              render={routeProps =>
                loggedIn && userType === "admin" ? (
                  <UserForm setRedirect={this.setRedirect} {...routeProps} />
                ) : (
                  <NoAccess
                    setRedirect={this.setRedirect}
                    classes={this.props.classes}
                    {...routeProps}
                  />
                )
              }
            />
            <Route
              path="/logout"
              render={routeProps => (
                <Logout classes={this.props.classes} {...routeProps} />
              )}
            />
            <Route
              path="/login"
              render={routeProps => (
                <Login classes={this.props.classes} {...routeProps} />
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
              path="/noaccess"
              render={routeProps => (
                <NoAccess
                  setRedirect={this.setRedirect}
                  classes={this.props.classes}
                  location={this.props.location}
                  {...routeProps}
                />
              )}
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
  content: state.content,
  submission: state.submission
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiProfile: bindActionCreators(apiProfileActions, dispatch),
  apiContent: bindActionCreators(apiContentActions, dispatch),
  setActiveLanguage: bindActionCreators(setActiveLanguage, dispatch)
});

export const AppConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppUnconnected);

export default withStyles(styles)(withRouter(withLocalize(AppConnected)));
