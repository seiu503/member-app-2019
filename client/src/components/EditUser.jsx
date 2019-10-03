import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import * as apiUserActions from "../store/actions/apiUserActions";

import { openSnackbar } from "../containers/Notifier";
import ButtonWithSpinner from "../components/ButtonWithSpinner";
import Spinner from "../components/Spinner";
import AlertDialog from "../components/AlertDialog";

const styles = theme => ({
  root: {},
  container: {
    padding: "10px 0 140px 0",
    background: "white"
  },
  head: {
    color: theme.palette.primary.light,
    fontSize: "2.5em",
    marginBottom: "1em"
  },
  form: {
    maxWidth: 600,
    margin: "auto"
  },
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  input: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  textarea: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  formButton: {
    width: "100%",
    padding: 20
  },
  buttonDelete: {
    width: "100%",
    padding: 20,
    marginTop: "20px",
    backgroundColor: theme.palette.danger.main,
    "&:hover": {
      backgroundColor: theme.palette.danger.light
    }
  },
  formControl: {
    width: "100%"
  },
  radioLabel: {
    width: "100%",
    textAlign: "center"
  }
});

export class CreateUserFormUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false
    };
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {}

  findUserByEmail(e) {
    e.preventDefault();
    const { existingUserEmail } = this.props.user.form;
    const requestingUserType = this.props.appState.userType;
    return this.props.apiUser
      .getUserByEmail(existingUserEmail, requestingUserType)
      .then(result => {
        // console.log(result);
        if (result.payload.message) {
          // console.log(result.payload);
          openSnackbar(
            "error",
            result.payload.message ||
              "An error occurred while trying to find user"
          );
        } else {
          openSnackbar("success", "user found successfully!");
        }
      })
      .catch(err => {
        // console.log(err);
        openSnackbar(
          "error",
          this.props.user.error || "An error occurred while trying to find user"
        );
      });
  }

  submit(e) {
    e.preventDefault();
    const { fullName, email, userType } = this.props.user.form;
    const authToken = this.props.appState.authToken;
    const requestingUserType = this.props.appState.userType;
    const body = {
      updates: {
        fullName,
        email,
        userType
      },
      requestingUserType
    };
    return this.props.apiUser
      .updateUser(authToken, body)
      .then(result => {
        if (result.type === "UPDATE_USER_FAILURE" || this.props.user.error) {
          openSnackbar(
            "error",
            this.props.user.error ||
              "An error occurred while trying to update user"
          );
        } else {
          openSnackbar("success", "User Created Successfully!");
          this.props.apiUser.clearForm();
          this.props.history.push("/admin");
        }
      })
      .catch(err => openSnackbar("error", err));
  }

  handleDeleteDialogOpen = user => {
    if (user && this.props.appState.loggedIn) {
      this.props.apiUser.handleDeleteOpen(user);
    }
  };

  async deleteUser(user) {
    const token = this.props.appState.authToken;
    const requestingUserType = this.props.appState.userType;
    const userDeleteResult = await this.props.apiUser.deleteUser(
      token,
      user.id,
      requestingUserType
    );
    if (
      !userDeleteResult.type ||
      userDeleteResult.type !== "DELETE_CONTENT_SUCCESS"
    ) {
      openSnackbar("error", this.props.user.error);
    } else if (userDeleteResult.type === "DELETE_CONTENT_SUCCESS") {
      openSnackbar("success", `Deleted ${user.name}.`);
      this.props.history.push(`/user`);
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div data-test="component-edit-user" className={classes.root}>
        {this.props.user.deleteDialogOpen && (
          <AlertDialog
            open={this.props.user.deleteDialogOpen}
            handleClose={this.props.apiUser.handleDeleteClose}
            title="Delete Content"
            content={`Are you sure you want to delete ${
              this.props.user.currentUser.name
            }? This action cannot be undone and all user data will be lost.`}
            danger={true}
            action={() => {
              this.deleteUser(this.props.user.currentUser);
              this.props.apiUser.handleDeleteClose();
            }}
            buttonText="Delete"
            data-test="alert-dialog"
          />
        )}
        {this.props.user.currentUser.id && (
          <div>
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              className={classes.head}
              style={{ paddingTop: 20 }}
            >
              Edit a User
            </Typography>
            <form
              onSubmit={e => this.submit(e)}
              className={classes.form}
              onError={errors => console.log(errors)}
              id="form"
            >
              <TextField
                data-test="fullName"
                name="fullName"
                id="fullName"
                label="Name"
                type="text"
                variant="outlined"
                required
                value={this.props.user.form.fullName}
                onChange={e => this.props.apiUser.handleInput(e)}
                className={classes.input}
              />
              <TextField
                data-test="email"
                name="email"
                id="email"
                label="Email"
                type="text"
                variant="outlined"
                required
                value={this.props.user.form.email}
                onChange={e => this.props.apiUser.handleInput(e)}
                className={classes.input}
              />
              <TextField
                data-test="userType"
                name="userType"
                id="userType"
                label="User Type"
                type="text"
                variant="outlined"
                required
                value={this.props.user.form.userType}
                onChange={e => this.props.apiUser.handleInput(e)}
                className={classes.input}
              />
              <ButtonWithSpinner
                type="submit"
                color="secondary"
                className={classes.formButton}
                variant="contained"
                loading={this.props.user.loading}
              >
                Submit
              </ButtonWithSpinner>
              <ButtonWithSpinner
                onClick={() =>
                  this.handleDeleteDialogOpen(this.props.user.currentUser)
                }
                color="primary"
                aria-label="Delete Content"
                data-test="delete"
                className={classes.buttonDelete}
                variant="contained"
                loading={this.props.user.loading}
              >
                Delete User
              </ButtonWithSpinner>
            </form>
          </div>
        )}
        {!this.props.user.currentUser.id && (
          <div>
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              className={classes.head}
              style={{ paddingTop: 20 }}
            >
              Find User to Edit
            </Typography>
            <form
              onSubmit={e => this.findUserByEmail(e)}
              className={classes.form}
              onError={errors => console.log(errors)}
              id="form"
            >
              <TextField
                data-test="existingUserEmail"
                name="existingUserEmail"
                id="existingUserEmail"
                label="existingUserEmail"
                type="text"
                variant="outlined"
                required
                value={this.props.user.form.existingUserEmail}
                onChange={e => this.props.apiUser.handleInput(e)}
                className={classes.input}
              />
              <ButtonWithSpinner
                type="submit"
                color="secondary"
                className={classes.formButton}
                variant="contained"
                loading={this.props.user.loading}
              >
                Look Up
              </ButtonWithSpinner>
            </form>
          </div>
        )}
      </div>
    );
  }
}

CreateUserFormUnconnected.propTypes = {
  user: PropTypes.shape({
    form: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      userType: PromiseRejectionEvent.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiUser: PropTypes.shape({
    handleInput: PropTypes.func,
    clearForm: PropTypes.func,
    getUserByEmail: PropTypes.func,
    updateUser: PropTypes.func,
    handleDeleteOpen: PropTypes.func,
    deleteUser: PropTypes.func,
    handleDeleteClose: PropTypes.func
  }),
  appState: PropTypes.shape({
    authToken: PropTypes.string,
    userType: PropTypes.string,
    loggedIn: PropTypes.bool
  }),
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  user: state.user,
  appState: state.appState
});

const mapDispatchToProps = dispatch => ({
  apiUser: bindActionCreators(apiUserActions, dispatch)
});

export const CreateUserFormConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateUserFormUnconnected);

export default withStyles(styles)(CreateUserFormConnected);
