import React from "react";
import {
  getFormValues,
  submit,
  isSubmitting,
  isPristine,
  isValid,
  getFormSubmitErrors,
  reset
} from "redux-form";
import uuid from "uuid";

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
  formatSFDate
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
    const values = queryString.parse(this.props.location.search);
    // if find contact id, call API to fetch contact info for prefill
    if (values.id) {
      const { id } = values;
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
          // console.log(err);
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
          // console.log(err);
          openSnackbar("error", err);
        });
    });
  }

  toggleSignatureInputType = () => {
    let value = this.state.signatureType === "draw" ? "write" : "draw";
    this.setState({ signatureType: value });
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

  //  just navigate to previous tab, don't run validation on current tab
  back = (event, newValue) => {
    const newState = { ...this.state };
    newState.tab = newValue;
    this.setState({ ...newState });
  };

  // this is a hot mess and needs to be split
  // out into a dozen smaller utility functions
  // the whole iframe fetch routine should be a separate function
  // so should saving sig & legal language
  async handleTab(event, newValue, formValues) {
    if (newValue === 2) {
      // perform signature processing steps and save value to redux store
      // before ref disappears
      if (this.state.signatureType === "write") {
        // console.log('163');
        this.props.apiSubmission.handleInput({
          target: { name: "signature", value: formValues.signature }
        });
      }
      if (this.state.signatureType === "draw") {
        // console.log('169');
        let sigUrl;
        try {
          sigUrl = await this.handleUpload(
            formValues.firstName,
            formValues.lastName
          );
          // console.log(`177: ${sigUrl}`);
          this.props.apiSubmission.handleInput({
            target: { name: "signature", value: sigUrl }
          });
        } catch (err) {
          // console.log(`184: ${err}`);
          return openSnackbar(
            "error",
            err ||
              "An error occured while trying to save your Signature. Please try again."
          );
        }
      }

      // if submission type requires payment processing, then fetch iFrame URL
      // for use in next tab
      if (
        formValues.employerType.toLowerCase() === "community member" ||
        formValues.employerType.toLowerCase() === "retired" ||
        formValues.employerType.toLowerCase() === "adult foster home"
      ) {
        // set payment required to true
        this.props.apiSubmission.handleInput({
          target: { name: "paymentRequired", value: true }
        });
        const dobRaw =
          formValues.mm + "/" + formValues.dd + "/" + formValues.yyyy;
        const birthdate = formatSFDate(dobRaw);
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
          // ^^ this needs to be formValues.preferredLanguage
          // but API only accepts 1 of 2 ISO codes for now
          cellPhone: formValues.mobilePhone,
          birthDate: birthdate,
          employerExternalId: "SW001",
          // ^^ fixed value for dev / staging
          // this will be Agency number in production
          employeeExternalId: uuid.v4(),
          // ^^ random uuid for now, will be Submission ID in production
          agreesToMessages: !formValues.textAuthOptOut,
          duesAmount: 1.23, // required by unioni.se, sending default
          duesCurrency: "USD", // required by unioni.se, sending default
          duesDayOfMonth: 15, // required by unioni.se, sending default
          duesActiveFrom: "2019-05-20", // required by unioni.se, sending default data
          deductionType: "CAPE", // required by unioni.se, sending default
          deductionAmount: 2.34, // required by unioni.se, sending default
          deductionCurrency: "USD", // required by unioni.se, sending default
          deductionDayOfMonth: 15 // required by unioni.se, sending default
        };
        // console.log(JSON.stringify(body));
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
          // console.log(`261: ${err}`);
          return openSnackbar(
            "error",
            err || "Sorry, something went wrong. Please try again."
          );
        }
      }

      console.log(this.props.legal_language);
      console.log(this.props.direct_deposit);
      console.log(this.props.direct_pay);
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
      // navigate to next tab
      const newState = { ...this.state };
      newState.tab = newValue;
      this.setState({ ...newState });
    } else {
      // navigate to next tab
      const newState = { ...this.state };
      newState.tab = newValue;
      this.setState({ ...newState });
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
          back={this.back}
          handleUpload={this.handleUpload}
          signatureType={this.state.signatureType}
          toggleSignatureInputType={this.toggleSignatureInputType}
          clearSignature={this.clearSignature}
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
  submitForm: () => dispatch(submit("submissionPage1"))
});

export const SubmissionFormPage1Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage1Container);

export default withStyles(stylesPage1)(SubmissionFormPage1Connected);
