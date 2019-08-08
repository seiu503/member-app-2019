import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import * as apiSFActions from "../store/actions/apiSFActions";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";

import { openSnackbar } from "./Notifier";
import ButtonWithSpinner from "../components/ButtonWithSpinner";

const styles = theme => ({
  root: {},
  container: {
    padding: "80px 0 140px 0"
  },
  head: {
    color: theme.palette.primary.light,
    fontSize: "2.5em",
    marginBottom: "2em"
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

export class LinkRequestUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      files: []
    };
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {}

  submit(e) {
    const { firstName, lastName, homeEmail } = this.props.submission.formPage1;
    const body = {
      first_name: firstName,
      last_name: lastName,
      home_email: homeEmail
    };
    return this.props.apiSF
      .lookupSFContact(body)
      .then(result => {
        if (result.payload.salesforce_id) {
          const id = this.props.submission.salesforceId;
          this.props.history.push(`/?id=${id}`);
        } else {
          // console.log(result.payload);
          openSnackbar(
            "error",
            result.payload.message ||
              "An error occurred while trying to fetch data from salesforce."
          );
        }
      })
      .catch(err => {
        // console.log(err);
        openSnackbar(
          "error",
          this.props.submission.error ||
            "An error occurred while trying to fetch data from salesforce."
        );
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container} data-test="component-link-request">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className={classes.head}
          style={{ paddingTop: 20 }}
        >
          Request your customized membership form
        </Typography>
        <form
          onSubmit={e => this.submit(e)}
          className={classes.form}
          onError={errors => console.log(errors)}
          id="form"
        >
          <TextField
            data-test="firstName"
            name="firstName"
            id="firstName"
            label="First Name"
            type="text"
            variant="outlined"
            required
            value={this.props.submission.formPage1.firstName}
            onChange={e => this.props.apiSubmission.handleInput(e)}
            className={classes.input}
          />
          <TextField
            data-test="lastName"
            name="lastName"
            id="lastName"
            label="Last Name"
            type="text"
            variant="outlined"
            required
            value={this.props.submission.formPage1.lastName}
            onChange={e => this.props.apiSubmission.handleInput(e)}
            className={classes.input}
          />
          <TextField
            data-test="homeEmail"
            name="homeEmail"
            id="homeEmail"
            label="Home Email"
            type="text"
            variant="outlined"
            required
            value={this.props.submission.formPage1.email}
            onChange={e => this.props.apiSubmission.handleInput(e)}
            className={classes.input}
          />
          <ButtonWithSpinner
            type="submit"
            color="secondary"
            className={classes.formButton}
            variant="contained"
            loading={this.props.submission.loading}
          >
            Lookup
          </ButtonWithSpinner>
        </form>
      </div>
    );
  }
}

LinkRequestUnconnected.propTypes = {
  submission: PropTypes.shape({
    formPage1: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiSubmission: PropTypes.shape({
    handleInput: PropTypes.func,
    clearForm: PropTypes.func
  }),
  classes: PropTypes.object,
  apiSF: PropTypes.shape({
    lookupSFContact: PropTypes.func
  })
};

const mapStateToProps = state => ({
  submission: state.submission
});

const mapDispatchToProps = dispatch => ({
  apiSF: bindActionCreators(apiSFActions, dispatch),
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch)
});

export const LinkRequestConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(LinkRequestUnconnected);

export default withStyles(styles)(LinkRequestConnected);
