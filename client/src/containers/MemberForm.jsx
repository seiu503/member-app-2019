import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import localIpUrl from "local-ip-url";
import uuid from "uuid";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
// import FormLabel from "@material-ui/core/FormLabel";
// import { DropzoneDialog } from "material-ui-dropzone";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
// import * as utils from "../utils";

import { openSnackbar } from "./Notifier";
import ButtonWithSpinner from "../components/ButtonWithSpinner";

const styles = theme => ({
  root: {},
  container: {
    padding: "80px 0 140px 0"
  },
  head: {
    color: theme.palette.primary.light
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
  select: {
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
  formControlLabel: {
    width: "100%"
  }
});

class MemberForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (this.props.submission.error) {
      openSnackbar(
        "error",
        this.props.submission.error ||
          "An error occurred while trying to submit."
      );
    }
  }

  submit = e => {
    e.preventDefault();
    const {
      firstName,
      lastName,
      dd,
      mm,
      yyyy,
      preferredLanguage,
      homeStreet,
      homePostalCode,
      homeState,
      homeCity,
      homeEmail,
      mobilePhone,
      employerName,
      agencyNumber,
      textAuthOptOut,
      termsAgree,
      signature,
      onlineCampaignSource
      // signedApplication
    } = this.props.submission.form;
    const birthdate = mm + "/" + dd + "/" + yyyy;

    const body = {
      ip_address: localIpUrl(),
      submission_date: new Date(),
      agency_number: agencyNumber,
      birthdate,
      cell_phone: mobilePhone,
      employer_name: employerName,
      first_name: firstName,
      last_name: lastName,
      home_street: homeStreet,
      home_city: homeCity,
      home_state: homeState,
      home_zip: homePostalCode,
      home_email: homeEmail,
      preferred_language: preferredLanguage,
      terms_agree: termsAgree,
      signature: signature,
      text_auth_opt_out: textAuthOptOut,
      online_campaign_source: onlineCampaignSource,
      contact_id: uuid.v4(),
      legal_language: "lorem ipsum",
      maintenance_of_effort: new Date(),
      seiu503_cba_app_date: new Date(),
      direct_pay_auth: null,
      direct_deposit_auth: null,
      immediate_past_member_status: null
    };

    this.props.apiSubmission
      .addSubmission(body)
      .then(result => {
        if (result.type === "ADD_CONTENT_FAILURE" || this.props.content.error) {
          openSnackbar(
            "error",
            this.props.content.error ||
              "An error occurred while trying to submit your information."
          );
        } else {
          openSnackbar("success", "Your Submission was Successful!");
          // this.props.apiSubmission.clearForm();
          // this.props.history.push("/library");
        }
      })
      .catch(err => openSnackbar("error", err));
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className={classes.head}
          style={{ paddingTop: 20 }}
        >
          Membership Submission
        </Typography>
        <form
          className={classes.form}
          onError={errors => console.log(errors)}
          id="form"
          onSubmit={this.submit}
        >
          {/*<FormLabel component="legend" className={classes.formLabel}>
Submission Info
</FormLabel>*/}

          <React.Fragment>
            <TextField
              name="firstName"
              id="firstName"
              label="firstName"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.firstName}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="lastName"
              id="lastName"
              label="lastName"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.lastName}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="mm"
              id="mm"
              label="mm"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.mm}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="dd"
              id="dd"
              label="dd"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.dd}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="yyyy"
              id="yyyy"
              label="yyyy"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.yyyy}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel htmlFor="preferredLanguage">
                preferredLanguage
              </InputLabel>
              <Select
                native
                value={this.props.submission.preferredLanguage}
                onChange={this.props.apiSubmission.handleSelect}
                className={classes.select}
                input={
                  <OutlinedInput
                    labelWidth={130}
                    name="preferredLanguage"
                    id="preferredLanguage"
                  />
                }
              >
                <option value="" />
                <option value={"english"}>English</option>
                <option value={"russian"}>Russian</option>
                <option value={"spanish"}>Spanish</option>
              </Select>
            </FormControl>
            <TextField
              name="homeStreet"
              id="homeStreet"
              label="homeStreet"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.homeStreet}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="homeCity"
              id="homeCity"
              label="homeCity"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.homeCity}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="homeState"
              id="homeState"
              label="homeState"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.homeState}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="homePostalCode"
              id="homePostalCode"
              label="homePostalCode"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.homePostalCode}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="homeEmail"
              id="homeEmail"
              label="homeEmail"
              type="email"
              variant="outlined"
              required
              value={this.props.submission.form.homeEmail}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="mobilePhone"
              id="mobilePhone"
              label="mobilePhone"
              type="tel"
              variant="outlined"
              required
              value={this.props.submission.form.mobilePhone}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="employerName"
              id="employerName"
              label="employerName"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.employerName}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <TextField
              name="agencyNumber"
              id="agencyNumber"
              label="agencyNumber"
              type="text"
              variant="outlined"
              required
              value={this.props.submission.form.agencyNumber}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="textAuthOptOut"
                    id="textAuthOptOut"
                    color="primary"
                    value={this.props.submission.form.textAuthOptOut}
                    onChange={this.props.apiSubmission.handleCheckbox}
                    className={classes.checkbox}
                  />
                }
                label="textAuthOptOut"
              />
            </FormGroup>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAgree"
                    id="termsAgree"
                    color="primary"
                    value={this.props.submission.form.termsAgree}
                    onChange={this.props.apiSubmission.handleCheckbox}
                    className={classes.checkbox}
                  />
                }
                label="termsAgree"
              />
            </FormGroup>
            <TextField
              name="signature"
              id="signature"
              label="signature"
              type="tel"
              variant="outlined"
              required
              value={this.props.submission.form.signature}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="signedApplication"
                  id="signedApplication"
                  color="primary"
                  value={this.props.submission.form.signedApplication}
                  onChange={this.props.apiSubmission.handleCheckbox}
                  className={classes.checkbox}
                />
              }
              label="signedApplication"
            />
            <TextField
              name="onlineCampaignSource"
              id="onlineCampaignSource"
              label="onlineCampaignSource"
              type="tel"
              variant="outlined"
              required
              value={this.props.submission.form.onlineCampaignSource}
              onChange={this.props.apiSubmission.handleInput}
              className={classes.input}
            />
            <ButtonWithSpinner
              type="submit"
              color="secondary"
              className={classes.formButton}
              variant="contained"
              loading={this.props.submission.loading}
            >
              Submit
            </ButtonWithSpinner>
          </React.Fragment>
        </form>
      </div>
    );
  }
}

MemberForm.propTypes = {
  type: PropTypes.string,
  appState: PropTypes.shape({
    authToken: PropTypes.string
  }),
  submission: PropTypes.shape({
    form: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      Dd: PropTypes.string,
      Mm: PropTypes.string,
      Yyyy: PropTypes.string,
      preferredLanguage: PropTypes.string,
      homeStreet: PropTypes.string,
      homePostalCode: PropTypes.string,
      homeState: PropTypes.string,
      homeEmail: PropTypes.string,
      mobilePhone: PropTypes.string,
      textAuthOptOut: PropTypes.bool,
      termsAgree: PropTypes.bool,
      signature: PropTypes.string,
      onlineCampaignSource: PropTypes.string,
      signedApplication: PropTypes.bool
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiContent: PropTypes.shape({
    handleInput: PropTypes.func,
    handleCheckbox: PropTypes.func,
    handleSelect: PropTypes.func,
    clearForm: PropTypes.func
  }),
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch)
});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MemberForm)
);
