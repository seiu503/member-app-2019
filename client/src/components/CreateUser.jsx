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

  submit(e) {
    e.preventDefault();
    const { fullName, email, userType } = this.props.user.form;
    const body = {
      fullName,
      email,
      userType
    };
    return this.props.apiUser
      .lookupUser(email)
      .then(result => {
        // console.log(result);
        if (result.payload.user_id) {
          // console.log(result.payload);
          openSnackbar(
            "error",
            "This user already exists. Please pick a different email or select 'Edit User' above"
          );
        } else {
          this.props.apiUser.createUser(body).then(result => {
            if (result.payload.user_id) {
              openSnackbar("success", "user created successfully!");
              this.clearForm();
            }
          });
        }
      })
      .catch(err => {
        // console.log(err);
        openSnackbar(
          "error",
          this.props.user.error ||
            "An error occurred while trying to create user"
        );
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container} data-test="create-user-form">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className={classes.head}
          style={{ paddingTop: 20 }}
        >
          Create a User
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
            label="fullName"
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
            label="email"
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
            label="userType"
            type="text"
            variant="outlined"
            required
            value={this.props.user.form.email}
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
      userType: PromiseRejectionEvent.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiUser: PropTypes.shape({
    handleInput: PropTypes.func,
    clearForm: PropTypes.func
  }),
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  apiUser: bindActionCreators(apiUserActions, dispatch)
});

export const CreateUserFormConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateUserFormUnconnected);

export default withStyles(styles)(CreateUserFormConnected);
