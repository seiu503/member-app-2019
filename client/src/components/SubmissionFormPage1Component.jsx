import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";

import withWidth from "@material-ui/core/withWidth";

import { withLocalize } from "react-localize-redux";
import * as formElements from "./SubmissionFormElements";
import NavTabs from "./NavTabs";
import Tab1Form from "./Tab1";
import Tab2Form from "./Tab2";
import Tab3Form from "./Tab3";
import CAPEForm from "./CAPE";
import WelcomeInfo from "./WelcomeInfo";
import * as utils from "../utils";

// helper functions these MAY NEED TO BE UPDATED with localization package
const { employerTypeMap, getKeyByValue } = formElements;

export class SubmissionFormPage1Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureType: "draw"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.donationFrequencyOnChange = this.donationFrequencyOnChange.bind(this);
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
        console.error(err);
        // don't return this error to client, it's a background api call
        // this.props.handleError(err);
      });
    // add event listener to listen for iframe message
    // to confirm payment method added
    window.addEventListener("message", this.receiveMessage, false);
  }

  componentDidUpdate(prevProps) {
    if (this.props.submission.employerNames.length < 3) {
      this.loadEmployersPicklist();
    }
    if (document.body.getAttribute("iframeListener") !== "true") {
      window.addEventListener("message", this.receiveMessage, false);
    }
  }

  // check for messages from iframe
  receiveMessage = event => {
    // Do we trust the sender of this message?
    const unioniseEndpoint = process.env.REACT_APP_UNIONISE_ENDPOINT;
    if (event.origin !== unioniseEndpoint || !event.data.notification) {
      return;
    }

    const { type, cardBrand, cardLast4 } = event.data.notification;
    if (type === "success") {
      // console.log("success");
      if (
        this.props.formValues.capeAmount &&
        this.props.formValues.donationFrequency
      ) {
        // console.log("this iframe is for CAPE; setting CAPE details");
        // console.log(event.data.notification);
        return this.props.apiSubmission.setPaymentDetailsCAPE(
          true,
          cardBrand,
          cardLast4
        );
      } else {
        // console.log("this iframe is for dues; setting dues payment details");
        // console.log(event.data.notification);
        // console.log(cardBrand, cardLast4);
        return this.props.apiSubmission.setPaymentDetailsDues(
          true,
          cardBrand,
          cardLast4
        );
      }
    }
  };

  // reusable MUI form components
  renderTextField = formElements.renderTextField;
  renderSelect = formElements.renderSelect;
  renderCheckbox = formElements.renderCheckbox;

  loadEmployersPicklist = () => {
    // generate initial picklist of employer types by manipulating data
    // from redux store to replace with more user-friendly names
    const employerTypesListRaw = this.props.submission.employerObjects
      ? this.props.submission.employerObjects.map(employer => {
          if (
            employer.Name &&
            employer.Name.toLowerCase() === "community members"
          ) {
            return "Community Members";
          } else {
            return employer.Sub_Division__c;
          }
        })
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

    // console.log(employerTypeUserSelect);
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
      let employerList = employerObjectsFiltered.map(employer => employer.Name);
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() === "community member"
      ) {
        employerList = ["Community Member"];
      }
      employerList.unshift("");

      // set value of employer name field for single-child employer types
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() === "retired"
      ) {
        this.props.formValues.employerName = "Retirees";
      }
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() === "adult foster home"
      ) {
        this.props.formValues.employerName = "Adult Foster Care";
      }
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() === "child care"
      ) {
        this.props.formValues.employerName = "Family Child Care";
      }
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() === "community member"
      ) {
        this.props.formValues.employerName = "Community Member";
      }
      return employerList;
    }
  };

  donationFrequencyOnChange(event, value) {
    console.log("donationFrequencyOnChange");
    console.log(value);
    this.props.change("donationFrequency", value);
    this.props.handleDonationFrequencyChange(value);
  }

  async updateSubmission() {
    // console.log("updateSubmission");
    this.props.actions.setSpinner();
    const id = this.props.submission.submissionId;
    const { formPage1, payment } = this.props.submission;
    const updates = {
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
    // console.log(updates);
    this.props.apiSubmission
      .updateSubmission(id, updates)
      .then(result => {
        // console.log(result.type);
        if (
          result.type === "UPDATE_SUBMISSION_FAILURE" ||
          this.props.submission.error
        ) {
          // console.log(this.props.submission.error);
          return this.props.handleError(this.props.submission.error);
        }
        // console.log(result.type);
      })
      .catch(err => {
        console.error(err);
        return this.props.handleError(err);
      });
  }

  async createSFOMA() {
    // console.log("createSFOMA");
    this.props.actions.setSpinner();
    const { formValues } = this.props;
    const body = await this.props.generateSubmissionBody(formValues);
    body.Worker__c = this.props.submission.salesforceId;
    this.props.apiSF
      .createSFOMA(body)
      .then(result => {
        // console.log(result.type);
        if (
          result.type === "CREATE_SF_OMA_FAILURE" ||
          this.props.submission.error
        ) {
          // console.log(this.props.submission.error);
          this.props.saveSubmissionErrors(
            this.props.submission.submissionId,
            "createSFOMA",
            this.props.submission.error
          );
          console.error(this.props.submission.error);
          return this.props.handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        this.props.saveSubmissionErrors(
          this.props.submission.submissionId,
          "createSFOMA",
          err
        );
        return this.props.handleError(err);
      });
  }

  async createOrUpdateSFDJR() {
    this.props.actions.setSpinner();
    // console.log("createOrUpdateSFDJR");

    const { formPage1, payment } = this.props.submission;

    const id = this.props.submission.djrId;
    // console.log(`djrId: ${id}`);

    const paymentMethod =
      formPage1.paymentType === "Check" ? "Paper Check" : "Unionise";
    const body = {
      Worker__c: this.props.submission.salesforceId,
      Payment_Method__c: paymentMethod,
      AFH_Number_of_Residents__c: formPage1.medicaidResidents,
      Unioni_se_MemberID__c: payment.memberShortId,
      Active_Account_Last_4__c: payment.activeMethodLast4,
      Card_Brand__c: payment.cardBrand,
      Employer__c: formPage1.employerId
    };

    // create a new record if one doesn't exist, OR
    // if existing DJR record is for a different employer

    // check if DJR employer matches employer submitted on form
    // if no match, create new DJR even if already have id
    if (!id || formPage1.employerId !== payment.djrEmployerId) {
      // create new SFDJR record
      // console.log("createSFDJR");
      // console.log(body);
      return this.props.apiSF
        .createSFDJR(body)
        .then(result => {
          // console.log(result.type);
          if (
            result.type === "CREATE_SF_DJR_FAILURE" ||
            this.props.submission.error
          ) {
            // console.log(this.props.submission.error);
            this.props.saveSubmissionErrors(
              this.props.submission.submissionId,
              "createSFDJR",
              this.props.submission.error
            );
            return this.props.handleError(this.props.submission.error);
          }
        })
        .catch(err => {
          console.error(err);
          this.props.saveSubmissionErrors(
            this.props.submission.submissionId,
            "createSFDJR",
            err
          );
          return this.props.handleError(err);
        });
    }

    // if id exists and employer matches, update existing DJR record
    // console.log("updateSFDJR");
    body.Id = id;
    delete body.Worker__c;
    // console.log("updateSFDJR");
    // console.log(body);
    return this.props.apiSF
      .updateSFDJR(id, body)
      .then(result => {
        // console.log(result.type);
        if (
          result.type === "UPDATE_SF_DJR_FAILURE" ||
          this.props.submission.error
        ) {
          // console.log(this.props.submission.error);
          this.props.saveSubmissionErrors(
            this.props.submission.submissionId,
            "updateSFDJR",
            this.props.submission.error
          );
          return this.props.handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        this.props.saveSubmissionErrors(
          this.props.submission.submissionId,
          "updateSFDJR",
          err
        );
        return this.props.handleError(err);
      });
  }

  async handleSubmit(formValues) {
    // console.log("handleSubmit");
    this.props.actions.setSpinner();

    await this.props
      .verifyRecaptchaScore()
      .then(score => {
        // console.log(`score: ${score}`);
        if (!score || score <= 0.5) {
          // console.log(`recaptcha failed: ${score}`);
          return this.props.handleError(
            "ReCaptcha validation failed, please reload the page and try again."
          );
        }
      })
      .catch(err => {
        console.error(err);
      });
    const validMethod =
      !!this.props.submission.payment.activeMethodLast4 &&
      !this.props.submission.payment.paymentErrorHold;
    if (validMethod) {
      // console.log('validMethod');
      this.props.apiSubmission.handleInput({
        target: { name: "paymentMethodAdded", value: true }
      });
    }
    // console.log(
    //   `paymentRequired: ${this.props.submission.formPage1.paymentRequired}`
    // );
    // console.log(
    //   `newCardNeeded: ${this.props.submission.formPage1.newCardNeeded}`
    // );
    // console.log(`donationFrequency: ${formValues.donationFrequency}`);
    // console.log(
    //   `paymentMethodAdded: ${
    //     this.props.submission.formPage1.paymentMethodAdded
    //   }`
    // );
    if (
      ((this.props.submission.formPage1.paymentRequired &&
        this.props.submission.formPage1.paymentType === "Card") ||
        this.props.submission.formPage1.newCardNeeded) &&
      !this.props.submission.formPage1.paymentMethodAdded
    ) {
      // console.log("No payment method added");
      return this.props.handleError(
        "Please click 'Add a Card' to add a payment method"
      );
    }

    return Promise.all([
      this.updateSubmission(),
      this.createSFOMA(),
      this.createOrUpdateSFDJR()
    ])
      .then(() => {
        // if retiree selected pay by check in dues tab
        // need to reset paymentMethodAdded and paymentType
        // bc 'check' is not an option for CAPE

        if (
          this.props.submission.formPage1.employerType &&
          this.props.submission.formPage1.employerType.toLowerCase() ===
            "retired" &&
          this.props.submission.formPage1.paymentType === "Check"
        ) {
          this.props.apiSubmission.handleInput({
            target: { name: "paymentMethodAdded", value: false }
          });
          this.props.apiSubmission.handleInput({
            target: { name: "paymentType", value: "Card" }
          });
          this.props.apiSubmission.handleInput({
            target: { name: "newCardNeeded", value: true }
          });
        }

        // redirect to CAPE tab
        if (!this.props.submission.error) {
          this.props.handleTab(this.props.howManyTabs - 1);
        } else {
          console.error(this.props.submission.error);
          this.props.saveSubmissionErrors(
            this.props.submission.submissionId,
            "handleSubmit",
            this.props.submission.error
          );
          this.props.handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        this.props.saveSubmissionErrors(
          this.props.submission.submissionId,
          "handleSubmit",
          err
        );
        this.props.handleError(err);
      });
  }

  render() {
    const { classes } = this.props;
    const employerTypesList = this.loadEmployersPicklist() || [
      { Name: "", Sub_Division__c: "" }
    ];
    const employerList = this.updateEmployersPicklist() || [""];
    const values = queryString.parse(this.props.location.search);
    const checkoff = !utils.isPaymentRequired(
      this.props.submission.formPage1.employerType
    );
    // console.log(employerTypesList.length);
    // console.log(employerList.length);
    return (
      <div
        data-test="component-submissionformpage1"
        className={classes.formContainer}
      >
        {values.cape ? (
          <CAPEForm
            {...this.props}
            standAlone={true}
            newCardNeeded={true}
            verifyCallback={this.verifyCallback}
            employerTypesList={employerTypesList}
            employerList={employerList}
            updateEmployersPicklist={this.updateEmployersPicklist}
            classes={classes}
            loading={this.props.submission.loading}
            formPage1={this.props.submission.formPage1}
            handleInput={this.props.apiSubmission.handleInput}
            iFrameURL={this.props.submission.payment.cardAddingUrl}
            payment={this.props.submission.payment}
            renderSelect={this.renderSelect}
            renderTextField={this.renderTextField}
            renderCheckbox={this.renderCheckbox}
            checkoff={checkoff}
            capeObject={this.props.submission.cape}
            donationFrequencyOnChange={this.donationFrequencyOnChange}
          />
        ) : (
          <React.Fragment>
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
                  this.props.tab >= 0
                    ? { display: "block" }
                    : { display: "none" }
                }
              >
                <NavTabs {...this.props} />
                {this.props.tab === 0 && (
                  <Tab1Form
                    {...this.props}
                    onSubmit={() => this.props.handleTab(1)}
                    verifyCallback={this.verifyCallback}
                    classes={classes}
                    employerTypesList={employerTypesList}
                    employerList={employerList}
                    handleInput={this.props.apiSubmission.handleInput}
                    updateEmployersPicklist={this.updateEmployersPicklist}
                    renderSelect={this.renderSelect}
                    renderTextField={this.renderTextField}
                    renderCheckbox={this.renderCheckbox}
                  />
                )}
                {this.props.tab === 1 && (
                  <Tab2Form
                    {...this.props}
                    onSubmit={() => this.props.handleTab(2)}
                    classes={classes}
                    handleInput={this.props.apiSubmission.handleInput}
                    renderSelect={this.renderSelect}
                    renderTextField={this.renderTextField}
                    renderCheckbox={this.renderCheckbox}
                  />
                )}
                {this.props.tab === 2 && this.props.howManyTabs === 4 && (
                  <Tab3Form
                    {...this.props}
                    onSubmit={this.handleSubmit}
                    classes={classes}
                    loading={this.props.submission.loading}
                    formPage1={this.props.submission.formPage1}
                    paymentRequired={
                      this.props.submission.formPage1.paymentRequired
                    }
                    handleInput={this.props.submission.handleInput}
                    iFrameURL={this.props.submission.payment.cardAddingUrl}
                    afhDuesRate={this.props.submission.formPage1.afhDuesRate}
                    payment={this.props.submission.payment}
                    renderSelect={this.renderSelect}
                    renderTextField={this.renderTextField}
                    renderCheckbox={this.renderCheckbox}
                    checkoff={checkoff}
                  />
                )}
                {(this.props.tab === 3 ||
                  (this.props.tab === 2 && this.props.howManyTabs === 3)) && (
                  <CAPEForm
                    {...this.props}
                    classes={classes}
                    loading={this.props.submission.loading}
                    formPage1={this.props.submission.formPage1}
                    handleInput={this.props.submission.handleInput}
                    iFrameURL={this.props.submission.payment.cardAddingUrl}
                    payment={this.props.submission.payment}
                    renderSelect={this.renderSelect}
                    renderTextField={this.renderTextField}
                    renderCheckbox={this.renderCheckbox}
                    checkoff={checkoff}
                    capeObject={this.props.submission.cape}
                    donationFrequencyOnChange={this.donationFrequencyOnChange}
                  />
                )}
              </div>
            )}
          </React.Fragment>
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
  tab: PropTypes.number,
  pristine: PropTypes.bool,
  invalid: PropTypes.bool
};
export default withWidth()(withLocalize(SubmissionFormPage1Component));
