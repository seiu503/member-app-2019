import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import shortid from "shortid";

import {
  Select,
  TextField,
  OutlinedInput,
  Typography,
  InputLabel,
  FormControl
} from "@mui/material";
import { withStyles } from "@mui/styles";

import * as apiUserActions from "../store/actions/apiUserActions";

import { openSnackbar } from "../containers/Notifier";
import ButtonWithSpinner from "../components/ButtonWithSpinner";

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
  formButton: {
    width: "100%",
    padding: 20
  },
  formControl: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  radioLabel: {
    width: "100%",
    textAlign: "center"
  }
});
// const selectStyle = align => (align === "right" ? { direction: "ltr" } : {});

export class CreateUserFormUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    return this.props.apiUser.clearForm();
  }

  submit(e) {
    e.preventDefault();
    const { name, email, type } = this.props.user.form;
    const authToken = this.props.appState.authToken;
    const requestingUserType = this.props.appState.userType;
    const body = {
      name,
      email,
      type,
      requestingUserType
    };
    return this.props.apiUser
      .addUser(authToken, body)
      .then(result => {
        if (result.type === "ADD_USER_FAILURE" || this.props.user.error) {
          openSnackbar(
            "error",
            this.props.user.error ||
              "An error occurred while trying to create new user"
          );
        } else {
          openSnackbar("success", "User Created Successfully!");
          this.props.apiUser.clearForm();
          // this.props.history.push("/admin");
        }
      })
      .catch(err => openSnackbar("error", err));
  }

  render() {
    const { classes } = this.props;
    return (
      <div
        className={classes.container}
        data-testid="component-create-user-form"
      >
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className={classes.head}
          style={{ paddingTop: 20 }}
        >
          Create a User
        </Typography>
        <form onSubmit={this.submit} className={classes.form} id="form">
          <TextField
            data-testid="component-name"
            name="name"
            id="name"
            label="Full Name"
            type="text"
            variant="outlined"
            required
            value={this.props.user.form.name}
            onChange={this.props.apiUser.handleInput}
            className={classes.input}
          />
          <TextField
            data-testid="email"
            name="email"
            id="email"
            label="email"
            type="text"
            variant="outlined"
            required
            value={this.props.user.form.email}
            onChange={this.props.apiUser.handleInput}
            className={classes.input}
          />
          <FormControl
            variant="outlined"
            className={classes.formControl}
            required
            // style={short ? { width: 80 } : mobile ? { width: "100%" } : {}}
          >
            <InputLabel htmlFor={"userType"}>User Type</InputLabel>
            <Select
              native
              value={this.props.user.form.type}
              onChange={this.props.apiUser.handleInput}
              input={
                <OutlinedInput
                  labelWidth={80}
                  style={{ width: 80 }}
                  inputProps={{ id: "type", name: "type" }}
                />
              }
              // className={align === "right" ? classes.selectRight : classes.select}
              data-testid="userType"
            >
              <option
                key={shortid()}
                value={""}
                // style={selectStyle(align)}
              />
              <option
                key={shortid()}
                value={"admin"}
                // style={selectStyle(align)}
              >
                Admin
              </option>
              <option
                key={shortid()}
                value={"edit"}
                // style={selectStyle(align)}
              >
                Edit
              </option>
              <option
                key={shortid()}
                value={"view"}
                // style={selectStyle(align)}
              >
                View
              </option>
            </Select>
          </FormControl>
          <ButtonWithSpinner
            type="submit"
            color="secondary"
            className={classes.formButton}
            variant="contained"
            loading={this.props.user.loading}
          >
            Submit
          </ButtonWithSpinner>
        </form>
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
      userType: PropTypes.string
    }),
    loading: PropTypes.bool,
    error: PropTypes.string
  }).isRequired,
  apiUser: PropTypes.shape({
    handleInput: PropTypes.func,
    clearForm: PropTypes.func,
    addUser: PropTypes.func
  }),
  appState: PropTypes.shape({
    authToken: PropTypes.string,
    userType: PropTypes.string
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
