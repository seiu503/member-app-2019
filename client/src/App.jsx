import React, { useRef, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { renderToStaticMarkup } from "react-dom/server";
import Recaptcha from "react-google-invisible-recaptcha";
import queryString from "query-string";
import moment from "moment";
import detector from "i18next-browser-languagedetector";
import { withTranslation, Trans, Translation } from "react-i18next";

import { Typography, CssBaseline, Box } from "@mui/material";

import * as Actions from "./store/actions";
import * as apiSFActions from "./store/actions/apiSFActions";
import * as apiSubmissionActions from "./store/actions/apiSubmissionActions";
import { defaultWelcomeInfo, detectDefaultLanguage } from "./utils/index";

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
  formatBirthdate,
  findEmployerObject,
  formatSFDate,
  calcEthnicity,
  removeFalsy,
  languageMap
} from "./components/SubmissionFormElements";

import SamplePhoto from "./img/sample-form-photo.jpg";

import welcomeInfo from "./translations/welcomeInfo.json";

const refCaptcha = useRef();

const styles = {};

export const AppUnconnected = (props) => {

  let _isMounted = false;
  const recaptcha = refCaptcha;

  // refs
  let language_picker = useRef();
  let main_ref = useRef();
  let legal_language = useRef();
  let cape_legal = useRef();
  let sigBox = useRef();

  // state
  const [headline, setHeadline] = useState({
      text: defaultWelcomeInfo.headline,
      id: 0
    });
  const [body, setBody] = useState({
      text: defaultWelcomeInfo.body,
      id: 0
    });
  const [image, setImage] = useState({});


  async componentDidMount() {
    // console.log(`APP props.classes`);
    // console.log(props);

    _isMounted = true;

    // check and log environment
    console.log(`NODE_ENV front end: ${process.env.REACT_APP_ENV_TEXT}`);
    console.log("### 20240223 prod 12:49PM ###");

    // detect default language from browser
    const defaultLanguage = detectDefaultLanguage().lang;
    console.log(`defaultLanguage: ${defaultLanguage}`);

    const changeLanguage = lng => {
      // console.log(`NEW changeLanguage: ${lng}`);
      props.i18n.changeLanguage(lng);
    };

    // set form language based on detected default language
    changeLanguage(defaultLanguage);

    // check if language was set in query string
    const values = queryString.parse(props.location.search);
    if (values.lang) {
      console.log(`NEW changeLanguage: ${values.lang}`);
      changeLanguage(values.lang);
    }

    // check for spf status
    if (values.spf) {
      props.actions.setSPF(false);
    }
  }

  componentWillUnmount() {
    _isMounted = false;
  }

  openSnackbar = async (variant, message) => {
    props.actions.setSnackbar({
      open: true,
      variant,
      message
    });
  };

  closeSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    props.actions.setSnackbar({
      open: false
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
    props.actions.setUserSelectedLanguage(e.target.value);


    // detect default language from browser
    const defaultLanguage = detectDefaultLanguage();
    const userChosenLanguage =
      language_picker && language_picker.current
        ? language_picker.current.value
        : null;
    // console.log(userChosenLanguage);
    const languageCode = languageMap[userChosenLanguage];
    // console.log(languageCode);
    const language = languageCode ? languageCode : defaultLanguage;
    // set form language based on detected default language
    const changeLanguage = lng => {
      // console.log(`NEW changeLanguage: ${lng}`);
      props.i18n.changeLanguage(lng);
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
          // className={props.classes.body}
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
    let headlineText = (
      <Translation>
        {(t, { i18n }) => (
          <span data-testid="headline-translate"> {t(`headline${id}`)} </span>
        )}
      </Translation>
    );
    // console.log(`headline.text: ${headline.text}`);
    // if this headline has not yet been translated there will be no
    // translation ids in the welcomeInfo JSON object
    // just render the raw copy in English
    if (!headlineIds.length) {
      headlineText = <React.Fragment>{headline.text}</React.Fragment>;
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
          {headlineText}
        </Typography>
      </Box>
    );
  };

  async onResolved() {
    const token = await recaptcha.current.getResponse();
    props.apiSubmission.handleInput({
      target: { name: "reCaptchaValue", value: token }
    });
  }

  async updateSubmission(passedId, passedUpdates, formValues) {
    console.log("App 293 updateSubmission");
    console.log(passedId);
    props.actions.setSpinner();
    const id = passedId ? passedId : props.submission.submissionId;
    // const medicaidResidents =
    //   formValues && formValues.medicaidResidents
    //     ? formValues.medicaidResidents
    //     : passedUpdates && passedUpdates.medicaidResidents
    //     ? passedUpdates.medicaidResidents
    //     : 0;
    // const pmtUpdates = {
    //   payment_type: props.submission.formPage1.paymentType,
    //   // medicaid_residents: medicaidResidents
    // };
    // const updates = passedUpdates ? passedUpdates : pmtUpdates;

    if (passedUpdates.hire_date) {
      let hireDate = moment(new Date(updates.hire_date));
      if (hireDate.isValid()) {
        passedUpdates.hire_date = formatSFDate(hireDate);
        console.log(`passedUpdates.hire_date: ${passedUpdates.hire_date}`);
      }
    }
    props.apiSubmission
      .updateSubmission(id, passedUpdates)
      .then(result => {
        console.log(result);
        if (
          result.type === "UPDATE_SUBMISSION_FAILURE" ||
          props.submission.error
        ) {
          console.log(props.submission.error);
          return handleError(props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
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
      !props.submission.salesforceId
    ) {
      // lookup contact by first/last/email
      const lookupBody = {
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        home_email: formValues.homeEmail
      };
      await props.apiSF.lookupSFContact(lookupBody).catch(err => {
        console.error(err);
        return handleError(err);
      });

      // if nothing found on lookup, need to create new contact
      if (!props.submission.salesforceId && !props.submission.p4cReturnValues.salesforceId) {
        console.log("App 359: No SF Contact found on lookup (no salesforceId in redux store), creating new");
        console.dir(formValues);
        await createSFContact(formValues)
          .then(() => {
            // console.log(props.submission.salesforceId);
          })
          .catch(err => {
            console.error(err);
            return handleError(err);
          });
      }
    }
  }

  async saveSubmissionErrors(submission_id, method, error) {
    // 1. retrieve existing errors array from current submission
    let { submission_errors } = props.submission.currentSubmission;
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
    updateSubmission(submission_id, updates).catch(err => {
      console.error(err);
      return handleError(err);
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
        // console.dir(props.submission.employerObjects);
        employerObject = findEmployerObject(
          props.submission.employerObjects,
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
          props.submission.employerObjects,
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
          props.submission.employerObjects,
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
          props.submission.employerObjects,
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
        props.submission.formPage1 &&
        props.submission.formPage1.prefillEmployerId
      ) {
        if (!props.submission.formPage1.prefillEmployerChanged) {
          // if this is a prefill and employer has not been changed manually,
          // return original prefilled employer Id
          // this will be a worksite-level account id in most cases
          returnValues.employerId = props.submission.formPage1.prefillEmployerId;
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
      props.apiSubmission.handleInput({
        target: { name: "employerId", value: returnValues.employerId }
      });
      // console.dir(returnValues);

      console.log('saving returnValues to redux to avoid duplicate calls later');
      props.apiSubmission.handleInputSPF({
        target: { name: "p4cReturnValues", value: {... returnValues } }
      });

      // console.log(`checking redux store for returnValues`);
      // console.log(props.submission);

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
        returnValues.legalLanguage = props.submission.formPage1.legalLanguage;
      }
      // set campaign source
      const q = queryString.parse(props.location.search);
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
        if (props.submission.salesforce_id) {
          returnValues.salesforceId = props.submission.salesforce_id;
        }
      }
      console.log("App 541 prepForSubmission resolve");
      resolve(returnValues);
    });
  }

  async generateSubmissionBody(values, partial) {
    console.log("App 547 generateSubmissionBody start");
    const firstValues = await prepForContact(values);
    console.log("firstValues", firstValues);
    const secondValues = await prepForSubmission(firstValues, partial);
    console.log("secondValues", secondValues);
    secondValues.termsAgree = values.termsAgree;
    secondValues.signature = firstValues.signature
      ? firstValues.signature
      : props.submission.formPage1.signature;
    // console.log(`signature: ${secondValues.signature}`);
    secondValues.legalLanguage = props.submission.formPage1.legalLanguage;
    secondValues.reCaptchaValue = props.submission.formPage1.reCaptchaValue;

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
    // console.log(`hire_date: ${hire_date}`);

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
      salesforce_id: salesforceId || props.submission.salesforceId,
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
    const body = await generateSubmissionBody(formValues, partial);
    // console.log(body);
    const cleanBody = removeFalsy(body);
    // console.log(cleanBody);
    await props.apiSubmission
      .addSubmission(cleanBody)
      .then(result => {
        if (
          result.type !== "ADD_SUBMISSION_SUCCESS" ||
          props.submission.error
        ) {
          const err =
            props.submission.error ||
            "An error occurred while saving your Submission";
          console.error(err);
          return handleError(err);
        }
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });

    // if no payment is required, we're done with saving the submission
    // we can write the OMA to SF and then move on to the CAPE ask

    // we're adding the tmp data here without adding it to the postgres db because we are lazy

    const q = queryString.parse(props.location.search);
    console.log("queryString:");
    console.log(q);

    // set tmp data
    const tmp1 = 
      q && q.tmp1 ? q.tmp1 : null;

    console.log(`tmp1: ${tmp1}`);

    body.Worker__c = props.submission.salesforceId;
    body.tmp_1 = tmp1;

    // create Online Member App record
    return props.apiSF
      .createSFOMA(body)
      .then(result => {
        console.log("App 728 createSubmission");
        console.log(result.type);
        console.log(`submission errors: ${props.submission.error}`);
        if (
          result.type !== "CREATE_SF_OMA_SUCCESS" ||
          props.submission.error
        ) {
          saveSubmissionErrors(
            props.submission.submissionId,
            "createSFOMA",
            props.submission.error
          );
          // goto CAPE tab
          console.log('moving to CAPE Tab');
          changeTab(2);
        } else if (!props.submission.error) {

          // // what if we don't update submission status after creating OMA? does that fix the endless loop?
          // return null; 


          // update submission status and redirect to CAPE tab
          console.log("updating submission status");
          props.apiSubmission
            .updateSubmission(props.submission.submissionId, {
              submission_status: "Success"
            })
            .then(result => {
              if (
                result.type === "UPDATE_SUBMISSION_FAILURE" ||
                props.submission.error
              ) {
                console.log(props.submission.error);
                return handleError(props.submission.error);
              } else {
                console.log("createSubmission resolve");
                return null;
                // changeTab(2);
              }
            })
            .catch(err => {
              console.error(err);
              return handleError(err);
            });
        }
      })
      .catch(err => {
        saveSubmissionErrors(
          props.submission.submissionId,
          "createSFOMA",
          err
        );
        console.error(err);
        return handleError(err);
      });
  }

  async createSFContact(formValues) {
    console.log("App 785 createSFContact");
    let values;
    if (props.appState.spf && props.submission.formPage1.completePrefill) {
      console.log('spf true AND completePrefill = true; skipping p4c');
      values = { ...props.submission.p4cReturnValues };
    } else {
      console.log('spf OR completePrefill = false; running p4c');
      values = await prepForContact(formValues);
    }
    console.log("App 793 createSFContact");
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

    await props.apiSF.createSFContact(body).catch(err => {
      console.error(err);
      return handleError(err);
    });
  }

  async updateSFContact(formValues) {
    console.log("App 846 updateSFContact");
    let values;
    if (state.spf && props.submission.formPage1.completePrefill) {
      console.log('spf true AND completePrefill = true; skipping p4c');
      values = { ...props.submission.p4cReturnValues };
    } else {
      console.log('spf OR completePrefill = false; running p4c');
      values = await prepForContact(formValues);
    }

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

    let id = props.submission.salesforceId;

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

    await props.apiSF.updateSFContact(id, body).catch(err => {
      console.error(err);
      return handleError(err);
    });
  }

  // just navigate to tab, don't run validation on current tab
  changeTab = newValue => {
    console.log(`changeTab: ${newValue}`);
    setTab(newValue);
  };

  useEffect(() => {
    // scroll to top of next tab after changing tab
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  render() {
    const values = queryString.parse(props.location.search);
    const embed = values.embed;
    const { classes } = props;
    const { loading } = props.appState;
    const backgroundImage = embed
      ? "none"
      : `url(${
          image && image.url
            ? image.url
            : SamplePhoto
        })`;
    const backgroundImageStyle = { backgroundImage };
    const { t, i18n } = props;

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
          onResolved={onResolved}
        />
        {!embed && (
          <NavBar
            main_ref={main_ref}
            language_picker={language_picker}
            updateLanguage={updateLanguage}
          />
        )}
        <BasicSnackbar
          open={props.appState.snackbar.open}
          onClose={closeSnackbar}
          variant={props.appState.snackbar.variant}
          message={props.appState.snackbar.message}
        />
        {loading && <Spinner />}
        <main id="main" ref={main_ref}>
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
                    tab={props.appState.tab}
                    spf={this.state.spf}
                    setSPF={this.setSPF}
                    embed={embed}
                    legal_language={this.legal_language}
                    cape_legal={this.cape_legal}
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
                    apiSubmission={props.apiSubmission}
                  />
                }
              />
              <Route
                exact
                path="/thankyou"
                element={
                  <FormThankYou
                    classes={props.classes}
                    paymentRequired={
                      props.submission.formPage1.paymentRequired
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
                    history={props.history}
                  />
                }
              />
              <Route
                path="*"
                element={<NotFound classes={props.classes} />}
              />
            </Routes>
          </Box>
        </main>
        <Footer classes={props.classes} />
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
