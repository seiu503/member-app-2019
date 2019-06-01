import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";

import * as Actions from "./store/actions";
import * as apiProfileActions from "./store/actions/apiProfileActions";
import * as apiFormMetaActions from "./store/actions/apiFormMetaActions";
// import BASE_URL from "./store/actions/apiConfig.js";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";
import Logout from "./containers/Logout";
import Dashboard from "./containers/Dashboard";
import TextInputForm from "./containers/TextInputForm";
import Notifier from "./containers/Notifier";

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
    padding: 5,
    height: 73,
    [theme.breakpoints.down("sm")]: {
      height: 53
    },
    display: "flex",
    justifyContent: "center",
    alignItems: "middle",
    boxShadow: "0 1px 5px 2px rgba(0,0,0,.2)",
    zIndex: 2
  },
  footerIcon: {
    width: 30,
    height: "auto",
    marginTop: 15,
    [theme.breakpoints.down("sm")]: {
      marginTop: 5
    },
    fill: theme.palette.secondary.main
  }
});

class App extends Component {
  componentDidMount() {
    // If not logged in, check local storage for authToken
    // if it doesn't exist, it returns the string "undefined"
    if (!this.props.appState.loggedIn) {
      console.log("not logged in");
      let token = window.localStorage.getItem("authToken");
      if (token && token !== "undefined") {
        token = JSON.parse(token);
        const userId = JSON.parse(window.localStorage.getItem("userId"));
        if (userId) {
          this.props.apiProfile.validateToken(token, userId).then(result => {
            if (result === "VALIDATE_TOKEN_FAILURE") {
              console.log("validate token failed");
              window.localStorage.clear();
            } else if (result === "VALIDATE_TOKEN_SUCESS") {
              console.log("token validated");
            }
          });
        }
      } else {
        console.log("no token found in local storage");
      }
    } else {
      console.log("logged in");
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <CssBaseline />
        <NavBar
          scroll={this.scroll}
          contact_ref={this.contact_ref}
          about_ref={this.about_ref}
          projects_ref={this.projects_ref}
          skills_ref={this.skills_ref}
        />
        <Notifier />
        <main className={classes.container} id="main">
          <Switch>
            <Route
              exact
              path="/"
              render={routeProps => (
                <React.Fragment>
                  Home
                  {/* <TextInputForm {...routeProps} /> */}
                </React.Fragment>
              )}
            />
            <Route
              path="/admin/:id?/:token?"
              render={routeProps => <Dashboard {...routeProps} />}
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
              path="*"
              render={routeProps => (
                <NotFound classes={this.props.classes} {...routeProps} />
              )}
            />
          </Switch>
        </main>
        <Footer classes={this.props.classes} />
      </React.Fragment>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.shape({
    hash: PropTypes.string
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func
  }).isRequired,
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool,
    authToken: PropTypes.string
  }).isRequired,
  apiProfile: PropTypes.shape({
    validateToken: PropTypes.func
  }).isRequired,
  apiFormMetaActions: PropTypes.shape({
    addFormMeta: PropTypes.func,
    deleteFormMeta: PropTypes.func,
    clearForm: PropTypes.func
  }).isRequired,
  formMeta: PropTypes.shape({
    form: PropTypes.shape({
      formMetaType: PropTypes.string,
      content: PropTypes.string
    }),
    error: PropTypes.string,
    deleteDialogOpen: PropTypes.bool,
    currentFormMeta: PropTypes.shape({
      formMetaType: PropTypes.string,
      content: PropTypes.string
    })
  }).isRequired,
  profile: PropTypes.shape({
    profile: PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string
    })
  }).isRequired
};

const mapStateToProps = state => ({
  appState: state.appState,
  profile: state.profile,
  formMeta: state.formMeta
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
  apiFormMetaActions: bindActionCreators(apiFormMetaActions, dispatch),
  apiProfile: bindActionCreators(apiProfileActions, dispatch)
});

export default withStyles(styles)(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(App)
  )
);
