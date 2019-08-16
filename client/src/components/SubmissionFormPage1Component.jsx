import React from "react";
import localIpUrl from "local-ip-url";
import PropTypes from "prop-types";
import queryString from "query-string";

import withWidth from "@material-ui/core/withWidth";

import * as formElements from "./SubmissionFormElements";
import NavTabs from "./NavTabs";
import Tab1Form from "./Tab1";
import Tab2Form from "./Tab2";
import Tab3Form from "./Tab3";
import { openSnackbar } from "../containers/Notifier";
import WelcomeInfo from "./WelcomeInfo";

// helper functions these MAY NEED TO BE UPDATED with localization package
const { employerTypeMap, getKeyByValue, formatSFDate } = formElements;

export class SubmissionFormPage1Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureType: "draw"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  sigBox = {};
  componentDidMount() {
    // API call to SF to populate employers picklist
    this.props.apiSF
      .getSFEmployers()
      .then(result => {
        // console.log(result.payload);
        this.loadEmployersPicklist();
      })
      .catch(err => {
        openSnackbar(
          "error",
          this.props.submission.error ||
            "An error occurred while trying to fetch data from salesforce."
        );
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.submission.employerNames.length < 2) {
      this.loadEmployersPicklist();
    }
  }

  // reusable MUI form components
  renderTextField = formElements.renderTextField;
  renderSelect = formElements.renderSelect;
  renderCheckbox = formElements.renderCheckbox;

  loadEmployersPicklist = () => {
    // generate initial picklist of employer types by manipulating data
    // from redux store to replace with more user-friendly names
    const employerTypesListRaw = this.props.submission.employerObjects
      ? this.props.submission.employerObjects.map(
          employer => employer.Sub_Division__c
        )
      : [""];
    const employerTypesCodes = [...new Set(employerTypesListRaw)] || [""];
    const employerTypesList = employerTypesCodes.map(code =>
      employerTypeMap[code] ? employerTypeMap[code] : ""
    ) || [""];
    employerTypesList.unshift("");
    // console.log(employerTypesList);
    return employerTypesList;
  };

  updateEmployersPicklist = () => {
    let employerObjects = this.props.submission.employerObjects || [
      { Name: "", Sub_Division__c: "" }
    ];

    // get the value of the employer type selected by user
    let employerTypeUserSelect = "";
    if (Object.keys(this.props.formValues).length) {
      employerTypeUserSelect = this.props.formValues.employerType;
    } else {
      // console.log("no formValues in props");
    }

    const employerTypesList = this.loadEmployersPicklist();
    // if picklist finished populating and user has selected employer type,
    // filter the employer names list to return only names in that category
    if (employerTypesList.length > 1 && employerTypeUserSelect !== "") {
      const employerObjectsFiltered = employerTypeUserSelect
        ? employerObjects.filter(
            employer =>
              employer.Sub_Division__c ===
              getKeyByValue(employerTypeMap, employerTypeUserSelect)
          )
        : [{ Name: "" }];
      const employerList = employerObjectsFiltered.map(
        employer => employer.Name
      );
      employerList.unshift("");
      return employerList;
    }
  };

  reCaptchaChange = response => {
    // console.log(response, "<= dis your captcha token");
  };

  handleSubmit(values) {
    const reCaptchaValue = this.props.reCaptchaRef.current.getValue();
    let signature;
    let {
      firstName,
      lastName,
      dd,
      mm,
      yyyy,
      preferredLanguage,
      homeStreet,
      homeZip,
      homeState,
      homeCity,
      homeEmail,
      mobilePhone,
      employerName,
      textAuthOptOut,
      termsAgree,
      salesforceId,
      directPayAuth,
      directDepositAuth
    } = values;
    signature = this.props.submission.formPage1.signature;
    if (!signature) {
      openSnackbar("error", "Please provide a signature");
      return;
    }
    const direct_pay_auth = directPayAuth ? new Date() : null;
    const direct_deposit_auth = directDepositAuth ? new Date() : null;
    const dobRaw = mm + "/" + dd + "/" + yyyy;
    const birthdate = formatSFDate(dobRaw);
    const employerObject = this.props.submission.employerObjects
      ? this.props.submission.employerObjects.filter(
          obj => obj.Name.toLowerCase() === employerName.toLowerCase()
        )[0]
      : { Name: "" };
    const employerId = employerObject.Id;
    const agencyNumber = employerObject.Agency_Number__c;
    const legalLanguage = this.props.submission.formPage1.legalLanguage;

    const q = queryString.parse(this.props.location.search);
    const campaignSource = q && q.s ? q.s : "Direct seiu503signup";

    if (!salesforceId && q && q.id) {
      salesforceId = q.id;
    }
    if (!reCaptchaValue) {
      openSnackbar("error", "Please verify you are human with Captcha");
      return;
    }
    const body = {
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
      immediate_past_member_status: null,
      salesforce_id: salesforceId,
      reCaptchaValue
    };
    // console.log(body);
    return this.props.apiSubmission
      .addSubmission(body)
      .then(result => {
        if (
          result.type === "ADD_SUBMISSION_FAILURE" ||
          this.props.submission.error
        ) {
          openSnackbar(
            "error",
            this.props.submission.error ||
              "An error occurred while trying to submit your information."
          );
        } else {
          this.props.reset("submissionPage1");
          this.props.history.push(`/page2`);
        }
      })
      .catch(err => {
        // console.log(err);
        openSnackbar("error", err);
      });
  }

  render() {
    const { classes } = this.props;
    const employerTypesList = this.loadEmployersPicklist() || [
      { Name: "", Sub_Division__c: "" }
    ];
    const employerList = this.updateEmployersPicklist() || [""];
    // console.log(employerTypesList.length);
    // console.log(employerList.length);
    return (
      <div
        data-test="component-submissionformpage1"
        className={classes.formContainer}
      >
        {typeof this.props.tab !== "number" && (
          <WelcomeInfo
            location={this.props.location}
            history={this.props.history}
            handleTab={this.props.handleTab}
            style={
              typeof this.props.tab !== "number"
                ? { display: "block" }
                : { display: "none" }
            }
          />
        )}

        {this.props.tab >= 0 && (
          <div
            style={
              this.props.tab >= 0 ? { display: "block" } : { display: "none" }
            }
          >
            <NavTabs
              tab={this.props.tab}
              handleTab={this.props.handleTab}
              pristine={this.props.pristine}
              valid={this.props.valid}
              submitting={this.props.submitting}
              submitForm={this.props.submitForm}
              formValues={this.props.formValues}
            />
            {this.props.tab === 0 && (
              <Tab1Form
                onSubmit={e => this.props.handleTab(e, 1)}
                classes={classes}
                employerTypesList={employerTypesList}
                employerList={employerList}
                handleInput={this.props.apiSubmission.handleInput}
                updateEmployersPicklist={this.updateEmployersPicklist}
                renderSelect={this.renderSelect}
                renderTextField={this.renderTextField}
                renderCheckbox={this.renderCheckbox}
                formValues={this.props.formValues}
                width={this.props.width}
                handleTab={this.props.handleTab}
                submitErrors={this.props.submitErrors}
              />
            )}
            {this.props.tab === 1 && (
              <Tab2Form
                onSubmit={e =>
                  this.props.handleTab(e, 2, this.props.formValues)
                }
                classes={classes}
                legal_language={this.props.legal_language}
                direct_pay={this.props.direct_pay}
                direct_deposit={this.props.direct_deposit}
                sigBox={this.props.sigBox}
                signatureType={this.props.signatureType}
                toggleSignatureInputType={this.props.toggleSignatureInputType}
                clearSignature={this.props.clearSignature}
                handleInput={this.props.apiSubmission.handleInput}
                renderSelect={this.renderSelect}
                renderTextField={this.renderTextField}
                renderCheckbox={this.renderCheckbox}
                formValues={this.props.formValues}
                handleTab={this.props.handleTab}
                initialize={this.props.initialize}
              />
            )}
            {this.props.tab === 2 && (
              <Tab3Form
                onSubmit={this.handleSubmit}
                classes={classes}
                reCaptchaChange={this.reCaptchaChange}
                reCaptchaRef={this.props.reCaptchaRef}
                loading={this.props.submission.loading}
                handleTab={this.props.handleTab}
                pamentRequired={this.props.submission.formPage1.paymentRequired}
                iFrameURL={this.props.submission.payment.cardAddingUrl}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

SubmissionFormPage1Component.propTypes = {
  submission: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.string,
    salesforceId: PropTypes.string,
    employerNames: PropTypes.array,
    employerObjects: PropTypes.arrayOf(
      PropTypes.shape({
        Name: PropTypes.string,
        Sub_Division__c: PropTypes.string
      })
    ),
    formPage1: PropTypes.shape({})
  }).isRequired,
  apiSF: PropTypes.shape({
    getSFEmployers: PropTypes.func
  }).isRequired,
  apiSubmission: PropTypes.shape({
    addSubmission: PropTypes.func,
    handleInput: PropTypes.func
  }).isRequired,
  classes: PropTypes.object,
  location: PropTypes.shape({
    search: PropTypes.string
  }),
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  formValues: PropTypes.shape({
    signatureType: PropTypes.string
  }).isRequired,
  apiContent: PropTypes.shape({
    uploadImage: PropTypes.func
  }).isRequired,
  content: PropTypes.shape({
    error: PropTypes.string
  }).isRequired,
  legal_language: PropTypes.shape({
    current: PropTypes.shape({
      textContent: PropTypes.string
    })
  }),
  sigBox: PropTypes.shape({
    clear: PropTypes.func,
    getTrimmedCanvas: PropTypes.func
  }),
  handleTab: PropTypes.func,
  reCaptchaRef: PropTypes.shape({
    current: PropTypes.shape({
      getValue: PropTypes.func
    })
  }),
  tab: PropTypes.number,
  pristine: PropTypes.bool,
  invalid: PropTypes.bool
};

export default withWidth()(SubmissionFormPage1Component);
