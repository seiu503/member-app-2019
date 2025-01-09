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
import { prefillValidate } from "../utils/validators";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import * as actions from "../store/actions";
import { withTranslation } from "react-i18next";

import { findEmployerObject } from "../components/SubmissionFormElements";
import withRouter from "../components/ComponentWithRouterProp";
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
    this.handleEmployerChange = this.handleEmployerChange.bind(this);
    this.handleCAPEOpen = this.handleCAPEOpen.bind(this);
    this.handleCAPEClose = this.handleCAPEClose.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleCloseAndClear = this.handleCloseAndClear.bind(this);
    this.handleTab = this.handleTab.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    // console.log(`SubmFormP1Container this.props.location`);
    // console.log(this.props.location);
    // console.log(`SubmFormP1Container this.props.history`);
    // console.log(this.props.history);
    // check for contact & account ids in query string
    const params = queryString.parse(this.props.location.search);
    // console.log('**************   PARAMS   ************');
    // console.log(params);
    // const params = {};
    // if find both ids, call API to fetch contact info for prefill
    if (params.cId && params.aId) {
      const { cId, aId } = params;
      this.props.apiSF
        .getSFContactByDoubleId(cId, aId)
        .then(async (result) => {
          // console.log(result);
          // open warning/confirmation modal if prefill successfully loaded
          if (
            this.props.submission.formPage1.firstName &&
            this.props.submission.formPage1.lastName
          ) {
            this.handleOpen();
            console.log('prefill values');
            console.log(this.props.submission.prefillValues);
            // check for complete prefill for spf only
            if (params.spf) {
              console.log(Object.keys(prefillValidate(this.props.submission.prefillValues)));
              if (!Object.keys(prefillValidate(this.props.submission.prefillValues)).length) {
                console.log(`completePrefill: true`);
                this.props.apiSubmission.handleInput({
                  target: { name: "completePrefill", value: true }
                });
              } else {
                console.log('completePrefill: false');
              }
            }
            // this.props.setCAPEOptions();
          } else {
            // if prefill lookup fails, remove ids from query params
            // and reset to blank form
            this.handleCloseAndClear();
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

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleOpen() {
    // console.log('`submFormPage1.jsx > handleOpen`');
    const newState = { ...this.state };
    newState.open = true;
    this._isMounted && this.setState({ ...newState }, () => {
      // console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      // console.log(this.state);
    });
  }

  handleCAPEOpen() {
    const newState = { ...this.state };
    newState.capeOpen = true;
    this._isMounted && this.setState({ ...newState });
  }

  handleClose() {
    const newState = { ...this.state };
    newState.open = false;
    this._isMounted && this.setState({ ...newState });
  }

  handleCloseAndClear() {
    console.log("handleCloseAndClear");
    const newState = { ...this.state };
    newState.open = false;
    this._isMounted && this.setState({ ...newState });
    if (this.props.appState.spf) {
      // reset to blank multi-page form
      this.props.actions.setSPF(false); 
    }
    this.props.apiSubmission.clearForm();
    // remove cId & aId from route params if no match,
    // but preserve other params
    const cleanUrl1 = utils.removeURLParam(window.location.href, "cId");
    const cleanUrl2 = utils.removeURLParam(cleanUrl1, "aId");
    const cleanUrl3 = utils.removeURLParam(cleanUrl2, "spf");
    console.log(`cleanUrl3: ${cleanUrl3}`);
    window.history.replaceState(null, null, cleanUrl3);
    window.location.reload(true);
  }

  handleCAPEClose() {
    const newState = { ...this.state };
    newState.capeOpen = false;
    this._isMounted && this.setState({ ...newState });
  }

  closeDialog() {
    console.log("closeDialog");
    const params = queryString.parse(this.props.location.search);
    const embed = params.embed ? "&embed=true" : "";
    this.props.navigate(
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
    console.log("SFP1 160 verifyRecaptchaScore");

    // set loading
    console.log("setting spinner");
    this.props.actions.setSpinner();

    // fetch token
    await this.props.recaptcha.current.execute();

    // then verify
    const token = this.props.submission.formPage1.reCaptchaValue;
    // console.log(`token: ${token}`);

    // check for token every 200ms until returned to avoid race condition
    (async () => {
      while (!token) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    })();
    if (token) {
      console.log("SFP1 175 verifyRecaptchaScore");
      this.props.apiSubmission
        .verify(token)
        .then(result => {
          console.log("SFP1 179 verifyRecaptchaScore", result.payload ? result.payload.score : 'no result payload');
          return result.payload.score;
        })
        .catch(err => {
          console.error(err);
          const rcErr = this.props.t("reCaptchaError");
          return this.props.handleError(rcErr);
        });
    } else {
      console.log("SFP1 188 verifyRecaptchaScore");
      const rcErr = this.props.t("reCaptchaError");
      return this.props.handleError(rcErr);
    }
  }

  async saveLegalLanguage() {
    console.log('SFP1 195 saveLegalLanguage start');
    return new Promise(resolve => {
      const { formValues } = this.props;
      // save legal_language to redux store before ref disappears
      // but first check to see if it's already been saved? because this is running twice when it shouldn't
      // and sometimes it runs after we've already moved to the next tab and then the ref is gone

      if (!this.props.submission.formPage1.legalLanguage && !this.props.submission.p4cReturnValues.legalLanguage) {
        let legalLanguage =
          this.props.legal_language.current.textContent ||
          this.props.legal_language.current.innerText ||
          "";
        // console.log(legalLanguage);

        this.props.apiSubmission.handleInput({
          target: { name: "legalLanguage", value: legalLanguage }
        });
      }
      
      console.log('SFP1 214 saveLegalLanguage resolve');
      resolve();
    })
  }

  async generateCAPEBody(capeAmount, capeAmountOther) {
    console.log("SFP1 220 generateCAPEBody");
    // console.log(capeAmount, capeAmountOther);
    const { formValues } = this.props;
    // console.log(formValues);

    // if no contact in prefill or from previous form tabs...
    if (!this.props.submission.salesforceId) {
      console.log("SFP1 227 generateCAPEBody");
      await this.props
        .lookupSFContact(formValues)
        .then(() => console.log("SFP1 230 generateCAPEBody"))
        .catch(err => {
          console.error(err);
          return this.props.handleError(err);
        });
    }

    // find employer object
    let employerObject = findEmployerObject(
      this.props.submission.employerObjects,
      formValues.employerName
    );

    if (employerObject) {
      console.log(`employerId: ${employerObject.Id}`);
    } else {
      console.log(
        `SFP1 247 no employerObject found for ${formValues.employerName}; no agency #`
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
    console.log(`employerId: ${employerId}`);

    // set campaign source
    const q = queryString.parse(this.props.location.search);
    // console.log(q);
    const campaignSource =
      q && q.s ? q.s : q && q.src ? q.src : "Direct seiu503signup";

    console.log(campaignSource);

    // set body fields
    const paymentMethod = "Checkoff";
    let donationAmount =
      capeAmount === "Other"
        ? parseFloat(capeAmountOther)
        : parseFloat(capeAmount);
    // console.log(capeAmountOther);
    // console.log(capeAmount);
    console.log(`donationAmount: ${donationAmount}`);

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
    console.log(body);
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
    console.dir(formValues);
    if (standAlone) {
      // verify recaptcha score
      try {
        await this.verifyRecaptchaScore()
          .then(score => {
            // console.log(`score: ${score}`);
            if (score <= 0.3) {
              console.log(`recaptcha failed: ${score}`);
              // don't return to client here, because of race condition this fails initially
              // then passes after error is returned
              // return this.props.handleError(
              //   this.props.t("reCaptchaError")
              // );
              return;
            }
          })
          .catch(err => {
            console.error(err);
          });
      } catch (err) {
        console.error(err);
      }
    }
    // if user clicks submit before the payment logic finishes loading,
    // they may not have donation amount fields visible
    // but will still get an error that the field is missing
    if (!formValues.capeAmount && !formValues.capeAmountOther) {
      // console.log("no donation amount chosen: 365");
      const newState = { ...this.state };
      newState.displayCAPEPaymentFields = true;
      return this._isMounted && this.setState(newState, () => {
        this.props.handleError(this.props.t("donationAmountError"));
        console.log(this.state.displayCAPEPaymentFields);
      });
    }

    let cape_errors = "",
      cape_status = "Pending";
    const body = await this.generateCAPEBody(
      formValues.capeAmount,
      formValues.capeAmountOther
    ).catch(err => {
      cape_errors += err;
      cape_status = "Error";
      console.error(err);
      this.props.handleError(err);
    });
    if (body) {
      delete body.cape_status;
    } else {
      const err = "There was a problem with the CAPE Submission";
      cape_errors += err;
      cape_status = "Error";
      console.error(err);
      this.props.handleError(err);
    }

    // console.log(body);

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

    await this.createCAPE(formValues.capeAmount, formValues.capeAmountOther)
      .then(result => {
        console.log("421");
        console.log(result);
      })
      .catch(err => {
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
    console.log(updates);
    // update CAPE record in postgres
    await this.props.apiSubmission
      .updateCAPE(id, updates)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.error(err);
        // return this.props.handleError(err); // don't return to client here
      });

    if (!standAlone) {
      console.log("455");
      console.log(this.props.history);
      const params = queryString.parse(this.props.location.search);
      console.log(params);
      const embed = params.embed ? "&embed=true" : "";
      console.log(
        `/page2/?cId=${this.props.submission.salesforceId}&sId=${this.props.submission.submissionId}${embed}`
      );
      this.props.navigate(
        `/page2/?cId=${this.props.submission.salesforceId}&sId=${this.props.submission.submissionId}${embed}`
      );
    } else {
      console.log("462");
      this.props.openSnackbar(
        "success",
        "Thank you. Your CAPE submission was processed."
      );
      this.props.navigate(`/thankyou/?cape=true`);
    }
  }

  async handleTab2() {
    // p4c hasn't been run yet so can't use previously saved values from redux store
    const { formValues } = this.props;
    console.log( 'handleTab2formValues');
    console.log(formValues);

    if (!formValues.signature) {
      console.log(this.props.t("provideSignatureError"));
      return this.props.handleError(this.props.t("provideSignatureError"));
    }

    // save legal language
    await this.saveLegalLanguage();

    // save partial submission (update later with demographics from p2)
    await this.props.createSubmission(formValues).catch(err => {
      console.error(err);
      return this.props.handleError(err);
    });

    // move to next tab
    return this.props.changeTab(2);
  }

  async handleTab1() {
    console.log("SFP1 516 handleTab1");
    console.log( 'handleTab1formValues');
    const { formValues } = this.props;
    console.log(formValues);
 
    // verify recaptcha score
    const score = await this.verifyRecaptchaScore();
    setTimeout(() => {
      if (score <= 0.3) {
        console.log(`recaptcha failed: ${score}`);
        // don't return error to client here because the error is returned even if recaptcha is still waiting for result
        // const reCaptchaError = this.props.t("reCaptchaError");
        // return this.props.handleError(reCaptchaError);
        return;
      }
    }, 0);

    console.log("SFP1 533 handleTab1");

    const updateContactAndMoveToNextTab = async () => {
      console.log("SFP1 538 handleTab1 updateContactAndMoveToNextTab");
      // update existing contact, move to next tab
      await this.props.updateSFContact(formValues)
        .catch(err => {
          console.error(err);
          return this.props.handleError(err);
        });
      console.log('SFP1 545 handleTab1 updateContactAndMoveToNextTab');
      if (this.props.appState.spf) {
        console.log('single page form: calling handleTab2 after updating contact');
        return this.handleTab2()
          .catch(err => {
            console.error(err);
            return this.props.handleError(err);
          });
      } else {
        console.log('not spf: moving to tab 2');
        return this.props.changeTab(1);
      }
    };

    console.log("SFP1 557 handleTab1");

    // check if SF contact id already exists (prefill case)
    console.log(`sfid: ${this.props.submission.salesforceId}`);

    if (this.props.submission.salesforceId) {
      await updateContactAndMoveToNextTab();
      console.log("SFP1 564 handleTab1");
    } else {
      // otherwise, lookup contact by first/last/email
      await this.props.lookupSFContact(formValues).catch(err => {
        console.log("SFP1 568 handleTab1");
        console.error(err);
        return this.props.handleError(err);
      });

      // if lookup was successful, update existing contact and move to next tab
      if (this.props.submission.salesforceId) {
        await updateContactAndMoveToNextTab();
        console.log("SFP1 576 handleTab1");
      } else {
        // otherwise, create new contact with submission data,
        // then move to next tab
        await this.props.createSFContact(formValues).catch(err => {
          console.error(err);
          return this.props.handleError(err);
        });
        if (this.props.appState.spf) {
          console.log('single page form: calling handleTab2 after creating new contact');
          return this.handleTab2();
        } else {
          console.log('not spf: moving to tab 2');
          return this.props.changeTab(1);
        }
      } 
    }
  }

  async handleTab(newValue) {
    // e.preventDefault();
    // set loading
    console.log("setting spinner");
    this.props.actions.setSpinner();

    console.log("handleTab");
    console.log(newValue);
    if (newValue === 1) {
      return this.handleTab1().catch(err => {
        console.log("handleTab1 failed");
        console.error(err);
        return this.props.handleError(err);
      });
    }
    if (newValue === 2) {
      return this.handleTab2().catch(err => {
        console.log("handleTab2 failed");
        console.error(err);
        return this.props.handleError(err);
      });
    } else {
      this.props.actions.spinnerOff();
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

    // console.log('%^*%*&^%&^%*&%*&%^&*^%*&^%*&^%*&^%*&^');
    // console.log(`this.state.open: ${this.state.open}`);
    // console.log(`fullName.length: ${fullName.length}`);
    // console.log(`this.props.submission.redirect: ${this.props.submission.redirect}`);
    // console.log(`this.state.open &&
    //         fullName.length &&
    //         !this.props.submission.redirect: ${this.state.open &&
    //         fullName.length &&
    //         !this.props.submission.redirect}`);
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
  apiSF: bindActionCreators(apiSFActions, dispatch),
  actions: bindActionCreators(actions, dispatch),
  submitForm: () => dispatch(submit("submissionPage1"))
});

export const SubmissionFormPage1Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage1Container);

export default withTranslation()(withRouter(SubmissionFormPage1Connected));
