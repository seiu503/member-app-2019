import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";

import * as Actions from "./store/actions";
import * as apiProfileActions from "./store/actions/apiProfileActions";
import * as apiContentActions from "./store/actions/apiContentActions";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import ThankYou from "./components/FormThankYou";
import NotFound from "./components/NotFound";
import Logout from "./containers/Logout";
import Dashboard from "./containers/Dashboard";
import TextInputForm from "./containers/TextInputForm";
import SubmissionFormPage1 from "./containers/SubmissionFormPage1";
import SubmissionFormPage2 from "./containers/SubmissionFormPage2";
import Notifier from "./containers/Notifier";
import ContentLibrary from "./containers/ContentLibrary";
import Spinner from "./components/Spinner";

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
    padding: 60,
    [theme.breakpoints.down("md")]: {
      padding: 20
    },
    margin: "auto",
    height: "100%",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  message: {
    margin: "auto",
    width: "50%",
    textAlign: "center",
    height: "50%",
    lineHeight: "2em"
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
  }
});

export class AppUnconnected extends Component {
  constructor(props) {
    super(props);
    this.main_ref = React.createRef();
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
      const userId = JSON.parse(window.localStorage.getItem("userId"));
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
  }

  render() {
    const { classes } = this.props;
    return (
      <div data-test="component-app">
        <CssBaseline />
        <NavBar scroll={this.scroll} main_ref={this.main_ref} />
        <Notifier />
        {this.props.appState.loading && <Spinner />}
        <main className={classes.container} id="main" ref={this.main_ref}>
          <Switch>
            <Route
              exact
              path="/thankyou"
              render={routeProps => (
                <ThankYou
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
              path="/:id?"
              render={routeProps => (
                <SubmissionFormPage1
                  setRedirect={this.setRedirect}
                  {...routeProps}
                />
              )}
            />
            <Route
              exact
              path="/page2/:id?"
              render={routeProps => (
                <SubmissionFormPage2
                  setRedirect={this.setRedirect}
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
  apiContentActions: PropTypes.shape({
    addContent: PropTypes.func,
    deleteContent: PropTypes.func,
    clearForm: PropTypes.func
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
  apiContentActions: bindActionCreators(apiContentActions, dispatch),
  apiProfile: bindActionCreators(apiProfileActions, dispatch)
});

export const AppConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppUnconnected);

export default withStyles(styles)(withRouter(AppConnected));
