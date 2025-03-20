import React, { Component } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { renderToStaticMarkup } from "react-dom/server";
import queryString from "query-string";
import moment from "moment";
import detector from "i18next-browser-languagedetector";
import { withTranslation, Trans, Translation } from "react-i18next";

import { Typography, CssBaseline, Box } from "@mui/material";

import * as Actions from "./store/actions";
import * as apiSFActions from "./store/actions/apiSFActions";
import * as apiSubmissionActions from "./store/actions/apiSubmissionActions";
import { defaultWelcomeInfo, detectDefaultLanguage, languageTransform } from "./utils/index";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import withRouter from "./components/ComponentWithRouterProp";
import FormThankYou from "./components/FormThankYou";
import NotFound from "./components/NotFound";
import BasicSnackbar from "./components/BasicSnackbar";
import SubmissionFormPage1 from "./containers/SubmissionFormPage1";
import SubmissionFormPage2Function from "./containers/SubmissionFormPage2Function";
import Spinner from "./components/Spinner";
import {
  // handleError,
  formatBirthdate,
  findEmployerObject,
  formatSFDate,
  calcEthnicity,
  removeFalsy,
  languageMap
} from "./components/SubmissionFormElements";

import SamplePhoto from "./img/sample-form-photo.jpg";

import welcomeInfo from "./translations/welcomeInfo.json";

// const refCaptcha = React.createRef();

const styles = {};

export class AppUnconnected extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.language_picker = React.createRef();
    this.main_ref = React.createRef();
    this.legal_language = React.createRef();
    this.cape_legal = React.createRef();
    this.sigBox = React.createRef();
    this.state = {
      deleteDialogOpen: false,
      animation: false,
      more: false,
      headline: {
        text: defaultWelcomeInfo.headline,
        id: 0
      },
      body: {
        text: defaultWelcomeInfo.body,
        id: 0
      },
      image: {},
      tab: undefined,
      userSelectedLanguage: "",
      snackbar: {
        open: false,
        variant: "info",
        message: null
      }
    };
    this.createSubmission = this.createSubmission.bind(this);
    this.updateSubmission = this.updateSubmission.bind(this);
    this.lookupSFContact = this.lookupSFContact.bind(this);
    this.saveSubmissionErrors = this.saveSubmissionErrors.bind(this);
    this.prepForContact = this.prepForContact.bind(this);
    this.prepForSubmission = this.prepForSubmission.bind(this);
    this.createSFContact = this.createSFContact.bind(this);
    this.updateSFContact = this.updateSFContact.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.generateSubmissionBody = this.generateSubmissionBody.bind(this);
    this.openSnackbar = this.openSnackbar.bind(this);
    this.handleError = this.handleError.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.detectLanguage = this.detectLanguage.bind(this);
  }

  async componentDidMount() {
    // console.log(`APP this.props.classes`);
    // console.log(this.props);

    this._isMounted = true;

    // check and log environment
    console.log(`NODE_ENV front end: ${process.env.REACT_APP_ENV_TEXT}`);
    console.log("### 20250319 prod 04:17PM ###");

    await this.detectLanguage();
    
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async detectLanguage() {
    // detect default language from browser
    const defaultLanguage = detectDefaultLanguage().lang;
    console.log(`defaultLanguage: ${defaultLanguage}`);

    // set form language based on detected default language
    await this.changeLanguage(defaultLanguage);

    // check if language was set in query string
    const values = queryString.parse(this.props.location.search);
    if (values.lang) {
      await this.changeLanguage(values.lang);
    }
  }

  async changeLanguage(lng) {
    // lng = code
    // console.log(`NEW changeLanguage: ${lng} #######################`);
    // console.dir(lng);
    let code = lng;
    if (typeof lng === "object") {
      code = lng.lang;
    } 
    // console.log(`code: ${code}`);
    this.props.i18n.changeLanguage(code || "en");
    const preferredLanguage = languageTransform(code)['engName'];
    // console.log(`preferredLanguage: ${preferredLanguage}`);
    await this.props.apiSubmission.handleInputSPF({
     target: { 
        name: "p4cReturnValues", 
        value: {
         ...this.props.submission.p4cReturnValues, 
         preferredLanguage: preferredLanguage
        }
      }
    });
    await this.props.apiSubmission.handleInput({
       target: { name: "preferredLanguage", value: preferredLanguage }
    });

    // console.log(`this.props.submission.formPage1.preferredLanguage: ${this.props.submission.formPage1.preferredLanguage }`);
    // console.log(`this.props.submission.p4cReturnValues:`);
    // console.dir(this.props.submission.p4cReturnValues);
    // console.log(`this.props.submission.p4cReturnValues.preferredLanguage: ${this.props.submission.p4cReturnValues.preferredLanguage}`);
  };

  openSnackbar = async (variant, message) => {
    const newState = { ...this.state };
    newState.snackbar = {
      open: true,
      variant,
      message
    };

    this._isMounted && this.setState({ ...newState });
  };

  closeSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this._isMounted &&
      this.setState({
        snackbar: {
          open: false
        }
      });
  };

  handleError = err => {
    return this.openSnackbar(
      "error",
      err && err.message
        ? err.message
        : err || "Sorry, something went wrong. Please try again."
    );
    // console.log(err);
  };

  updateLanguage = e => {
    console.log("updateLanguage");
    // update value of select
    const newState = { ...this.state };
    newState.userSelectedLanguage = e.target.value;
    this._isMounted && this.setState({ ...newState });

    // detect default language from browser
    const defaultLanguage = detectDefaultLanguage();
    const userChosenLanguage =
      this.language_picker && this.language_picker.current
        ? this.language_picker.current.value
        : null;
    // console.log(userChosenLanguage);
    const languageCode = languageMap[userChosenLanguage];
    // console.log(languageCode);
    const language = languageCode ? languageCode : defaultLanguage;
    // set form language based on detected default language

    this.changeLanguage(language);
  };

  async updateSubmission(passedId, passedUpdates, formValues) {
    console.log("App 293 updateSubmission");
    console.log(passedId);
    this.props.actions.setSpinner();
    const id = passedId ? passedId : this.props.submission.submissionId;

    if (passedUpdates.hire_date) {
      let hireDate = moment(new Date(passedUpdates.hire_date));
      if (hireDate.isValid()) {
        passedUpdates.hire_date = formatSFDate(hireDate);
        console.log(`passedUpdates.hire_date: ${passedUpdates.hire_date}`);
      }
    }
    this.props.apiSubmission
      .updateSubmission(id, passedUpdates)
      .then(result => {
        console.log(result);
        if (
          result.type === "UPDATE_SUBMISSION_FAILURE" ||
          this.props.submission.error
        ) {
          console.log(this.props.submission.error);
          return this.handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        return this.handleError(err);
      });
  }

  // lookup SF Contact by first, last, email; if none found then create new
  // called from SubmissionFormPage1.jsx > 229 (GenerateCAPEBody), 565 (handleTab1)
  async lookupSFContact(formValues) {
    console.log("App 337 lookupSFContact");
    console.dir(formValues);
    if (
      formValues.firstName &&
      formValues.lastName &&
      formValues.homeEmail &&
      formValues.employerName &&
      !this.props.submission.salesforceId
    ) {
      // lookup contact by first/last/email
      const lookupBody = {
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        home_email: formValues.homeEmail
      };
      await this.props.apiSF.lookupSFContact(lookupBody).catch(err => {
        console.error(err);
        return this.handleError(err);
      });

      // if nothing found on lookup, need to create new contact
      if (!this.props.submission.salesforceId && !this.props.submission.p4cReturnValues.salesforceId) {
        console.log("App 359: No SF Contact found on lookup (no salesforceId in redux store), creating new");
        console.dir(formValues);
        await this.createSFContact(formValues)
          .then(() => {
            // console.log(this.props.submission.salesforceId);
          })
          .catch(err => {
            console.error(err);
            return this.handleError(err);
          });
      }
    }
  }

  async saveSubmissionErrors(submission_id, method, error) {
    // 1. retrieve existing errors array from current submission
    let { submission_errors } = this.props.submission.currentSubmission;
    if (submission_errors === null || submission_errors === undefined) {
      submission_errors = "";
    }
    // 2. add new data to string
    submission_errors += `Attempted method: ${method}, Error: ${error}. `;
    // 3. update submission_errors and submission_status on submission by id
    const updates = {
      submission_errors,
      submission_status: "error"
    };
    console.log("372", submission_id);
    this.updateSubmission(submission_id, updates).catch(err => {
      console.error(err);
      return this.handleError(err);
    });
  }

  async prepForContact(values) {
    console.log("App 394 prepForContact start");
    console.dir(values);
    return new Promise(resolve => {
      let returnValues = { ...values };

      // format birthdate
      let birthdate;
      if (values.mm && values.dd && values.yyyy) {
        birthdate = formatBirthdate(values);
      }

      returnValues.birthdate = birthdate;
      // find employer object and set employer-related fields
      let employerObject;

      if (values.employerName) {
        // console.log("********");
        console.log(`employerName: ${values.employerName}`);
        // console.dir(this.props.submission.employerObjects);
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          values.employerName
        );
      }

      if (employerObject) {
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else if (
        values.employerName &&
        values.employerName.toLowerCase() ===
          "personal support worker (paid by ppl)"
      ) {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "PPL PSW"
        );
        returnValues.agencyNumber = employerObject
          ? employerObject.Agency_Number__c
          : 0;
      } else if (
        values.employerName &&
        values.employerName.toLowerCase() ===
          "personal support worker (paid by state of oregon)"
      ) {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "State PSW"
        );
        returnValues.agencyNumber = employerObject
          ? employerObject.Agency_Number__c
          : 0;
      } else if (
        values.employerName &&
        values.employerName.toLowerCase() ===
          "homecare worker (aging and people with disabilities)"
      ) {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "State APD"
        );
        returnValues.agencyNumber = employerObject
          ? employerObject.Agency_Number__c
          : 0;
      } else {
        // console.log(`no agency number found for ${values.employerName}`);
        returnValues.employerName = "Unknown (DEFAULT)";
        returnValues.agencyNumber = 0;
      }

      // console.log(`AgencyNumber: ${returnValues.agencyNumber}`);

      if (
        this.props.submission.formPage1 &&
        this.props.submission.formPage1.prefillEmployerId
      ) {
        if (!this.props.submission.formPage1.prefillEmployerChanged) {
          // if this is a prefill and employer has not been changed manually,
          // return original prefilled employer Id
          // this will be a worksite-level account id in most cases
          returnValues.employerId = this.props.submission.formPage1.prefillEmployerId;
        } else {
          // if employer has been manually changed since prefill, or if
          // this is a blank-slate form, find id in employer object
          // this will be an agency-level employer Id
          console.log("App 478 prepForContact");
          returnValues.employerId = employerObject
            ? employerObject.Id
            : "0016100000WERGeAAP"; // <= unknown employer
        }
        console.log('employerObject');
        console.log(employerObject);
        console.log(`employerId: ${returnValues.employerId}`);
      } else {
        // if employer has been manually changed since prefill, or if
        // this is a blank-slate form, find id in employer object
        // this will be an agency-level employer Id
        returnValues.employerId = employerObject
          ? employerObject.Id
          : "0016100000WERGeAAP"; // <= unknown employer
      }
      console.log("App 494 prepForContact");
      // save employerId to redux store for later
      this.props.apiSubmission.handleInput({
        target: { name: "employerId", value: returnValues.employerId }
      });
      // console.dir(returnValues);

      console.log('saving returnValues to redux to avoid duplicate calls later');
      this.props.apiSubmission.handleInputSPF({
        target: { name: "p4cReturnValues", value: {... returnValues } }
      });

      console.log(`checking redux store for returnValues ####################`);
      console.log(this.props.submission.p4cReturnValues);

      console.log("App 509 prepForContact resolve");
      resolve(returnValues);
    });
  }

  prepForSubmission(values, partial) {
    console.log("App 515 prepForSubmission start");
    return new Promise(resolve => {
      let returnValues = { ...values };

      if (!partial) {
        // set legal language
        returnValues.legalLanguage = this.props.submission.formPage1.legalLanguage;
      }
      // set campaign source
      const q = queryString.parse(this.props.location.search);
      console.log("queryString:");
      console.log(q);
      const campaignSource =
        q && q.s ? q.s : q && q.src ? q.src : "Direct seiu503signup";

      console.log(`campaignSource: ${campaignSource}`);
      returnValues.campaignSource = campaignSource;
      // set salesforce id
      if (!values.salesforceId) {
        if (q && q.cId) {
          returnValues.salesforceId = q.cId;
        }
        if (this.props.submission.salesforce_id) {
          returnValues.salesforceId = this.props.submission.salesforce_id;
        }
      }
      console.log("App 541 prepForSubmission resolve");
      resolve(returnValues);
    });
  }

  async generateSubmissionBody(values, partial) {
    console.log("App 547 generateSubmissionBody start");
    const firstValues = await this.prepForContact(values);
    console.log("firstValues", firstValues);
    const secondValues = await this.prepForSubmission(firstValues, partial);
    console.log("secondValues", secondValues);
    secondValues.termsAgree = values.termsAgree;
    secondValues.signature = firstValues.signature
      ? firstValues.signature
      : this.props.submission.formPage1.signature;
    // console.log(`signature: ${secondValues.signature}`);
    secondValues.legalLanguage = this.props.submission.formPage1.legalLanguage;
    secondValues.reCaptchaValue = this.props.submission.formPage1.reCaptchaValue;

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
      salesforceId,
      termsAgree,
      scholarshipBox,
      campaignSource,
      legalLanguage,
      signature,
      reCaptchaValue,
      mail_to_city,
      mail_to_state,
      mail_to_street,
      mail_to_postal_code,
      lgbtq_id,
      trans_id,
      disability_id,
      deaf_or_hard_of_hearing,
      blind_or_visually_impaired,
      gender,
      gender_other_description,
      gender_pronoun,
      job_title,
      worksite,
      work_email,
      work_phone,
      hire_date
    } = secondValues;
    console.log(`preferredLanguage: ${preferredLanguage}`);

    // if(!preferredLanguage) {
    //   preferredLanguage = this.state.userSelectedLanguage ? this.state.userSelectedLanguage : ""
    // }

    if (hire_date) {
      let hireDate = moment(new Date(hire_date));
      if (hireDate.isValid()) {
        hire_date = formatSFDate(hireDate);
        console.log(`hire_date: ${hire_date}`);
      }
    }

    if (!firstName) {
      firstName = values.first_name;
      lastName = values.last_name;
      homeEmail = values.home_email;
    }

    const ethnicity = calcEthnicity(values);
    console.log(`############ APP ###########`);
    console.log(`ethnicity: ${ethnicity}`);
    const maintenance_of_effort = partial ? null : new Date();
    const seiu503_cba_app_date = partial ? null : new Date();

    console.log("App 628 generateSubmissionBody resolve");
    const submissionBody = {
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
      scholarship_flag: scholarshipBox,
      signature: signature,
      text_auth_opt_out: textAuthOptOut,
      online_campaign_source: campaignSource,
      legal_language: legalLanguage,
      maintenance_of_effort,
      seiu503_cba_app_date,
      immediate_past_member_status: immediatePastMemberStatus,
      salesforce_id: salesforceId || this.props.submission.salesforceId,
      reCaptchaValue,
      mail_to_city,
      mail_to_state,
      mail_to_street,
      mail_to_postal_code,
      ethnicity,
      lgbtq_id,
      trans_id,
      disability_id,
      deaf_or_hard_of_hearing,
      blind_or_visually_impaired,
      gender,
      gender_other_description,
      gender_pronoun,
      job_title,
      hire_date,
      worksite,
      work_email,
      work_phone
    };
    console.log('App 674 generateSubmissionBody');
    console.log(submissionBody);
    return submissionBody;
  }

  // called from handleTab2 in SubmissionFormPage1.jsx
  async createSubmission(formValues, partial) {
    // create initial submission using data in tabs 1 & 2
    console.log("App 682 createSubmission start");
    const body = await this.generateSubmissionBody(formValues, partial);
    // console.log(`@@@@@@@@@@  SUBMISSIONBODY  @@@@@@@@@`);
    // console.log(formValues);
    // console.log(`body.preferredLanguage: ${body.preferredLanguage}`);
    // console.log(`body.preferred_language: ${body.preferred_language}`);
    const cleanBody = removeFalsy(body);
    // console.log(cleanBody);
    await this.props.apiSubmission
      .addSubmission(cleanBody)
      .then(result => {
        if (
          result.type !== "ADD_SUBMISSION_SUCCESS" ||
          this.props.submission.error
        ) {
          const err =
            this.props.submission.error ||
            "An error occurred while saving your Submission";
          console.error(err);
          return this.handleError(err);
        }
      })
      .catch(err => {
        console.error(err);
        return this.handleError(err);
      });

    // if no payment is required, we're done with saving the submission
    // we can write the OMA to SF and then move on to the CAPE ask

    // we're adding the tmp data here without adding it to the postgres db because we are lazy

    const q = queryString.parse(this.props.location.search);
    console.log("queryString:");
    console.log(q);

    // set tmp data
    const tmp1 = 
      q && q.tmp1 ? q.tmp1 : null;

    console.log(`tmp1: ${tmp1}`);

    body.Worker__c = this.props.submission.salesforceId;
    body.tmp_1 = tmp1;
    // console.log(`##########   OMABODY   ###########`);
    // console.log(body);

    // create Online Member App record
    return this.props.apiSF
      .createSFOMA(body)
      .then(result => {
        console.log("App 728 createSubmission");
        console.log(result.type);
        console.log(`submission errors: ${this.props.submission.error}`);
        if (
          result.type !== "CREATE_SF_OMA_SUCCESS" ||
          this.props.submission.error
        ) {
          this.saveSubmissionErrors(
            this.props.submission.submissionId,
            "createSFOMA",
            this.props.submission.error
          );
          // goto CAPE tab
          console.log('moving to CAPE Tab');
          this.changeTab(2);
        } else if (!this.props.submission.error) {

          // // what if we don't update submission status after creating OMA? does that fix the endless loop?
          // return null; 


          // update submission status and redirect to CAPE tab
          console.log("updating submission status");
          this.props.apiSubmission
            .updateSubmission(this.props.submission.submissionId, {
              submission_status: "Success"
            })
            .then(result => {
              if (
                result.type === "UPDATE_SUBMISSION_FAILURE" ||
                this.props.submission.error
              ) {
                console.log(this.props.submission.error);
                return this.handleError(this.props.submission.error);
              } else {
                console.log("createSubmission resolve");
                return null;
                // this.changeTab(2);
              }
            })
            .catch(err => {
              console.error(err);
              return this.handleError(err);
            });
        }
      })
      .catch(err => {
        this.saveSubmissionErrors(
          this.props.submission.submissionId,
          "createSFOMA",
          err
        );
        console.error(err);
        return this.handleError(err);
      });
  }

  async createSFContact(formValues) {
    console.log("App 777 createSFContact");
    let values;
    if (this.props.submission.formPage1.completePrefill) {
      console.log('completePrefill = true; skipping p4c');
      values = { ...this.props.submission.p4cReturnValues };
    } else {
      console.log('completePrefill = false; running p4c');
      values = await this.prepForContact(formValues);
    }
    console.log("App 786 createSFContact");
    console.log(values);
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

    await this.props.apiSF.createSFContact(body).catch(err => {
      console.error(err);
      return this.handleError(err);
    });
  }

  // called from SFP1 > 570 handleTab1 / updateContactAndMoveToNextTab
  async updateSFContact(formValues) {
    console.log("App 835 updateSFContact");
    let values;
    if (this.props.submission.formPage1.completePrefill) {
      console.log('completePrefill = true; skipping p4c');
      values = { ...this.props.submission.p4cReturnValues };
    } else {
      console.log('completePrefill = false; running p4c');
      values = await this.prepForContact(formValues);
    }
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    // console.log(values);

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

    await this.props.apiSF.updateSFContact(id, body).catch(err => {
      console.error(err);
      return this.handleError(err);
    });
  }

  // just navigate to tab, don't run validation on current tab
  changeTab = newValue => {
    // console.log(`changeTab: ${newValue}`);
    const newState = { ...this.state };
    newState.tab = newValue;
    this._isMounted &&
      this.setState({ ...newState }, () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  };

  render() {
    const values = queryString.parse(this.props.location.search);
    const embed = values.embed;
    const { classes } = this.props;
    const { loading } = this.props.appState;
    const backgroundImage = embed
      ? "none"
      : `url(${
          this.state.image && this.state.image.url
            ? this.state.image.url
            : SamplePhoto
        })`;
    const backgroundImageStyle = { backgroundImage };
    const { t, i18n } = this.props;

    return (
      <Box
        data-testid="component-app"
        style={backgroundImageStyle}
        sx={{
          width: "100vw",
          minHeight: "100vh",
          height: "100%",
          backgroundAttachment: "fixed",
          backgroundPosition: "bottom",
          backgroundImage: {
            xs: "none",
            sm: "none"
          },
          backgroundSize: {
            md: "cover"
          }
        }}
      >
        <CssBaseline />
        {!embed && (
          <NavBar
            main_ref={this.main_ref}
            language_picker={this.language_picker}
            updateLanguage={this.updateLanguage}
            userSelectedLanguage={this.state.userSelectedLanguage}
          />
        )}
        <BasicSnackbar
          open={this.state.snackbar.open}
          onClose={this.closeSnackbar}
          variant={this.state.snackbar.variant}
          message={this.state.snackbar.message}
        />
        {loading && <Spinner />}
        <main id="main" ref={this.main_ref}>
          <Box
            sx={{
              maxWidth: 1200,
              margin: "auto",
              height: "100%",
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Routes>
              <Route
                exact
                path="/"
                element={
                  <SubmissionFormPage1
                    tab={this.state.tab}
                    embed={embed}
                    userSelectedLanguage={this.state.userSelectedLanguage}
                    detectLanguage={this.detectLanguage}
                    legal_language={this.legal_language}
                    cape_legal={this.cape_legal}
                    sigBox={this.sigBox}
                    headline={this.state.headline}
                    body={this.state.body}
                    image={this.state.image}
                    renderBodyCopy={this.renderBodyCopy}
                    createSubmission={this.createSubmission}
                    updateSubmission={this.updateSubmission}
                    lookupSFContact={this.lookupSFContact}
                    saveSubmissionErrors={this.saveSubmissionErrors}
                    generateSubmissionBody={this.generateSubmissionBody}
                    prepForContact={this.prepForContact}
                    prepForSubmission={this.prepForSubmission}
                    createSFContact={this.createSFContact}
                    updateSFContact={this.updateSFContact}
                    changeTab={this.changeTab}
                    handleError={this.handleError}
                    openSnackbar={this.openSnackbar}
                    apiSubmission={this.props.apiSubmission}
                  />
                }
              />
              <Route
                exact
                path="/thankyou"
                element={
                  <FormThankYou
                    classes={this.props.classes}
                    paymentRequired={
                      this.props.submission.formPage1.paymentRequired
                    }
                  />
                }
              />
              <Route
                exact
                path="/page2"
                element={
                  <SubmissionFormPage2Function
                    createSubmission={this.createSubmission}
                    updateSubmission={this.updateSubmission}
                    lookupSFContact={this.lookupSFContact}
                    saveSubmissionErrors={this.saveSubmissionErrors}
                    prepForContact={this.prepForContact}
                    prepForSubmission={this.prepForSubmission}
                    createSFContact={this.createSFContact}
                    updateSFContact={this.updateSFContact}
                    handleError={this.handleError}
                    openSnackbar={this.openSnackbar}
                    history={this.props.history}
                  />
                }
              />
              <Route
                path="*"
                element={<NotFound classes={this.props.classes} />}
              />
            </Routes>
          </Box>
        </main>
        <Footer classes={this.props.classes} />
      </Box>
    );
  }
}

AppUnconnected.propTypes = {
  apiSubmission: PropTypes.shape({
    handleInput: PropTypes.func
  }).isRequired
};

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch)
});

export const AppConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppUnconnected);

export default withTranslation()(withRouter(AppConnected));
// export default withTranslation()(AppConnected);
