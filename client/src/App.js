import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { withLocalize, setActiveLanguage } from "react-localize-redux";
import { renderToStaticMarkup } from "react-dom/server";
import Recaptcha from "react-google-invisible-recaptcha";
import queryString from "query-string";
import { Translate } from "react-localize-redux";

import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import * as Actions from "./store/actions";
import * as apiContentActions from "./store/actions/apiContentActions";
import * as apiProfileActions from "./store/actions/apiProfileActions";
import * as apiSubmissionActions from "./store/actions/apiSubmissionActions";
import { detectDefaultLanguage, defaultWelcomeInfo } from "./utils/index";

import NavBar from "./containers/NavBar";
import Footer from "./components/Footer";
import FormThankYou from "./components/FormThankYou";
import NoAccess from "./components/NoAccess";
import NotFound from "./components/NotFound";
import Logout from "./containers/Logout";
import Login from "./components/Login";
import Dashboard from "./containers/Dashboard";
import TextInputForm from "./containers/TextInputForm";
import SubmissionFormPage1 from "./containers/SubmissionFormPage1";
import SubmissionFormPage2 from "./containers/SubmissionFormPage2";
import Notifier from "./containers/Notifier";
import ContentLibrary from "./containers/ContentLibrary";
import Spinner from "./components/Spinner";
import UserForm from "./containers/UserForm";
import {
  handleError,
  formatBirthdate,
  findEmployerObject,
  formatSFDate
} from "./components/SubmissionFormElements";

import SamplePhoto from "./img/sample-form-photo.jpg";

import globalTranslations from "./translations/globalTranslations";
import welcomeInfo from "./translations/welcomeInfo.json";

const styles = theme => ({
  root: {
    flexGrow: 1,
    boxSizing: "border-box"
  },
  notFound: {
    height: "80vh",
    width: "auto",
    marginTop: "-60px"
  },
  container: {
    maxWidth: 1200,
    margin: "auto",
    height: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  appRoot: {
    width: "100vw",
    height: "100%",
    minHeight: "80vh",
    backgroundAttachment: "fixed",
    backgroundPosition: "bottom",
    [theme.breakpoints.down("sm")]: {
      backgroundImage: "none"
    },
    [theme.breakpoints.up("xl")]: {
      backgroundSize: "cover"
    }
  },
  message: {
    margin: "auto",
    width: "50%",
    textAlign: "center",
    height: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: "100%"
    },
    lineHeight: "2em",
    background: "white",
    borderRadius: "4px",
    padding: 60,
    fontSize: "1.2em"
  },
  row: {
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      flexWrap: "wrap"
    }
  },
  button: {
    height: 100,
    margin: "20px auto",
    width: 100
  },
  footer: {
    width: "100vw",
    margin: "auto",
    position: "fixed",
    backgroundColor: theme.palette.primary.main,
    bottom: 0,
    padding: 25,
    height: 73,
    [theme.breakpoints.down("sm")]: {
      height: 53
    },
    display: "flex",
    justifyContent: "center",
    alignItems: "middle",
    boxShadow: "0 1px 5px 2px rgba(0,0,0,.2)",
    zIndex: 2,
    color: "white"
  },
  footerIcon: {
    width: 30,
    height: "auto",
    marginTop: 15,
    [theme.breakpoints.down("sm")]: {
      marginTop: 5
    },
    fill: theme.palette.secondary.main
  },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "block"
  },
  form: {
    background: "white"
  }
});

export class AppUnconnected extends Component {
  constructor(props) {
    super(props);
    // this.recaptcha = React.createRef();
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
      image: {}
    };
    this.props.addTranslation(globalTranslations);
    this.setRedirect = this.setRedirect.bind(this);
    this.onResolved = this.onResolved.bind(this);
    this.updateSubmission = this.updateSubmission.bind(this);
    this.lookupSFContact = this.lookupSFContact.bind(this);
    this.saveSubmissionErrors = this.saveSubmissionErrors.bind(this);
    this.prepForContact = this.prepForContact.bind(this);
    this.prepForSubmission = this.prepForSubmission.bind(this);
    this.createSFContact = this.createSFContact.bind(this);
    this.updateSFContact = this.updateSFContact.bind(this);
  }

  componentDidMount() {
    console.log(`NODE_ENV front end: ${process.env.REACT_APP_ENV_TEXT}`);
    console.log("Thursday 11/7 4:26pm");
    const defaultLanguage = detectDefaultLanguage();
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
        // console.log(`authToken: ${!!authToken}, userId: ${userId}`);
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
              // console.log(result.type);
              if (result.type === "VALIDATE_TOKEN_FAILURE") {
                // console.log("VALIDATE_TOKEN_FAILURE: clearing localStorage");
                return window.localStorage.clear();
              }
              if (
                result.type === "VALIDATE_TOKEN_SUCCESS" &&
                authToken &&
                authToken !== "undefined" &&
                userId &&
                userId !== "undefined"
              ) {
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
  }

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
      <Typography
        variant="body1"
        component="div"
        align="left"
        gutterBottom
        className={this.props.classes.body}
        data-test="body"
      >
        {paragraphs}
      </Typography>
    );
  };

  async onResolved() {
    const token = await this.recaptcha.getResponse();
    // console.log(token);
    this.props.apiSubmission.handleInput({
      target: { name: "reCaptchaValue", value: token }
    });
  }

  setRedirect() {
    const currentPath = this.props.history.location.pathname;
    window.localStorage.setItem("redirect", currentPath);
  }

  async updateSubmission(passedUpdates) {
    // console.log("updateSubmission");
    this.props.actions.setSpinner();
    const id = this.props.submission.submissionId;
    const { formPage1, payment } = this.props.submission;
    const pmtUpdates = {
      payment_type: formPage1.paymentType,
      payment_method_added: formPage1.paymentMethodAdded,
      medicaid_residents: formPage1.medicaidResidents,
      card_adding_url: payment.cardAddingUrl,
      member_id: payment.memberId,
      stripe_customer_id: payment.stripeCustomerId,
      member_short_id: payment.memberShortId,
      active_method_last_four: payment.activeMethodLast4,
      card_brand: payment.cardBrand
    };
    const updates = passedUpdates ? passedUpdates : pmtUpdates;
    console.log(updates);
    this.props.apiSubmission
      .updateSubmission(id, updates)
      .then(result => {
        console.log(result.type);
        if (
          result.type === "UPDATE_SUBMISSION_FAILURE" ||
          this.props.submission.error
        ) {
          console.log(this.props.submission.error);
          return this.props.handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        return this.props.handleError(err);
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
      await this.props.apiSF
        .lookupSFContact(lookupBody)
        .then(() => {
          this.setCAPEOptions();
        })
        .catch(err => {
          console.error(err);
          return handleError(err);
        });

      // if nothing found on lookup, need to create new contact
      if (!this.props.submission.salesforceId) {
        await this.createSFContact()
          .then(() => {
            // console.log(this.props.submission.salesforceId);
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
    let { submission_errors } = this.props.submission.currentSubmission;
    if (submission_errors === null) {
      submission_errors = "";
    }
    // 2. add new data to string
    submission_errors += `Attempted method: ${method}, Error: ${error}. `;
    // 3. update submission_errors and submission_status on submission by id
    const updates = {
      submission_errors,
      submission_status: "error"
    };
    this.updateSubmission(updates).catch(err => {
      console.error(err);
      return handleError(err);
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
      let employerObject = findEmployerObject(
        this.props.submission.employerObjects,
        values.employerName
      );

      if (employerObject) {
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else if (values.employerName === "SEIU 503 Staff") {
        employerObject = findEmployerObject(
          this.props.submission.employerObjects,
          "SEIU LOCAL 503 OPEU"
        );
        returnValues.agencyNumber = employerObject.Agency_Number__c;
      } else {
        console.log(`no agency number found for ${values.employerName}`);
        returnValues.agencyNumber = 0;
      }

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

  prepForSubmission(values) {
    return new Promise(resolve => {
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
      returnValues.campaignSource = q && q.s ? q.s : "NewMemberForm_201910";
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

  async generateSubmissionBody(values) {
    const firstValues = await this.prepForContact(values);
    const secondValues = await this.prepForSubmission(firstValues);
    secondValues.termsAgree = values.termsAgree;
    secondValues.signature = this.props.submission.formPage1.signature;
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
      campaignSource,
      legalLanguage,
      signature,
      reCaptchaValue
    } = secondValues;

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
      signature: signature,
      text_auth_opt_out: textAuthOptOut,
      online_campaign_source: campaignSource,
      legal_language: legalLanguage,
      maintenance_of_effort: new Date(),
      seiu503_cba_app_date: new Date(),
      direct_pay_auth,
      direct_deposit_auth,
      immediate_past_member_status: immediatePastMemberStatus,
      salesforce_id: salesforceId || this.props.submission.salesforceId,
      reCaptchaValue
    };
  }

  async createSubmission(formValues, partial) {
    console.log("createSubmission");

    // create initial submission using data in tabs 1 & 2
    // for afh/retiree/comm, submission will not be
    // finalized and written to salesforce
    // until payment method added in tab 3

    const body = await this.generateSubmissionBody(formValues);
    // console.log(body.ip_address);
    await this.props.apiSubmission
      // const result = await this.props.apiSubmission
      .addSubmission(body)
      .then(() => {
        // console.log('453');
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });

    // if no payment is required, we're done with saving the submission
    // we can write the OMA to SF and then move on to the CAPE ask
    if (!this.props.submission.formPage1.paymentRequired && !partial) {
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
            this.changeTab(this.props.howManyTabs - 1);
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
                  return handleError(this.props.submission.error);
                } else {
                  this.changeTab(2);
                }
              })
              .catch(err => {
                console.error(err);
                return handleError(err);
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
          return handleError(err);
        });
    }
    // if payment required, or if partial submission from p2:
    return;
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
      return handleError(err);
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
      return handleError(err);
    });
  }

  // resubmit submission and deleteSubmission methods here, to be passed to submission table

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
      <div
        data-test="component-app"
        className={classes.appRoot}
        style={backgroundImageStyle}
      >
        <CssBaseline />
        <Recaptcha
          ref={ref => (this.recaptcha = ref)}
          sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
          onResolved={this.onResolved}
        />
        {!embed && <NavBar main_ref={this.main_ref} />}
        <Notifier />
        {loading && <Spinner />}
        <main className={classes.container} id="main" ref={this.main_ref}>
          <Switch>
            <Route
              exact
              path="/"
              render={routeProps => (
                <SubmissionFormPage1
                  embed={embed}
                  setRedirect={this.setRedirect}
                  legal_language={this.legal_language}
                  cape_legal={this.cape_legal}
                  direct_pay={this.direct_pay}
                  direct_deposit={this.direct_deposit}
                  sigBox={this.sigBox}
                  recaptcha={this.recaptcha}
                  onResolved={this.onResolved}
                  headline={this.state.headline}
                  body={this.state.body}
                  image={this.state.image}
                  renderBodyCopy={this.renderBodyCopy}
                  updateSubmission={this.updateSubmission}
                  lookupSFContact={this.lookupSFContact}
                  saveSubmissionErrors={this.saveSubmissionErrors}
                  prepForContact={this.prepForContact}
                  prepForSubmission={this.prepForSubmission}
                  createSFContact={this.createSFContact}
                  updateSFContact={this.updateSFContact}
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
                  {...routeProps}
                />
              )}
            />
            <Route
              path="/admin/:id?/:token?"
              render={routeProps => (
                <Dashboard {...routeProps} setRedirect={this.setRedirect} />
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
            />
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
                  updateSubmission={this.updateSubmission}
                  lookupSFContact={this.lookupSFContact}
                  saveSubmissionErrors={this.saveSubmissionErrors}
                  prepForContact={this.prepForContact}
                  prepForSubmission={this.prepForSubmission}
                  createSFContact={this.createSFContact}
                  updateSFContact={this.updateSFContact}
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
        </main>
        <Footer classes={this.props.classes} />
      </div>
    );
  }
}

AppUnconnected.propTypes = {
  classes: PropTypes.object.isRequired,
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool,
    authToken: PropTypes.string
  }).isRequired,
  apiProfile: PropTypes.shape({
    validateToken: PropTypes.func
  }).isRequired,
  apiSubmission: PropTypes.shape({
    handleInput: PropTypes.func
  }).isRequired,
  content: PropTypes.shape({
    form: PropTypes.shape({
      content_type: PropTypes.string,
      content: PropTypes.string
    }),
    error: PropTypes.string,
    deleteDialogOpen: PropTypes.bool,
    currentContent: PropTypes.shape({
      content_type: PropTypes.string,
      content: PropTypes.string
    })
  }).isRequired,
  profile: PropTypes.shape({
    profile: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
      avatar_url: PropTypes.string
    })
  }).isRequired
};

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
  setActiveLanguage: bindActionCreators(setActiveLanguage, dispatch)
});

export const AppConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppUnconnected);

export default withStyles(styles)(withRouter(withLocalize(AppConnected)));
