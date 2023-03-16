import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { withLocalize, setActiveLanguage } from "react-localize-redux";
import { renderToStaticMarkup } from "react-dom/server";
import Recaptcha from "react-google-invisible-recaptcha";
import queryString from "query-string";
import moment from "moment";
import { Translate } from "react-localize-redux";

import { Typography, CssBaseline, Box } from "@mui/material";
import { withStyles } from "@mui/styles";

import * as Actions from "./store/actions";
import * as apiContentActions from "./store/actions/apiContentActions";
import * as apiProfileActions from "./store/actions/apiProfileActions";
import * as apiSFActions from "./store/actions/apiSFActions";
import * as apiSubmissionActions from "./store/actions/apiSubmissionActions";
import { detectDefaultLanguage, defaultWelcomeInfo } from "./utils/index";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import FormThankYou from "./components/FormThankYou";
import NoAccess from "./components/NoAccess";
import NotFound from "./components/NotFound";
import Logout from "./containers/Logout";
import Login from "./components/Login";
import BasicSnackbar from "./components/BasicSnackbar";
// import Dashboard from "./containers/Dashboard";
import TextInputForm from "./containers/TextInputForm";
import SubmissionFormPage1 from "./containers/SubmissionFormPage1";
import SubmissionFormPage2 from "./containers/SubmissionFormPage2";
import Notifier from "./containers/Notifier";
// import ContentLibrary from "./containers/ContentLibrary";
import Spinner from "./components/Spinner";
import UserForm from "./containers/UserForm";
import {
  // handleError,
  formatBirthdate,
  findEmployerObject,
  formatSFDate,
  calcEthnicity,
  removeFalsy,
  languageMap
} from "./components/SubmissionFormElements";
// import { openSnackbar } from "./containers/Notifier";

import SamplePhoto from "./img/sample-form-photo.jpg";

import globalTranslations from "./translations/globalTranslations";
import welcomeInfo from "./translations/welcomeInfo.json";

const refCaptcha = React.createRef();

// const styles = theme => ({
//   root: {
//     flexGrow: 1,
//     boxSizing: "border-box"
//   },
//   notFound: {
//     height: "80vh",
//     width: "auto",
//     marginTop: "-60px"
//   },
//   container: {
//     maxWidth: 1200,
//     margin: "auto",
//     height: "100%",
//     minHeight: "100vh",
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "center"
//   },
//   appRoot: {
//     width: "100vw",
//     height: "100%",
//     minHeight: "80vh",
//     backgroundAttachment: "fixed",
//     backgroundPosition: "bottom",
//     [theme.breakpoints.down("sm")]: {
//       backgroundImage: "none"
//     },
//     [theme.breakpoints.up("xl")]: {
//       backgroundSize: "cover"
//     }
//   },
//   message: {
//     margin: "auto",
//     width: "50%",
//     textAlign: "center",
//     height: "50%",
//     [theme.breakpoints.down("sm")]: {
//       width: "100%",
//       height: "100%"
//     },
//     lineHeight: "2em",
//     background: "white",
//     borderRadius: "4px",
//     padding: 60,
//     fontSize: "1.2em"
//   },
//   row: {
//     display: "flex",
//     justifyContent: "center",
//     [theme.breakpoints.down("md")]: {
//       flexWrap: "wrap"
//     }
//   },
//   button: {
//     height: 100,
//     margin: "20px auto",
//     width: 100
//   },
//   footer: {
//     width: "100vw",
//     margin: "auto",
//     position: "fixed",
//     backgroundColor: theme.palette.primary.main,
//     bottom: 0,
//     padding: 25,
//     height: 73,
//     [theme.breakpoints.down("sm")]: {
//       height: 53
//     },
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "middle",
//     boxShadow: "0 1px 5px 2px rgba(0,0,0,.2)",
//     zIndex: 2,
//     color: "white"
//   },
//   footerIcon: {
//     width: 30,
//     height: "auto",
//     marginTop: 15,
//     [theme.breakpoints.down("sm")]: {
//       marginTop: 5
//     },
//     fill: theme.palette.secondary.main
//   },
//   spinner: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     display: "block"
//   },
//   form: {
//     background: "white"
//   },
//   thankYouCopy: {
//     lineHeight: 1.4,
//     textAlign: "left"
//   }
// });

const styles = {};

export class AppUnconnected extends Component {
  constructor(props) {
    super(props);
    this.language_picker = React.createRef();
    this.main_ref = React.createRef();
    this.legal_language = React.createRef();
    this.cape_legal = React.createRef();
    this.direct_pay = React.createRef();
    this.direct_deposit = React.createRef();
    this.sigBox = React.createRef();
    this.props.initialize({
      languages: [
        { name: "English", code: "en" },
        { name: "Spanish", code: "es" },
        { name: "Russian", code: "ru" },
        { name: "Vietnamese", code: "vi" },
        { name: "Chinese", code: "zh" }
      ],
      options: {
        renderToStaticMarkup,
        renderInnerHtml: false,
        defaultLanguage: "en"
      }
    });
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
    this.props.addTranslation(globalTranslations);
    this.setRedirect = this.setRedirect.bind(this);
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
    this.resubmitSubmission = this.resubmitSubmission.bind(this);
    this.generateSubmissionBody = this.generateSubmissionBody.bind(this);
    this.openSnackbar = this.openSnackbar.bind(this);
    this.handleError = this.handleError.bind(this);
    this.recaptcha = refCaptcha;
  }

  async componentDidMount() {
    console.log(`NODE_ENV front end: ${process.env.REACT_APP_ENV_TEXT}`);
    // console.log("Wednesday 1/15 1:11pm");
    // detect default language from browser
    const defaultLanguage = detectDefaultLanguage();
    // set form language based on detected default language
    this.props.setActiveLanguage(defaultLanguage);
    // If not logged in, check local storage for authToken
    // if it doesn't exist, it returns the string "undefined"
    if (!this.props.appState.loggedIn) {
      // don't run this sequence if landing on admin dash for first time
      // after google auth -- there will be nothing in localstorage yet
      if (!(this.props.match && this.props.match.params.id)) {
        // console.log("not logged in, looking for id & token in localStorage");
        const authToken = window.localStorage.getItem("authToken");
        const userId = window.localStorage.getItem("userId");
        // console.log(`authToken: ${authToken}, userId: ${userId}`);
        if (
          authToken &&
          authToken !== "undefined" &&
          userId &&
          userId !== "undefined"
        ) {
          // console.log("found id & token in localstorage, validating token");
          // console.log(!!authToken, userId);
          this.props.apiProfile
            .validateToken(authToken, userId)
            .then(result => {
              console.log(result.type);
              if (result.type === "VALIDATE_TOKEN_FAILURE") {
                // console.log("VALIDATE_TOKEN_FAILURE: clearing localStorage");
                return window.localStorage.clear();
              } else {
                // console.log(
                //   `validate token success: ${!!authToken}, ${userId}`
                // );
                this.props.apiProfile
                  .getProfile(authToken, userId)
                  .then(result => {
                    // console.log(result.type);
                    if (result.type === "GET_PROFILE_SUCCESS") {
                      // console.log(
                      //   `setting user type here: ${result.payload.type}`
                      // );
                      this.props.actions.setLoggedIn(result.payload.type);
                      // check for redirect url in local storage
                      const redirect = window.localStorage.getItem("redirect");
                      if (redirect) {
                        // redirect to originally requested page and then
                        // clear value from local storage
                        this.props.history.push(redirect);
                        window.localStorage.removeItem("redirect");
                      }
                    } else {
                      // console.log("not logged in", authToken, userId);
                      // console.log(result.type);
                    }
                  });
              }
            })
            .catch(err => {
              console.log(err);
              return window.localStorage.clear();
            });
        }
      }
    }
    const values = queryString.parse(this.props.location.search);
    // fetch dynamic content
    if (values.h || values.b || values.i) {
      const { h, i, b } = values;
      let idArray = [h, i, b];
      const queryIds = idArray.filter(id => (id ? id : null));
      queryIds.forEach(id => {
        this.props.apiContent
          .getContentById(id)
          .then(result => {
            const message =
              result.payload && result.payload.message
                ? result.payload.message
                : "There was an error loading the content.";
            if (
              !result ||
              !result.payload ||
              (result.payload && result.payload.message)
            ) {
              console.log(message);
            } else {
              switch (result.payload.content_type) {
                case "headline":
                  return this.setState({
                    headline: {
                      text: result.payload.content,
                      id: id
                    }
                  });
                case "bodyCopy":
                  return this.setState({
                    body: {
                      text: result.payload.content,
                      id: id
                    }
                  });
                case "image":
                  return this.setState({
                    image: {
                      url: result.payload.content,
                      id: id
                    }
                  });
                default:
                  break;
              }
            }
          })
          .catch(err => {
            console.log(err);
          });
      });
    }
    if (values.lang) {
      this.props.setActiveLanguage(values.lang);
    }
  }

  openSnackbar = async (variant, message) => {
    const newState = { ...this.state };
    newState.snackbar = {
      open: true,
      variant,
      message
    };

    this.setState({ ...newState });
  };

  closeSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({
      snackbar: {
        open: false
      }
    });
  };

  handleError = err => {
    return this.openSnackbar(
      "error",
      err || "Sorry, something went wrong. Please try again."
    );
    // console.log(err);
  };

  updateLanguage = e => {
    // console.log("updateLanguage");
    // update value of select
    const newState = { ...this.state };
    newState.userSelectedLanguage = e.target.value;
    this.setState({ ...newState });

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
    this.props.setActiveLanguage(language);
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
      <React.Fragment>
        {paragraphIds.map((id, index) => (
          <p key={id}>
            <Translate id={id} />
          </p>
        ))}
      </React.Fragment>
    );
    // if this body copy has not yet been translated there will be no
    // translation ids in the welcomeInfo JSON object
    // just render the raw copy in English
    if (!paragraphIds.length) {
      let paragraphsRaw = this.state.body.text.split("\n");
      paragraphs = (
        <React.Fragment>
          {paragraphsRaw.map((paragraphString, index) => (
            <p key={index}>{paragraphString}</p>
          ))}
        </React.Fragment>
      );
    }
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
      <React.Fragment>
        <Translate id={`headline${id}`} data-testid="headline-translate" />
      </React.Fragment>
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
          // [theme.breakpoints.down("sm")]: {
          //   fontSize: "1.7rem"
          //     }
          // className={this.props.classes.headline}
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
    // console.log("reCaptcha Token");
    // console.log(token);
    this.props.apiSubmission.handleInput({
      target: { name: "reCaptchaValue", value: token }
    });
  }

  setRedirect() {
    const currentPath = this.props.history.location.pathname;
    window.localStorage.setItem("redirect", currentPath);
  }

  async updateSubmission(passedId, passedUpdates, formValues) {
    // console.log("updateSubmission");
    console.log(passedId);
    this.props.actions.setSpinner();
    const id = passedId ? passedId : this.props.submission.submissionId;
    console.log(
      `medicaidResidents: ${
        formValues ? formValues.medicaidResidents : undefined
      }`
    );
    console.log(`medicaidResidents from passedUpdates:`);
    console.log(passedUpdates);
    console.log("formPage1");
    console.log(this.props.submission.formPage1);
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
    console.log("###############");
    console.log(updates);

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
        console.log(result.type);
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
    console.log(`formValues: ${formValues}`);
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
        // employer_id: this.props.submission.formPage1.employerId
      };
      await this.props.apiSF.lookupSFContact(lookupBody).catch(err => {
        console.error(err);
        return this.handleError(err);
      });

      // if nothing found on lookup, need to create new contact
      if (!this.props.submission.salesforceId) {
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
    console.log("520");
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
    console.log("533");
    this.updateSubmission(submission_id, updates).catch(err => {
      console.error(err);
      return this.handleError(err);
    });
  }

  async prepForContact(values) {
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
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          values.employerName
        );
      }

      if (employerObject) {
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else if (
        values.employerName &&
        values.employerName.toLowerCase() === "seiu 503 staff"
      ) {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "SEIU LOCAL 503 OPEU"
        );
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
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else if (
        values.employerName &&
        values.employerName.toLowerCase() ===
          "personal support worker (paid by state of oregon)"
      ) {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "State PSW"
        );
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else if (
        values.employerName &&
        values.employerName.toLowerCase() ===
          "homecare worker (aging and people with disabilities)"
      ) {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "State APD"
        );
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else if (
        values.employerName &&
        values.employerName.toLowerCase() === "community member"
      ) {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "COMMUNITY MEMBERS"
        );
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else {
        console.log(`no agency number found for ${values.employerName}`);
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
          returnValues.employerId = employerObject
            ? employerObject.Id
            : "0016100000WERGeAAP"; // <= unknown employer
        }
      } else {
        // if employer has been manually changed since prefill, or if
        // this is a blank-slate form, find id in employer object
        // this will be an agency-level employer Id
        returnValues.employerId = employerObject
          ? employerObject.Id
          : "0016100000WERGeAAP"; // <= unknown employer
      }
      // save employerId to redux store for later
      this.props.apiSubmission.handleInput({
        target: { name: "employerId", value: returnValues.employerId }
      });
      resolve(returnValues);
    });
  }

  prepForSubmission(values, partial) {
    return new Promise(resolve => {
      let returnValues = { ...values };
      // console.log("signature here???");
      // console.log(returnValues);

      if (!partial) {
        // set default date values for DPA & DDA if relevant
        returnValues.direct_pay_auth = values.directPayAuth
          ? formatSFDate(new Date())
          : null;
        returnValues.direct_deposit_auth = values.directDepositAuth
          ? formatSFDate(new Date())
          : null;
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
    const firstValues = await this.prepForContact(values);
    console.log("firstValues", firstValues);
    const secondValues = await this.prepForSubmission(firstValues, partial);
    console.log("secondValues", secondValues);
    secondValues.termsAgree = values.termsAgree;
    secondValues.signature = firstValues.signature
      ? firstValues.signature
      : this.props.submission.formPage1.signature;
    console.log(`signature: ${secondValues.signature}`);
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
      direct_deposit_auth,
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
      direct_deposit_auth,
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
    console.log("createSubmission");
    console.log(formValues, partial);
    // create initial submission using data in tabs 1 & 2

    const body = await this.generateSubmissionBody(formValues, partial);
    // console.log(body);
    const cleanBody = removeFalsy(body);
    console.log(cleanBody);
    await this.props.apiSubmission
      .addSubmission(cleanBody)
      .then(result => {
        console.log("858");
        if (
          result.type !== "ADD_SUBMISSION_SUCCESS" ||
          this.props.submission.error
        ) {
          console.log("863");
          const err =
            this.props.submission.error ||
            "An error occurred while saving your Submission";
          console.error(err);
          return this.handleError(err);
        }
      })
      .catch(err => {
        console.log("869");
        console.error(err);
        return this.handleError(err);
      });

    console.log("874");

    // if no payment is required, we're done with saving the submission
    // we can write the OMA to SF and then move on to the CAPE ask
    // console.log("no payment required, writing OMA to SF and on to CAPE");
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
              console.log(result.type);
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
    // console.log("createSFContact");
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
    const newState = { ...this.state };
    newState.tab = newValue;
    this.setState({ ...newState }, () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // resubmit submission and deleteSubmission methods here, to be passed to submission table
  async resubmitSubmission(submissionData) {
    console.log(submissionData);
    // const body = await this.generateSubmissionBody(submissionData);
    // console.log(body);
    // const cleanBody = removeFalsy(body);
    // console.log(cleanBody);
    // cleanBody.Worker__c = submissionData.salesforceId;
    // console.log(cleanBody)
    submissionData.Worker__c = submissionData.salesforce_id;
    if (!submissionData.text_auth_opt_out) {
      submissionData.text_auth_opt_out = false;
    } else {
      submissionData.text_auth_opt_out = true;
    }
    delete submissionData.salesforce_id;
    console.log(submissionData);
    const resubmitResult = await this.props.apiSF
      .createSFOMA(submissionData)
      .catch(err => this.handleError(err));
    if (
      !resubmitResult ||
      !resubmitResult.type ||
      resubmitResult.type !== "CREATE_SF_OMA_SUCCESS"
    ) {
      this.saveSubmissionErrors(
        submissionData.id,
        "createSFOMA_RESUBMIT",
        this.props.submission.error
      );
    } else if (resubmitResult.type === "CREATE_SF_OMA_SUCCESS") {
      this.openSnackbar(
        "success",
        `Resubmitted submission from ${submissionData.first_name} ${submissionData.last_name}.`
      );
      // update submission status to success
      this.props.apiSubmission
        .updateSubmission(submissionData.id, {
          submission_status: "Success",
          submission_errors: null
        })
        .then(result => {
          console.log(result.type);
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
      const token = this.props.appState.authToken;
      this.props.apiSubmission.getAllSubmissions(token);
    }
  }

  render() {
    const values = queryString.parse(this.props.location.search);
    const embed = values.embed;
    const { classes } = this.props;
    const { loggedIn, userType, loading } = this.props.appState;
    const backgroundImage = embed
      ? "none"
      : `url(${
          this.state.image && this.state.image.url
            ? this.state.image.url
            : SamplePhoto
        })`;
    const backgroundImageStyle = { backgroundImage };
    // console.log(`loggedIn: ${loggedIn}, userType: ${userType}`);
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
          // [theme.breakpoints.down("sm")]: {
          //   backgroundImage: "none"
          // },
          backgroundSize: {
            xl: "cover"
          }
          // [theme.breakpoints.up("xl")]: {
          //   backgroundSize: "cover"
          // }
          //className={classes.appRoot}
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
              //className={classes.container}
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
                    setRedirect={this.setRedirect}
                    legal_language={this.legal_language}
                    cape_legal={this.cape_legal}
                    direct_pay={this.direct_pay}
                    direct_deposit={this.direct_deposit}
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
                    {...routeProps}
                  />
                )}
              />
              <Route
                exact
                path="/thankyou"
                render={routeProps => (
                  <FormThankYou
                    setRedirect={this.setRedirect}
                    classes={this.props.classes}
                    paymentRequired={
                      this.props.submission.formPage1.paymentRequired
                    }
                    {...routeProps}
                  />
                )}
              />
              {/*} <Route
                path="/admin/:id?/:token?"
                render={routeProps => (
                  <Dashboard
                    {...routeProps}
                    setRedirect={this.setRedirect}
                    resubmitSubmission={this.resubmitSubmission}
                  />
                )}
              /> 
              <Route
                path="/content"
                render={routeProps =>
                  loggedIn && ["admin", "edit"].includes(userType) ? (
                    <ContentLibrary
                      setRedirect={this.setRedirect}
                      {...routeProps}
                    />
                  ) : (
                    <NoAccess
                      setRedirect={this.setRedirect}
                      classes={this.props.classes}
                      {...routeProps}
                    />
                  )
                }
              /> */}
              <Route
                path="/new"
                render={routeProps =>
                  loggedIn && ["admin", "edit"].includes(userType) ? (
                    <TextInputForm
                      setRedirect={this.setRedirect}
                      {...routeProps}
                    />
                  ) : (
                    <NoAccess
                      setRedirect={this.setRedirect}
                      classes={this.props.classes}
                      {...routeProps}
                    />
                  )
                }
              />
              <Route
                path="/edit/:id"
                render={routeProps =>
                  loggedIn && ["admin", "edit"].includes(userType) ? (
                    <TextInputForm
                      edit={true}
                      setRedirect={this.setRedirect}
                      {...routeProps}
                    />
                  ) : (
                    <NoAccess
                      setRedirect={this.setRedirect}
                      classes={this.props.classes}
                      {...routeProps}
                    />
                  )
                }
              />
              <Route
                path="/users"
                render={routeProps =>
                  loggedIn && userType === "admin" ? (
                    <UserForm setRedirect={this.setRedirect} {...routeProps} />
                  ) : (
                    <NoAccess
                      setRedirect={this.setRedirect}
                      classes={this.props.classes}
                      {...routeProps}
                    />
                  )
                }
              />
              <Route
                path="/logout"
                render={routeProps => (
                  <Logout classes={this.props.classes} {...routeProps} />
                )}
              />
              <Route
                path="/login"
                render={routeProps => (
                  <Login classes={this.props.classes} {...routeProps} />
                )}
              />
              <Route
                exact
                path="/page2"
                render={routeProps => (
                  <SubmissionFormPage2
                    setRedirect={this.setRedirect}
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
                path="/noaccess"
                render={routeProps => (
                  <NoAccess
                    setRedirect={this.setRedirect}
                    classes={this.props.classes}
                    location={this.props.location}
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

// AppUnconnected.propTypes = {
//   classes: PropTypes.object.isRequired,
//   appState: PropTypes.shape({
//     loggedIn: PropTypes.bool,
//     authToken: PropTypes.string
//   }).isRequired,
//   apiProfile: PropTypes.shape({
//     validateToken: PropTypes.func
//   }).isRequired,
//   apiSubmission: PropTypes.shape({
//     handleInput: PropTypes.func
//   }).isRequired,
//   content: PropTypes.shape({
//     form: PropTypes.shape({
//       content_type: PropTypes.string,
//       content: PropTypes.string
//     }),
//     error: PropTypes.string,
//     deleteDialogOpen: PropTypes.bool,
//     currentContent: PropTypes.shape({
//       content_type: PropTypes.string,
//       content: PropTypes.string
//     })
//   }).isRequired,
//   profile: PropTypes.shape({
//     profile: PropTypes.shape({
//       id: PropTypes.string,
//       name: PropTypes.string,
//       email: PropTypes.string,
//       avatar_url: PropTypes.string
//     })
//   }).isRequired
// };

const mapStateToProps = state => ({
  appState: state.appState,
  profile: state.profile,
  content: state.content,
  submission: state.submission
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch),
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiProfile: bindActionCreators(apiProfileActions, dispatch),
  apiContent: bindActionCreators(apiContentActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch),
  setActiveLanguage: bindActionCreators(setActiveLanguage, dispatch)
});

export const AppConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppUnconnected);

// export default withStyles(styles)(withRouter(withLocalize(AppConnected)));
export default withRouter(withLocalize(AppConnected));
