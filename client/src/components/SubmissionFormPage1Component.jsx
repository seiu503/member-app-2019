import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import localIpUrl from "local-ip-url";

import withWidth from "@material-ui/core/withWidth";

import { withLocalize } from "react-localize-redux";
import * as formElements from "./SubmissionFormElements";
import NavTabs from "./NavTabs";
import Tab1Form from "./Tab1";
import Tab2Form from "./Tab2";
import Tab3Form from "./Tab3";
import CAPEForm from "./CAPE";
import WelcomeInfo from "./WelcomeInfo";

// helper functions these MAY NEED TO BE UPDATED with localization package
const { employerTypeMap, getKeyByValue } = formElements;

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
        // console.log(err);
        this.props.handleError(err);
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
    // ******* This will need to be changed to the
    // unioni.se prod url in production **********
    if (event.origin !== "https://lab.unioni.se") {
      return;
    }

    if (event.data.notification.type === "success") {
      this.props.apiSubmission.handleInput({
        target: { name: "paymentMethodAdded", value: true }
      });
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
          if (employer.Name === "Community Members") {
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

  async updateSubmission() {
    const id = this.props.submission.submissionId;
    const { formPage1, payment } = this.props.submission;
    const updates = {
      payment_type: formPage1.paymentType,
      payment_method_added: formPage1.paymentMethodAdded,
      medicaid_residents: formPage1.medicaidResidents,
      card_adding_url: payment.cardAddingUrl,
      member_id: payment.memberId,
      stripe_customer_id: payment.stripeCustomerId,
      member_short_id: payment.memberShortId
    };
    // console.log(updates);
    this.props.apiSubmission
      .updateSubmission(id, updates)
      .then(result => {
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
        // console.log(err);
        return this.props.handleError(err);
      });
  }

  async createSFOMA() {
    const { formValues } = this.props;
    const body = await this.props.generateSubmissionBody(formValues);
    body.Worker__c = this.props.submission.salesforceId;
    this.props.apiSF
      .createSFOMA(body)
      .then(result => {
        if (
          result.type === "CREATE_SF_OMA_FAILURE" ||
          this.props.submission.error
        ) {
          // console.log(this.props.submission.error);
          return this.props.handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        // console.log(err);
        return this.props.handleError(err);
      });
  }

  async createOrUpdateSFDJR() {
    // console.log("createOrUpdateSFDJR");
    // const { formValues } = this.props;
    const { formPage1, payment } = this.props.submission;
    // console.log(formPage1.paymentType);
    const id = this.props.submission.djrId;
    // console.log(id);
    const paymentMethod =
      formPage1.paymentType === "Check" ? "Paper Check" : "Unionise";
    const body = {
      Worker__c: this.props.submission.salesforceId,
      Payment_Method__c: paymentMethod,
      AFH_Number_of_Residents__c: formPage1.medicaidResidents,
      Unioni_se_MemberID__c: payment.memberShortId
    };
    // console.log(body);

    // create a new record if one doesn't exist, OR
    // if existing DJR record is for a different employer

    // console.log(`formPage1.employerId: ${formPage1.employerId}`);
    // check if DJR employer matches employer submitted on form
    // if no match, create new DJR even if already have id
    if (!id || formPage1.employerId !== payment.djrEmployerId) {
      // create new SFDJR record
      // console.log("createSFDJR");
      return this.props.apiSF
        .createSFDJR(body)
        .then(result => {
          // console.log(result.type);
          if (
            result.type === "CREATE_SF_DJR_FAILURE" ||
            this.props.submission.error
          ) {
            // console.log(this.props.submission.error);
            return this.props.handleError(this.props.submission.error);
          }
        })
        .catch(err => {
          // console.log(err);
          return this.props.handleError(err);
        });
    }

    // if id exists and employer matches, update existing DJR record
    // console.log("updateSFDJR");
    body.Id = id;
    delete body.Worker__c;
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
          return this.props.handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        // console.log(err);
        return this.props.handleError(err);
      });
  }

  async handleSubmit(formValues) {
    console.log("handleSubmit");
    const ip_address = localIpUrl();
    const token = this.props.submission.formPage1.reCaptchaValue;
    this.props.apiSubmission.verify(token, ip_address).then(result => {
      console.log(`score: ${result.payload.score}`);
      if (!result.payload.score || result.payload.score <= 0.5) {
        console.log("recaptcha failed");
        return this.props.handleError("recaptcha failed");
      }
    });
    const validMethod =
      !!this.props.submission.payment.activeMethodLast4 &&
      !this.props.submission.payment.paymentErrorHold;
    if (validMethod) {
      this.props.apiSubmission.handleInput({
        target: { name: "paymentMethodAdded", value: true }
      });
    }
    // console.log(`validMethod? ${validMethod}`);
    // console.log(
    //   `paymentMethodAdded? ${
    //     this.props.submission.formPage1.paymentMethodAdded
    //   }`
    // );
    // console.log(
    //   `paymentRequired? ${this.props.submission.formPage1.paymentRequired}`
    // );
    // console.log(`paymentType? ${this.props.submission.formPage1.paymentType}`);
    // submit validation: payment method
    if (
      this.props.submission.formPage1.paymentRequired &&
      this.props.submission.formPage1.paymentType === "Card" &&
      !this.props.submission.formPage1.paymentMethodAdded
    ) {
      console.log("No payment method added");
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
        // redirect to CAPE tab
        this.props.handleTab(this.props.howManyTabs - 1);

        // this.props.reset("submissionPage1");
        // this.props.history.push(
        //   `/page2/?id=${this.props.submission.salesforceId}`
        // );
      })
      .catch(err => {
        console.log(err);
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
    const checkoff = !this.props.submission.formPage1.paymentRequired;
    // console.log(employerTypesList.length);
    // console.log(employerList.length);
    return (
      <div
        data-test="component-submissionformpage1"
        className={classes.formContainer}
      >
        {values.cape ? (
          <CAPEForm
            standAlone={true}
            verifyCallback={this.verifyCallback}
            employerTypesList={employerTypesList}
            employerList={employerList}
            handleInput={this.props.apiSubmission.handleInput}
            updateEmployersPicklist={this.updateEmployersPicklist}
            onSubmit={this.props.handleCAPESubmit}
            classes={classes}
            loading={this.props.submission.loading}
            handleTab={this.props.handleTab}
            back={this.props.back}
            formValues={this.props.formValues}
            formPage1={this.props.submission.formPage1}
            iFrameURL={this.props.submission.payment.cardAddingUrl}
            payment={this.props.submission.payment}
            toggleCardAddingFrame={this.props.toggleCardAddingFrame}
            renderSelect={this.renderSelect}
            renderTextField={this.renderTextField}
            renderCheckbox={this.renderCheckbox}
            checkoff={checkoff}
            suggestedAmountOnChange={this.props.suggestedAmountOnChange}
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
                <NavTabs
                  tab={this.props.tab}
                  howManyTabs={this.props.howManyTabs}
                  handleTab={this.props.handleTab}
                  pristine={this.props.pristine}
                  valid={this.props.valid}
                  submitting={this.props.submitting}
                  submitForm={this.props.submitForm}
                  formValues={this.props.formValues}
                />
                {this.props.tab === 0 && (
                  <Tab1Form
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
                    formValues={this.props.formValues}
                    width={this.props.width}
                    handleTab={this.props.handleTab}
                    submitErrors={this.props.submitErrors}
                  />
                )}
                {this.props.tab === 1 && (
                  <Tab2Form
                    onSubmit={() => this.props.handleTab(2)}
                    classes={classes}
                    legal_language={this.props.legal_language}
                    direct_pay={this.props.direct_pay}
                    direct_deposit={this.props.direct_deposit}
                    sigBox={this.props.sigBox}
                    signatureType={this.props.signatureType}
                    toggleSignatureInputType={
                      this.props.toggleSignatureInputType
                    }
                    clearSignature={this.props.clearSignature}
                    handleInput={this.props.apiSubmission.handleInput}
                    renderSelect={this.renderSelect}
                    renderTextField={this.renderTextField}
                    renderCheckbox={this.renderCheckbox}
                    formValues={this.props.formValues}
                    handleTab={this.props.handleTab}
                    back={this.props.back}
                    initialize={this.props.initialize}
                  />
                )}
                {this.props.tab === 2 && (
                  <Tab3Form
                    onSubmit={this.handleSubmit}
                    handleCAPESubmit={this.props.handleCAPESubmit}
                    classes={classes}
                    loading={this.props.submission.loading}
                    handleTab={this.props.handleTab}
                    back={this.props.back}
                    formValues={this.props.formValues}
                    formPage1={this.props.submission.formPage1}
                    paymentRequired={
                      this.props.submission.formPage1.paymentRequired
                    }
                    handleInput={this.props.submission.handleInput}
                    iFrameURL={this.props.submission.payment.cardAddingUrl}
                    afhDuesRate={this.props.submission.formPage1.afhDuesRate}
                    payment={this.props.submission.payment}
                    toggleCardAddingFrame={this.props.toggleCardAddingFrame}
                    width={this.props.width}
                    renderSelect={this.renderSelect}
                    renderTextField={this.renderTextField}
                    renderCheckbox={this.renderCheckbox}
                    checkoff={checkoff}
                    suggestedAmountOnChange={this.props.suggestedAmountOnChange}
                  />
                )}
                {this.props.tab === 3 && (
                  <CAPEForm
                    onSubmit={this.props.handleCAPESubmit}
                    classes={classes}
                    loading={this.props.submission.loading}
                    handleTab={this.props.handleTab}
                    back={this.props.back}
                    formValues={this.props.formValues}
                    formPage1={this.props.submission.formPage1}
                    handleInput={this.props.submission.handleInput}
                    iFrameURL={this.props.submission.payment.cardAddingUrl}
                    payment={this.props.submission.payment}
                    width={this.props.width}
                    toggleCardAddingFrame={this.props.toggleCardAddingFrame}
                    renderSelect={this.renderSelect}
                    renderTextField={this.renderTextField}
                    renderCheckbox={this.renderCheckbox}
                    checkoff={checkoff}
                    suggestedAmountOnChange={this.props.suggestedAmountOnChange}
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
