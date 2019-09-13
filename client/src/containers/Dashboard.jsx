import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

import { openSnackbar } from "./Notifier";
import SubmissionsTable from "./SubmissionsTable";

import * as Actions from "../store/actions";
import * as apiProfileActions from "../store/actions/apiProfileActions";

import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    margin: 20,
    padding: 20,
    maxWidth: 1200
  },
  card: {
    margin: "auto",
    width: "100%",
    maxWidth: 300
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
    position: "relative"
  },
  avatar: {
    width: 80,
    height: 80,
    position: "absolute",
    top: 100,
    left: "calc(50% - 40px)"
  },
  container: {
    height: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  name: {
    color: "primary",
    textAlign: "center",
    marginTop: 15
  }
});

export class DashboardUnconnected extends React.Component {
  componentDidMount() {
    let userId, token;
    // check route params for user id and token
    if (this.props.match && this.props.match.params.id) {
      userId = this.props.match.params.id;
      token = this.props.match.params.token;

      // if logged in for first time through social auth,
      // save userId & token to local storage
      window.localStorage.setItem("userId", userId);
      window.localStorage.setItem("authToken", token);
      this.props.actions.setLoggedIn();
      // remove id & token from route params after saving to local storage
      window.history.replaceState(
        null,
        null,
        `${window.location.origin}/admin`
      );
    } else {
      // if userId is not in route params
      // look in redux store or local storage
      userId =
        this.props.profile.profile._id || window.localStorage.getItem("userId");
      if (window.localStorage.getItem("authToken")) {
        token = window.localStorage.getItem("authToken");
      } else {
        token = this.props.appState.authToken;
      }
    }
    // retrieve user profile & save to redux store
    this.props.api
      .getProfile(token, userId)
      .then(result => {
        if (result.type === "GET_PROFILE_SUCCESS") {
          this.props.actions.setLoggedIn();
          // check for redirect url in local storage
          const redirect = window.localStorage.getItem("redirect");
          if (redirect) {
            // redirect to originally requested page and then
            // clear value from local storage
            this.props.history.push(redirect);
            window.localStorage.removeItem("redirect");
          }
        } else {
          console.log("not logged in");
          openSnackbar("error", "Please log in to view your profile");
        }
      })
      .catch(err => {
        // console.log(err);
        openSnackbar("error", err);
      });
  }

  render() {
    const { classes } = this.props;
    const { loggedIn } = this.props.appState;
    const redirect = window.localStorage.getItem("redirect");

    return (
      <div className={classes.container} data-test="component-dashboard">
        {loggedIn && !redirect && <SubmissionsTable />}
      </div>
    );
  }
}

DashboardUnconnected.propTypes = {
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool,
    authToken: PropTypes.string
  }).isRequired,
  actions: PropTypes.shape({
    setLoggedIn: PropTypes.func
  }).isRequired,
  api: PropTypes.shape({
    getProfile: PropTypes.func
  }).isRequired,
  profile: PropTypes.shape({
    profile: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      avatar_url: PropTypes.string
    }).isRequired,
    error: PropTypes.string,
    loading: PropTypes.bool
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      token: PropTypes.string
    })
  })
};

const mapStateToProps = state => ({
  appState: state.appState,
  profile: state.profile
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
  api: bindActionCreators(apiProfileActions, dispatch)
});

export const DashboardConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardUnconnected);

export default withRouter(withStyles(styles)(DashboardConnected));
