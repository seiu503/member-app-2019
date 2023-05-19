import React from "react";
import {
  getFormValues,
  submit,
  isSubmitting,
  isPristine,
  isValid,
  getFormSubmitErrors,
  reset,
  change
} from "redux-form";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";

import SubmissionFormPage1Wrap from "../components/SubmissionFormPage1Component";
import * as utils from "../utils";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiContentActions from "../store/actions/apiContentActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import * as actions from "../store/actions";
import { withLocalize } from "react-localize-redux";

import {
  stylesPage1,
  findEmployerObject
} from "../components/SubmissionFormElements";
import Modal from "../components/Modal";

export class SubmissionFormPage1Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      capeOpen: false,
      legalLanguage: "",
      signatureType: "draw",
      displayCAPEPaymentFields: false
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCAPESubmit = this.handleCAPESubmit.bind(this);
    this.verifyRecaptchaScore = this.verifyRecaptchaScore.bind(this);
    // this.handleEmployerTypeChange = this.handleEmployerTypeChange.bind(this);
    this.handleEmployerChange = this.handleEmployerChange.bind(this);
    this.checkCAPEPaymentLogic = this.checkCAPEPaymentLogic.bind(this);
    this.handleCAPEOpen = this.handleCAPEOpen.bind(this);
    this.handleCAPEClose = this.handleCAPEClose.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleCloseAndClear = this.handleCloseAndClear.bind(this);
    this.handleTab = this.handleTab.bind(this);
  }

  componentDidMount() {
    // check for contact & account ids in query string
    const params = queryString.parse(this.props.location.search);
    // if find both ids, call API to fetch contact info for prefill
    if (params.cId && params.aId) {
      const { cId, aId } = params;
      this.props.apiSF
        .getSFContactByDoubleId(cId, aId)
        .then(result => {
          // open warning/confirmation modal if prefill successfully loaded
          if (
            this.props.submission.formPage1.firstName &&
            this.props.submission.formPage1.lastName
          ) {
            this.handleOpen();
            // this.props.setCAPEOptions();
          } else {
            // if prefill lookup fails, remove ids from query params
            // and reset to blank form
            this.props.apiSubmission.clearForm();
            // remove cId & aId from route params if no match,
            // but preserve other params
            const cleanUrl1 = utils.removeURLParam(window.location.href, "cId");
            const cleanUrl2 = utils.removeURLParam(cleanUrl1, "aId");
            window.history.replaceState(null, null, cleanUrl2);
          }
        })
        .catch(err => {
          console.error(err);
          this.props.apiSubmission.clearForm();
          // remove cId & aId from route params if no match,
          // but preserve other params
          const cleanUrl1 = utils.removeURLParam(window.location.href, "cId");
          const cleanUrl2 = utils.removeURLParam(cleanUrl1, "aId");
          window.history.replaceState(null, null, cleanUrl2);
          return this.props.handleError(err);
        });
    }
  }

  handleOpen() {
    const newState = { ...this.state };
    newState.open = true;
    this.setState({ ...newState });
  }

  handleCAPEOpen() {
    const newState = { ...this.state };
    newState.capeOpen = true;
    this.setState({ ...newState });
  }

  handleClose() {
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState });
  }

  handleCloseAndClear() {
    console.log("handleCloseAndClear");
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState });
    this.props.apiSubmission.clearForm();
    // remove cId & aId from route params if no match
    window.history.replaceState(null, null, `${window.location.origin}/`);
  }

  handleCAPEClose() {
    const newState = { ...this.state };
    newState.capeOpen = false;
    this.setState({ ...newState });
  }

  closeDialog() {
    console.log("closeDialog");
    const params = queryString.parse(this.props.location.search);
    const embed = params.embed ? "&embed=true" : "";
    this.props.history.push(
      `/page2/?cId=${this.props.submission.salesforceId}&sId=${this.props.submission.submissionId}${embed}`
    );
    this.handleCAPEClose();
  }

  handleEmployerChange() {
    // console.log("handleEmployerChange");
    // track that employer has been manually changed after prefill
    // to send the prefilled value back to SF on submit if no change
    this.props.apiSubmission.handleInput({
      target: { name: "prefillEmployerChanged", value: true }
    });
  }

  async verifyRecaptchaScore() {
    console.log("verifyRecaptchaScore");
    // fetch token
    await this.props.recaptcha.current.execute();

    // then verify
    const token = this.props.submission.formPage1.reCaptchaValue;
    console.log(`token: ${token}`);

    // check for token every 200ms until returned to avoid race condition
    (async () => {
      while (!token) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    })();
    if (token) {
      const result = await this.props.apiSubmission.verify(token).catch(err => {
        console.error(err);
        return this.props.handleError(this.props.translate("reCaptchaError"));
      });

      if (result) {
        return result.payload.score;
      }
    }
  }

  async saveLegalLanguage() {
    const { formValues } = this.props;
    // save legal_language to redux store before ref disappears
    let legalLanguage =
      this.props.legal_language.current.textContent ||
      this.props.legal_language.current.innerText ||
      "";
    // console.log(legalLanguage);

    if (formValues.directPayAuth && this.props.direct_pay.current) {
      // console.log("directPayAuth");
      legalLanguage = legalLanguage.concat(
        "<hr>",
        this.props.direct_pay.current.innerHTML
      );
    }
    this.props.apiSubmission.handleInput({
      target: { name: "legalLanguage", value: legalLanguage }
    });
  }

  async checkCAPEPaymentLogic() {
    // console.log("checkCAPEPaymentLogic");
    const { formValues } = this.props;

    const newState = { ...this.state };
    newState.displayCAPEPaymentFields = true;
    this.setState(newState, async () => {
      console.log(
        `displayCAPEPaymentFields: ${this.state.displayCAPEPaymentFields}`
      );
      console.log(`checkoff: ${this.props.submission.formPage1.checkoff}`);
    });
  }

  async generateCAPEBody(capeAmount, capeAmountOther) {
    // console.log("generateCAPEBody");
    // console.log(capeAmount, capeAmountOther);
    const { formValues } = this.props;

    // if no contact in prefill or from previous form tabs...
    if (!this.props.submission.salesforceId) {
      await this.props.lookupSFContact(formValues);
    }

    // find employer object
    let employerObject = findEmployerObject(
      this.props.submission.employerObjects,
      formValues.employerName
    );
    // console.log(employerObject);
    // console.log(formValues.employerName);

    if (employerObject) {
      // console.log(`employerId: ${employerObject.Id}`);
    } else if (formValues.employerName === "SEIU 503 Staff") {
      employerObject = findEmployerObject(
        this.props.submission.employerObjects,
        "SEIU LOCAL 503 OPEU"
      );
    } else {
      console.log(
        `no employerObject found for ${formValues.employerName}; no agency #`
      );
    }

    // decide whether to use prefilled employer id (worksite level),
    // or user-chosen employer id (employer level)
    let employerId;
    if (
      this.props.submission.formPage1 &&
      this.props.submission.formPage1.prefillEmployerId
    ) {
      if (!this.props.submission.formPage1.prefillEmployerChanged) {
        // if this is a prefill and employer has not been changed manually,
        // return original prefilled employer Id
        // this will be a worksite-level account id in most cases
        employerId = this.props.submission.formPage1.prefillEmployerId;
      } else {
        // if employer has been manually changed since prefill, or if
        // this is a blank-slate form, find id in employer object
        // this will be an agency-level employer Id
        employerId = employerObject ? employerObject.Id : "0016100000WERGeAAP"; // <= unknown employer
      }
    } else {
      // if employer has been manually changed since prefill, or if
      // this is a blank-slate form, find id in employer object
      // this will be an agency-level employer Id
      employerId = employerObject ? employerObject.Id : "0016100000WERGeAAP"; // <= unknown employer
    }

    // set campaign source
    const q = queryString.parse(this.props.location.search);
    // console.log(q);
    const campaignSource =
      q && q.s ? q.s : q && q.src ? q.src : "Direct seiu503signup";

    // console.log(campaignSource);

    // set body fields
    const paymentMethod = "Checkoff";
    let donationAmount =
      capeAmount === "Other"
        ? parseFloat(capeAmountOther)
        : parseFloat(capeAmount);
    // console.log(capeAmountOther);
    // console.log(capeAmount);
    // console.log(`donationAmount: ${donationAmount}`);

    if (!donationAmount || typeof donationAmount !== "number") {
      console.log("no donation amount chosen");
      const newState = { ...this.state };
      newState.displayCAPEPaymentFields = true;

      return this.setState(newState, () => {
        // console.log(this.state.displayCAPEPaymentFields);
      });
    }

    // generate body
    const body = {
      submission_date: utils.formatDate(new Date()),
      contact_id: this.props.submission.salesforceId,
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      home_email: formValues.homeEmail,
      cell_phone: formValues.mobilePhone,
      home_street: formValues.homeStreet,
      home_city: formValues.homeCity,
      home_state: formValues.homeState,
      home_zip: formValues.homeZip,
      job_title: formValues.jobTitle,
      employer_id: employerId,
      payment_method: paymentMethod,
      online_campaign_source: campaignSource,
      cape_legal: this.props.cape_legal.current.innerHTML,
      cape_amount: donationAmount,
      cape_status: "Incomplete",
      donation_frequency: "Monthly"
    };
    // console.log(body);
    return body;
  }

  // create an initial CAPE record in postgres to get returned ID
  // not finalized until payment method added and SFCAPE status updated
  async createCAPE(capeAmount, capeAmountOther) {
    console.log("createCAPE");
    const body = await this.generateCAPEBody(capeAmount, capeAmountOther);
    // console.log(body);
    if (body) {
      const capeResult = await this.props.apiSubmission
        .createCAPE(body)
        .catch(err => {
          console.error(err);
          return this.props.handleError(err);
        });

      if (
        (capeResult && capeResult.type !== "CREATE_CAPE_SUCCESS") ||
        this.props.submission.error
      ) {
        console.log(this.props.submission.error);
        return this.props.handleError(this.props.submission.error);
      }
    } else {
      console.log("no CAPE body generated");
    }
  }

  async handleCAPESubmit(standAlone) {
    console.log("handleCAPESubmit", standAlone);
    const { formValues } = this.props;

    if (standAlone) {
      // verify recaptcha score
      await this.verifyRecaptchaScore()
        .then(score => {
          // console.log(`score: ${score}`);
          if (!score || score <= 0.5) {
            // console.log(`recaptcha failed: ${score}`);
            return this.props.handleError(
              this.props.translate("reCaptchaError")
            );
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
    // if user clicks submit before the payment logic finishes loading,
    // they may not have donation amount fields visible
    // but will still get an error that the field is missing
    if (!formValues.capeAmount && !formValues.capeAmountOther) {
      console.log("no donation amount chosen");
      const newState = { ...this.state };
      newState.displayCAPEPaymentFields = true;
      return this.setState(newState, () => {
        console.log(this.state.displayCAPEPaymentFields);
      });
    }

    let cape_errors = "",
      cape_status = "Pending";
    const body = await this.generateCAPEBody(
      formValues.capeAmount,
      formValues.capeAmountOther
    );
    delete body.cape_status;

    // write CAPE contribution to SF
    const sfCapeResult = await this.props.apiSF
      .createSFCAPE(body)
      .catch(err => {
        cape_errors += err;
        cape_status = "Error";
        console.error(err);
        this.props.handleError(err);
      });

    if (
      (sfCapeResult && sfCapeResult.type !== "CREATE_SF_CAPE_SUCCESS") ||
      this.props.submission.error
    ) {
      cape_errors += this.props.submission.error;
      cape_status = "Error";
      // console.log(this.props.submission.error);
      return this.props.handleError(this.props.submission.error);
    } else if (sfCapeResult && sfCapeResult.type === "CREATE_SF_CAPE_SUCCESS") {
      cape_status = "Success";
    } else {
      cape_status = "Error";
    }

    await this.createCAPE(
      formValues.capeAmount,
      formValues.capeAmountOther
    ).catch(err => {
      console.error(err);
      return this.props.handleError(err);
    });

    const { id } = this.props.submission.cape;

    // collect updates to cape record (values returned from other API calls,
    // amount and frequency)
    const donationAmount =
      formValues.capeAmount === "Other"
        ? parseFloat(formValues.capeAmountOther)
        : parseFloat(formValues.capeAmount);
    const updates = {
      cape_status,
      cape_errors,
      cape_amount: donationAmount,
      donation_frequency: formValues.donationFrequency
    };
    // update CAPE record in postgres
    await this.props.apiSubmission.updateCAPE(id, updates).catch(err => {
      console.error(err);
      // return this.props.handleError(err); // don't return to client here
    });
    // console.log(capeResult);

    if (!standAlone) {
      const params = queryString.parse(this.props.location.search);
      const embed = params.embed ? "&embed=true" : "";
      this.props.history.push(
        `/page2/?cId=${this.props.submission.salesforceId}&sId=${this.props.submission.submissionId}${embed}`
      );
    } else {
      this.props.openSnackbar(
        "success",
        "Thank you. Your CAPE submission was processed."
      );
      this.props.history.push(`/thankyou/?cape=true`);
    }
  }

  async handleTab2() {
    const { formValues } = this.props;
    console.log(formValues);

    if (!formValues.signature) {
      console.log(this.props.translate("provideSignatureError"));
      return this.props.handleError(
        this.props.translate("provideSignatureError")
      );
    }

    // save legal language
    this.saveLegalLanguage();

    // save partial submission (update later with demographics from p2)
    await this.props.createSubmission(formValues).catch(err => {
      console.error(err);
      return this.props.handleError(err);
    });

    // move to next tab
    return this.props.changeTab(2);
  }

  async handleTab1() {
    console.log("handleTab1");
    const { formValues } = this.props;
    console.dir(formValues);
    // verify recaptcha score
    const score = await this.verifyRecaptchaScore();
    if (!score || score <= 0.3) {
      console.log(`recaptcha failed: ${score}`);
      return this.props.handleError(this.props.translate("reCaptchaError"));
    }
    // handle moving from tab 1 to tab 2:

    this.props.apiSubmission.handleInput({
      target: { name: "howManyTabs", value: 3 }
    });

    // check if SF contact id already exists (prefill case)
    if (this.props.submission.salesforceId) {
      // update existing contact, move to next tab
      await this.props.updateSFContact(formValues).catch(err => {
        console.error(err);
        return this.props.handleError(err);
      });
      return this.props.changeTab(1);
    }

    // otherwise, lookup contact by first/last/email
    await this.props.lookupSFContact(formValues).catch(err => {
      console.error(err);
      return this.props.handleError(err);
    });

    // if lookup was successful, update existing contact and move to next tab
    // refactor this bc it's an exact repeat of lines 595-602; make it a sub-module and just call it again here
    if (this.props.submission.salesforceId) {
      await this.props.updateSFContact(formValues).catch(err => {
        console.error(err);
        return this.props.handleError(err);
      });
      return this.props.changeTab(1);
    }

    // otherwise, create new contact with submission data,
    // then move to next tab
    await this.props.createSFContact(formValues).catch(err => {
      console.error(err);
      return this.props.handleError(err);
    });
    return this.props.changeTab(1);
  }

  async handleTab(newValue) {
    console.log("handleTab");
    console.log(newValue);
    if (newValue === 1) {
      return this.handleTab1()
        .then(() => console.log("handleTab1 success"))
        .catch(err => {
          console.log("handleTab1 failed");
          console.error(err);
          return this.props.handleError(err);
        });
    }
    if (newValue === 2) {
      return this.handleTab2()
        .then(() => console.log("handleTab2 success"))
        .catch(err => {
          console.log("handleTab2 failed");
          console.error(err);
          return this.props.handleError(err);
        });
    } else {
      return this.props.changeTab(newValue);
    }
  }

  render() {
    const fullName = `${
      this.props.submission &&
      this.props.submission.formPage1 &&
      this.props.submission.formPage1.firstName
        ? this.props.submission.formPage1.firstName
        : ""
    } ${
      this.props.submission &&
      this.props.submission.formPage1 &&
      this.props.submission.formPage1.lastName
        ? this.props.submission.formPage1.lastName
        : ""
    }`;
    return (
      <div data-testid="container-submission-form-page-1">
        <Modal
          open={
            this.state.open &&
            fullName.length &&
            !this.props.submission.redirect
          }
          handleCloseAndClear={this.handleCloseAndClear}
          handleClose={this.handleClose}
          fullName={fullName}
          history={this.props.history}
        />
        <SubmissionFormPage1Wrap
          {...this.props}
          change={change}
          tab={this.props.tab}
          howManyTabs={this.props.submission.formPage1.howManyTabs}
          handleTab={this.handleTab}
          back={this.props.changeTab}
          handleUpload={this.handleUpload}
          signatureType={this.state.signatureType}
          toggleSignatureInputType={this.toggleSignatureInputType}
          clearSignature={this.clearSignature}
          handleError={this.props.handleError}
          handleCAPESubmit={this.handleCAPESubmit}
          verifyRecaptchaScore={this.verifyRecaptchaScore}
          handleEmployerTypeChange={this.handleEmployerTypeChange}
          handleEmployerChange={this.handleEmployerChange}
          checkCAPEPaymentLogic={this.checkCAPEPaymentLogic}
          displayCAPEPaymentFields={this.state.displayCAPEPaymentFields}
          handleCAPEOpen={this.handleCAPEOpen}
          handleCAPEClose={this.handleCAPEClose}
          capeOpen={this.state.capeOpen}
          closeDialog={this.closeDialog}
          mobilePhoneOnBlur={this.mobilePhoneOnBlur}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  content: state.content,
  initialValues: state.submission.formPage1,
  formValues: getFormValues("submissionPage1")(state) || {},
  pristine: isPristine("submissionPage1")(state),
  submitting: isSubmitting("submissionPage1")(state),
  valid: isValid("submissionPage1")(state),
  submitErrors: getFormSubmitErrors("submissionPage1")(state),
  reset: reset
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiContent: bindActionCreators(apiContentActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch),
  actions: bindActionCreators(actions, dispatch),
  submitForm: () => dispatch(submit("submissionPage1"))
});

export const SubmissionFormPage1Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage1Container);

export default withLocalize(SubmissionFormPage1Connected);
