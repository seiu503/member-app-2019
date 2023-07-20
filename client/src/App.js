import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { renderToStaticMarkup } from "react-dom/server";
import Recaptcha from "react-google-invisible-recaptcha";
import queryString from "query-string";
import moment from "moment";
import { withTranslation, Trans, Translation } from "react-i18next";

import { Typography, CssBaseline, Box } from "@mui/material";

import * as Actions from "./store/actions";
import * as apiSFActions from "./store/actions/apiSFActions";
import * as apiSubmissionActions from "./store/actions/apiSubmissionActions";
import { detectDefaultLanguage, defaultWelcomeInfo } from "./utils/index";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import FormThankYou from "./components/FormThankYou";
import NotFound from "./components/NotFound";
import BasicSnackbar from "./components/BasicSnackbar";
import SubmissionFormPage1 from "./containers/SubmissionFormPage1";
import SubmissionFormPage2 from "./containers/SubmissionFormPage2";
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

const refCaptcha = React.createRef();

const styles = {};

export class AppUnconnected extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.language_picker = React.createRef();
    this.main_ref = React.createRef();
    this.legal_language = React.createRef();
    this.cape_legal = React.createRef();
    this.direct_pay = React.createRef();
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
    this.onResolved = this.onResolved.bind(this);
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
    this.recaptcha = refCaptcha;
  }

  async componentDidMount() {
    this._isMounted = true;

    // check and log environment
    console.log(`NODE_ENV front end: ${process.env.REACT_APP_ENV_TEXT}`);

    // detect default language from browser
    const defaultLanguage = detectDefaultLanguage();

    const changeLanguage = lng => {
      console.log(`NEW changeLanguage: ${lng}`);
      this.props.i18n.changeLanguage(lng);
    };

    // set form language based on detected default language
    changeLanguage(defaultLanguage);

    // check if language was set in query string
    const values = queryString.parse(this.props.location.search);
    if (values.lang) {
      console.log(`NEW changeLanguage: ${values.lang}`);
      changeLanguage(values.lang);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

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
    const changeLanguage = lng => {
      console.log(`NEW changeLanguage: ${lng}`);
      this.props.i18n.changeLanguage(lng);
    };

    changeLanguage(language);
  };

  renderBodyCopy = id => {
    let paragraphIds = [];
    // find all paragraphs belonging to this bodyCopy id
    Object.keys(welcomeInfo).forEach(key => {
      if (key.includes(`bodyCopy${id}`)) {
        paragraphIds.push(key);
      }
    });
    // for each paragraph selected, generate translated text
    // in appropriate language rendered inside a <p> tag
    let paragraphs = (
      <Translation>
        {(t, { i18n }) =>
          paragraphIds.map((id, index) => (
            <p key={id} data-testid={id}>
              {t(id)}
            </p>
          ))
        }
      </Translation>
    );
    // wrap in MUI typography element and return
    return (
      <Box
        sx={{
          // className={this.props.classes.body}
          color: "black"
        }}
      >
        <Typography
          variant="body1"
          component="div"
          align="left"
          gutterBottom
          data-testid="body"
        >
          {paragraphs}
        </Typography>
      </Box>
    );
  };

  renderHeadline = id => {
    // console.log(`renderHeadline: ${id}`);
    let headlineIds = [];
    // check translation file for headlines belonging to this headline id
    Object.keys(welcomeInfo).forEach(key => {
      if (key.includes(`headline${id}`)) {
        headlineIds.push(key);
      }
    });
    // console.log(`headlineIds ${headlineIds}`);
    // generate translated text in appropriate language rendered in a <h3> tag
    let headline = (
      <Translation>
        {(t, { i18n }) => (
          <span data-testid="headline-translate"> {t(`headline${id}`)} </span>
        )}
      </Translation>
    );
    // console.log(`this.state.headline.text: ${this.state.headline.text}`);
    // if this headline has not yet been translated there will be no
    // translation ids in the welcomeInfo JSON object
    // just render the raw copy in English
    if (!headlineIds.length) {
      headline = <React.Fragment>{this.state.headline.text}</React.Fragment>;
    }
    // console.log(headline);
    // wrap in MUI typography element and return
    return (
      <Box
        sx={{
          fontSize: {
            xs: "1.7rem",
            sm: "1.7rem"
          }
        }}
      >
        <Typography
          variant="h3"
          align="left"
          gutterBottom
          style={{ paddingTop: 20, fontSize: "2.4rem" }}
          data-testid="headline"
        >
          {headline}
        </Typography>
      </Box>
    );
  };

  async onResolved() {
    const token = await this.recaptcha.current.getResponse();
    this.props.apiSubmission.handleInput({
      target: { name: "reCaptchaValue", value: token }
    });
  }

  async updateSubmission(passedId, passedUpdates, formValues) {
    console.log("updateSubmission > App.js 300");
    console.log(passedId);
    this.props.actions.setSpinner();
    const id = passedId ? passedId : this.props.submission.submissionId;
    const medicaidResidents =
      formValues && formValues.medicaidResidents
        ? formValues.medicaidResidents
        : passedUpdates && passedUpdates.medicaidResidents
        ? passedUpdates.medicaidResidents
        : 0;
    const pmtUpdates = {
      payment_type: this.props.submission.formPage1.paymentType,
      medicaid_residents: medicaidResidents
    };
    const updates = passedUpdates ? passedUpdates : pmtUpdates;

    if (updates.hire_date) {
      let hireDate = moment(new Date(updates.hire_date));
      if (hireDate.isValid()) {
        updates.hire_date = formatSFDate(hireDate);
        console.log(`updates.hire_date: ${updates.hire_date}`);
      }
    }
    this.props.apiSubmission
      .updateSubmission(id, updates)
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
  async lookupSFContact(formValues) {
    console.log("lookupSFContact");
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
      if (!this.props.submission.salesforceId) {
        console.log("348");
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
    this.updateSubmission(submission_id, updates).catch(err => {
      console.error(err);
      return this.handleError(err);
    });
  }

  async prepForContact(values) {
    console.log("prepForContact");
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
        console.log("********");
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
          console.log("460");
          returnValues.employerId = employerObject
            ? employerObject.Id
            : "0016100000WERGeAAP"; // <= unknown employer
        }
        console.log(employerObject);
        console.log(returnValues.employerId);
      } else {
        // if employer has been manually changed since prefill, or if
        // this is a blank-slate form, find id in employer object
        // this will be an agency-level employer Id
        returnValues.employerId = employerObject
          ? employerObject.Id
          : "0016100000WERGeAAP"; // <= unknown employer
      }
      console.log("473");
      // save employerId to redux store for later
      this.props.apiSubmission.handleInput({
        target: { name: "employerId", value: returnValues.employerId }
      });
      // console.dir(returnValues);
      resolve(returnValues);
    });
  }

  prepForSubmission(values, partial) {
    return new Promise(resolve => {
      let returnValues = { ...values };

      if (!partial) {
        // set legal language
        returnValues.legalLanguage = this.props.submission.formPage1.legalLanguage;
      }
      // set campaign source
      const q = queryString.parse(this.props.location.search);
      console.log(q);
      const campaignSource =
        q && q.s ? q.s : q && q.src ? q.src : "Direct seiu503signup";

      console.log(campaignSource);
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
      resolve(returnValues);
    });
  }

  async generateSubmissionBody(values, partial) {
    console.log("generateSubmissionBody");
    const firstValues = await this.prepForContact(values);
    // console.log("firstValues", firstValues);
    const secondValues = await this.prepForSubmission(firstValues, partial);
    // console.log("secondValues", secondValues);
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
      direct_pay_auth,
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
    console.log(`hire_date: ${hire_date}`);

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
    const maintenance_of_effort = partial ? null : new Date();
    const seiu503_cba_app_date = partial ? null : new Date();

    return {
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
      direct_pay_auth,
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
  }

  async createSubmission(formValues, partial) {
    // create initial submission using data in tabs 1 & 2

    const body = await this.generateSubmissionBody(formValues, partial);
    // console.log(body);
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
    body.Worker__c = this.props.submission.salesforceId;
    return this.props.apiSF
      .createSFOMA(body)
      .then(result => {
        // console.log(result.type);
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
          this.changeTab(this.props.submission.formPage1.howManyTabs - 1);
        } else if (!this.props.submission.error) {
          // update submission status and redirect to CAPE tab
          // console.log("updating submission status");
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
                this.changeTab(2);
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
    console.log("createSFContact");
    const values = await this.prepForContact(formValues).catch(err =>
      console.log(err)
    );
    console.log("724");
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

  async updateSFContact(formValues) {
    console.log("updateSFContact");
    const values = await this.prepForContact(formValues);
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
        <Recaptcha
          ref={refCaptcha}
          sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
          onResolved={this.onResolved}
        />
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
            <Switch>
              <Route
                exact
                path="/"
                render={routeProps => (
                  <SubmissionFormPage1
                    tab={this.state.tab}
                    embed={embed}
                    // setRedirect={this.setRedirect}
                    legal_language={this.legal_language}
                    cape_legal={this.cape_legal}
                    direct_pay={this.direct_pay}
                    sigBox={this.sigBox}
                    recaptcha={refCaptcha}
                    onResolved={this.onResolved}
                    headline={this.state.headline}
                    body={this.state.body}
                    image={this.state.image}
                    renderBodyCopy={this.renderBodyCopy}
                    renderHeadline={this.renderHeadline}
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
                    translate={this.props.translate}
                    {...routeProps}
                  />
                )}
              />
              <Route
                exact
                path="/thankyou"
                render={routeProps => (
                  <FormThankYou
                    // setRedirect={this.setRedirect}
                    classes={this.props.classes}
                    paymentRequired={
                      this.props.submission.formPage1.paymentRequired
                    }
                    {...routeProps}
                  />
                )}
              />
              <Route
                exact
                path="/page2"
                render={routeProps => (
                  <SubmissionFormPage2
                    // setRedirect={this.setRedirect}
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
                    {...routeProps}
                  />
                )}
              />
              <Route
                path="*"
                render={routeProps => (
                  <NotFound classes={this.props.classes} {...routeProps} />
                )}
              />
            </Switch>
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

export default withRouter(withTranslation()(AppConnected));
