import React from "react";
import localIpUrl from "local-ip-url";
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
import isoConv from "iso-language-converter";

import { withStyles } from "@material-ui/core/styles";

import { openSnackbar } from "./Notifier";
import SubmissionFormPage1Wrap from "../components/SubmissionFormPage1Component";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiContentActions from "../store/actions/apiContentActions";
import * as apiSFActions from "../store/actions/apiSFActions";

import {
  stylesPage1,
  blankSig,
  formatSFDate,
  formatBirthdate,
  findEmployerObject
} from "../components/SubmissionFormElements";
import Modal from "../components/Modal";

export class SubmissionFormPage1Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      tab: undefined,
      legalLanguage: "",
      signatureType: "draw"
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }
  componentDidMount() {
    // check for contact id in query string
    const params = queryString.parse(this.props.location.search);
    // if find contact id, call API to fetch contact info for prefill
    if (params.id) {
      const { id } = params;
      this.props.apiSF
        .getSFContactById(id)
        .then(result => {
          // console.log(result.payload);
          // open warning/confirmation modal if prefill successfully loaded
          if (
            this.props.submission.formPage1.firstName &&
            this.props.submission.formPage1.lastName
          ) {
            this.handleOpen();
          }
        })
        .catch(err => {
          console.log(err);
          return this.handleError(err);
        });
    } else {
      // console.log("no id found, no prefill");
      return;
    }
  }

  handleOpen() {
    const newState = { ...this.state };
    newState.open = true;
    this.setState({ ...newState });
  }

  handleClose() {
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState });
  }

  handleError(err) {
    return openSnackbar(
      "error",
      err || "Sorry, something went wrong. Please try again."
    );
  }

  handleUpload(firstName, lastName) {
    return new Promise((resolve, reject) => {
      let file = this.trimSignature();
      let filename = `${firstName}_${lastName}__signature__${formatSFDate(
        new Date()
      )}.jpg`;
      if (file instanceof Blob) {
        file.name = filename;
      }
      this.props.apiContent
        .uploadImage(file)
        .then(result => {
          if (
            result.type === "UPLOAD_IMAGE_FAILURE" ||
            this.props.content.error
          ) {
            openSnackbar(
              "error",
              this.props.content.error ||
                "An error occured while trying to save your Signature. Please try typing it instead"
            );
            resolve();
          } else {
            // console.log(result.payload.content);
            resolve(result.payload.content);
          }
        })
        .catch(err => {
          console.log(err);
          return this.handleError(err);
        });
    });
  }

  toggleSignatureInputType = () => {
    let type = this.state.signatureType === "draw" ? "write" : "draw";
    this.setState({ signatureType: type });
  };

  clearSignature = () => {
    this.props.sigBox.current.clear();
  };

  dataURItoBlob = dataURI => {
    let binary = atob(dataURI.split(",")[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
  };

  trimSignature = () => {
    let dataURL = this.props.sigBox.current.toDataURL("image/jpeg");
    if (dataURL === blankSig) {
      throw new Error(
        "Please draw your signature or click the link to type it instead"
      );
    } else {
      let blobData = this.dataURItoBlob(dataURL);
      return blobData;
    }
  };

  // just navigate to tab, don't run validation on current tab
  changeTab = newValue => {
    const newState = { ...this.state };
    newState.tab = newValue;
    this.setState({ ...newState });
  };

  prepForSubmission(values) {
    let returnValues = { ...values };

    // set default date values for DPA & DDA if relevant
    returnValues.direct_pay_auth = values.directPayAuth
      ? formatSFDate(new Date())
      : null;
    returnValues.direct_deposit_auth = values.directDepositAuth
      ? formatSFDate(new Date())
      : null;

    // set legal language
    returnValues.legalLanguage = this.props.submission.formPage1.legalLanguage;

    // set campaign source
    const q = queryString.parse(this.props.location.search);
    returnValues.campaignSource = q && q.s ? q.s : "Direct seiu503signup";

    // set salesforce id
    if (!values.salesforceId) {
      if (q && q.id) {
        returnValues.salesforceId = q.id;
      }
      if (this.props.submission.salesforce_id) {
        returnValues.salesforceId = this.props.submission.salesforce_id;
      }
    }

    return returnValues;
  }

  generateSubmissionBody(values) {
    const firstValues = this.prepForContact(values);
    const secondValues = this.prepForSubmission(firstValues);

    let {
      firstName,
      lastName,
      birthdate,
      employerId,
      agencyNumber,
      preferredLanguage,
      homeStreet,
      homeZip,
      homeState,
      homeCity,
      homeEmail,
      mobilePhone,
      employerName,
      textAuthOptOut,
      immediatePastMemberStatus,
      direct_pay_auth,
      direct_deposit_auth,
      salesforceId,
      termsAgree,
      campaignSource,
      legalLanguage,
      signature,
      reCaptchaValue
    } = secondValues;

    return {
      ip_address: localIpUrl(),
      submission_date: new Date(),
      agency_number: agencyNumber,
      birthdate,
      cell_phone: mobilePhone,
      employer_name: employerName,
      employer_id: employerId,
      first_name: firstName,
      last_name: lastName,
      home_street: homeStreet,
      home_city: homeCity,
      home_state: homeState,
      home_zip: homeZip,
      home_email: homeEmail,
      preferred_language: preferredLanguage,
      terms_agree: termsAgree,
      signature: signature,
      text_auth_opt_out: textAuthOptOut,
      online_campaign_source: campaignSource,
      legal_language: legalLanguage,
      maintenance_of_effort: new Date(),
      seiu503_cba_app_date: new Date(),
      direct_pay_auth,
      direct_deposit_auth,
      immediate_past_member_status: immediatePastMemberStatus,
      salesforce_id: salesforceId,
      reCaptchaValue
    };
  }

  async createSubmission() {
    const { formValues } = this.props;

    // create initial submission using data in tabs 1 & 2
    // for afh/retiree/comm, submission will not be
    // finalized and written to salesforce
    // until payment method added in tab 3

    const body = this.generateSubmissionBody(this.props.formValues);

    try {
      const result = await this.props.apiSubmission.addSubmission(body);
      console.log(result.payload);
      console.log(this.props.submission.submissionId);
      // if no payment is required, we're done with saving the submission
      // we can write the OMA to SF and then move on to the CAPE ask
      if (!formValues.paymentRequired) {
        return this.props.apiSF.createSFOMA(body);
        // goto CAPE ...
      }
      return;

      // if payment is required then we need to move to next tab
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  prepForContact(values) {
    let returnValues = { ...values };

    // format birthdate
    const birthdate = formatBirthdate(values);
    returnValues.birthdate = birthdate;

    // find employer object and set employer-related fields
    const employerObject = findEmployerObject(
      this.props.submission.employerObjects,
      values.employerName
    );
    returnValues.employerId = employerObject.Id;
    returnValues.agencyNumber = employerObject.Agency_Number__c;

    return returnValues;
  }

  async createSFContact() {
    const values = this.prepForContact(this.props.formValues);
    let {
      firstName,
      lastName,
      birthdate,
      employerId,
      agencyNumber,
      preferredLanguage,
      homeStreet,
      homeZip,
      homeState,
      homeCity,
      homeEmail,
      mobilePhone,
      employerName,
      textAuthOptOut,
      reCaptchaValue
    } = values;

    const body = {
      agency_number: agencyNumber,
      birthdate,
      cell_phone: mobilePhone,
      employer_name: employerName,
      employer_id: employerId,
      first_name: firstName,
      last_name: lastName,
      home_street: homeStreet,
      home_city: homeCity,
      home_state: homeState,
      home_zip: homeZip,
      home_email: homeEmail,
      preferred_language: preferredLanguage,
      text_auth_opt_out: textAuthOptOut,
      reCaptchaValue
    };

    try {
      await this.props.apiSF.createSFContact(body);
      console.log(this.props.submission.salesforceId);
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  async updateSFContact() {
    const values = this.prepForContact(this.props.formValues);
    let {
      firstName,
      lastName,
      birthdate,
      employerId,
      agencyNumber,
      preferredLanguage,
      homeStreet,
      homeZip,
      homeState,
      homeCity,
      homeEmail,
      mobilePhone,
      employerName,
      textAuthOptOut,
      reCaptchaValue
    } = values;

    let id = this.props.submission.salesforceId;

    const body = {
      agency_number: agencyNumber,
      birthdate,
      cell_phone: mobilePhone,
      employer_name: employerName,
      employer_id: employerId,
      first_name: firstName,
      last_name: lastName,
      home_street: homeStreet,
      home_city: homeCity,
      home_state: homeState,
      home_zip: homeZip,
      home_email: homeEmail,
      preferred_language: preferredLanguage,
      text_auth_opt_out: textAuthOptOut,
      reCaptchaValue
    };

    try {
      const result = await this.props.apiSF.updateSFContact(id, body);
      console.log(result.payload);
      console.log(this.props.submission.salesforceId);
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  async handleTab1() {
    const { formValues } = this.props;
    // handle moving from tab 1 to tab 2:
    // lookup SF contact if no id provided

    // submit validation: recaptcha
    const reCaptchaValue = this.props.reCaptchaRef.current.getValue();
    if (!reCaptchaValue) {
      return openSnackbar("error", "Please verify you are human with Captcha");
    }
    this.props.changeFieldValue("reCaptchaValue", reCaptchaValue);

    // check if SF contact id already exists (prefill case)
    if (this.props.submission.salesforceId) {
      // update existing contact, move to next tab
      try {
        await this.updateSFContact();
        return this.changeTab(1);
      } catch (err) {
        console.log(err);
        return this.handleError(err);
      }
    }

    // otherwise, lookup contact by first/last/email
    const body = {
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      home_email: formValues.homeEmail
    };

    try {
      await this.props.apiSF.lookupSFContact(body);
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }

    console.log(this.props.submission.salesforceId);

    // if lookup was successful, update existing contact and move to next tab
    if (this.props.submission.salesforceId) {
      await this.updateSFContact();
      return this.changeTab(1);
    }

    // otherwise, create new contact with submission data,
    // then move to next tab
    try {
      await this.createSFContact();
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  async getIframeURL() {
    const { formValues } = this.props;
    // if submission type requires payment processing, fetch iFrame URL
    // for use in next tab

    // once we start saving activePaymentMethod.last4 in SF, we can skip this call for people who have an active payment method and only make it in tab 3 if they tell us they want to add a new method

    // set payment required to true
    this.props.apiSubmission.handleInput({
      target: { name: "paymentRequired", value: true }
    });

    const birthdate = formatBirthdate(formValues);
    // convert language to ISO code for unioni.se
    let language = isoConv(formValues.preferredLanguage);
    if (language === "en") {
      language = "en-US";
    }
    if (language === "es") {
      language = "es-US";
    }
    const body = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      address: {
        addressLine1: formValues.homeStreet,
        city: formValues.homeCity,
        state: formValues.homeState,
        zip: formValues.homeZip
      },
      email: formValues.homeEmail,
      language,
      cellPhone: formValues.mobilePhone,
      birthDate: birthdate,
      employerExternalId: "SW001",
      // ^^ fixed value for dev / staging
      // this will be Agency number in production
      employeeExternalId: this.props.apiSubmission.submissionId,
      agreesToMessages: !formValues.textAuthOptOut,

      // below fields should no longer be required,
      // test and elminate when this is fixed
      duesAmount: 1.23, // required by unioni.se, sending default
      duesCurrency: "USD", // required by unioni.se, sending default
      duesDayOfMonth: 15, // required by unioni.se, sending default
      duesActiveFrom: "2019-05-20", // required by unioni.se, sending default data
      deductionType: "CAPE", // required by unioni.se, sending default
      deductionAmount: 2.34, // required by unioni.se, sending default
      deductionCurrency: "USD", // required by unioni.se, sending default
      deductionDayOfMonth: 15 // required by unioni.se, sending default
    };
    console.log(JSON.stringify(body));
    try {
      const result = await this.props.apiSF.getIframeURL(body);
      if (!result.payload.cardAddingUrl || result.payload.message) {
        // console.log('253');
        return openSnackbar(
          "error",
          result.payload.message ||
            "Sorry, something went wrong. Please try again."
        );
      }
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  async saveLegalLanguage() {
    const { formValues } = this.props;
    // save legal_language to redux store before ref disappears
    let legalLanguage = this.props.legal_language.current.innerHTML;
    if (formValues.directDepositAuth && this.props.direct_deposit.current) {
      legalLanguage = legalLanguage.concat(
        "<hr>",
        this.props.direct_deposit.current.innerHTML
      );
    }
    if (formValues.directPayAuth && this.props.direct_pay.current) {
      legalLanguage = legalLanguage.concat(
        "<hr>",
        this.props.direct_pay.current.innerHTML
      );
    }
    this.props.apiSubmission.handleInput({
      target: { name: "legalLanguage", value: legalLanguage }
    });
  }

  async calculateAFHDuesRate(medicaidResidents) {
    let afhDuesRate = medicaidResidents * 14.84 + 2.75;
    console.log(afhDuesRate);
    this.props.apiSubmission.handleInput({
      target: { name: "afhDuesRate", value: afhDuesRate }
    });
  }

  async saveSignature() {
    const { formValues } = this.props;
    // perform signature processing steps and save value to redux store
    // before ref disappears

    if (this.state.signatureType === "draw") {
      // console.log('387');
      let sigUrl;
      try {
        sigUrl = await this.handleUpload(
          formValues.firstName,
          formValues.lastName
        );
        // console.log(`394: ${sigUrl}`);
        this.props.changeFieldValue("signature", sigUrl);
        return sigUrl;
      } catch (err) {
        // console.log(err);
        this.handleError(err);
      }
    }
  }

  async handleTab2() {
    const { formValues } = this.props;

    // submit validation: signature
    try {
      const signature = await this.saveSignature();
      if (!signature) {
        return openSnackbar("error", "Please provide a signature");
      }
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }

    // for AFH, calculate dues rate:
    if (formValues.employerType.toLowerCase() === "adult foster home") {
      this.calculateAFHDuesRate(formValues.medicaidResidents);
    }

    // if payment required (and no existing payment method -- check this!)
    // get iframe url for next tab
    if (
      formValues.employerType.toLowerCase() === "community member" ||
      formValues.employerType.toLowerCase() === "retired" ||
      formValues.employerType.toLowerCase() === "adult foster home"
    ) {
      try {
        await this.getIframeURL(formValues);
      } catch (err) {
        console.log(err);
        return this.handleError(err);
      }
    }

    // save legal language
    this.saveLegalLanguage(formValues);

    // save partial submission, then move to next tab
    try {
      await this.createSubmission();
      return this.changeTab(2);
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  handleTab(newValue) {
    if (newValue === 1) {
      return this.handleTab1();
    }
    if (newValue === 2) {
      return this.handleTab2();
    } else {
      return this.changeTab(newValue);
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
      <div data-test="container-submission-form-page-1">
        <Modal
          open={
            this.state.open &&
            fullName.length &&
            !this.props.submission.redirect
          }
          handleClose={this.handleClose}
          fullName={fullName}
          history={this.props.history}
        />
        <SubmissionFormPage1Wrap
          {...this.props}
          tab={this.state.tab}
          handleTab={this.handleTab}
          back={this.changeTab}
          handleUpload={this.handleUpload}
          signatureType={this.state.signatureType}
          toggleSignatureInputType={this.toggleSignatureInputType}
          clearSignature={this.clearSignature}
          generateSubmissionBody={this.generateSubmissionBody}
          handleError={this.handleError}
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
  submitForm: () => dispatch(submit("submissionPage1")),
  changeFieldValue: (field, value) => {
    dispatch(change("submissionPage1", field, value));
  }
});

export const SubmissionFormPage1Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage1Container);

export default withStyles(stylesPage1)(SubmissionFormPage1Connected);
