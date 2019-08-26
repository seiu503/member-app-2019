import React from "react";
import PropTypes from "prop-types";

import withWidth from "@material-ui/core/withWidth";

import * as formElements from "./SubmissionFormElements";
import NavTabs from "./NavTabs";
import Tab1Form from "./Tab1";
import Tab2Form from "./Tab2";
import Tab3Form from "./Tab3";
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
        this.loadEmployersPicklist();
      })
      .catch(err => {
        console.log(err);
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
      // formValues.paymentMethodAdded = true;
      // this.props.apiSubmission.handleInput({ name: 'paymentMethodAdded', value: true });
      this.props.changeFieldValue("paymentMethodAdded", true);
      console.log(this.props.formValues.paymentMethodAdded);
    }
    // then set payment method added in redux store
    //
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

  reCaptchaChange = response => {
    // console.log(response, "<= dis your captcha token");
  };

  async handleSubmit(formValues) {
    console.log("handleSubmit (update submission)");

    // submit validation: payment method
    if (
      this.props.submission.formPage1.paymentRequired &&
      formValues.paymentType === "Card" &&
      !formValues.paymentMethodAdded
    ) {
      console.log("No payment method added");
      return this.props.handleError(
        "Please click 'Add a Card' to add a payment method"
      );
    }
    const id = this.props.submission.submissionId;
    console.log(id);
    const updates = {
      payment_type: formValues.paymentType,
      payment_method_added: formValues.paymentMethodAdded,
      medicaid_residents: formValues.medicaidResidents,
      card_adding_url: this.props.submission.payment.cardAddingUrl,
      member_id: this.props.submission.payment.memberId,
      stripe_customer_id: this.props.submission.payment.stripeCustomerId,
      member_short_id: this.props.submission.payment.memberShortId
    };
    console.log(updates);

    // also write to directJoinRate__c ######### <== TODO
    try {
      const result = await this.props.apiSubmission.updateSubmission(
        id,
        updates
      );
      if (
        result.type === "UPDATE_SUBMISSION_FAILURE" ||
        this.props.submission.error
      ) {
        console.log(this.props.submission.error);
        this.props.handleError(this.props.submission.error);
      } else {
        const body = this.props.generateSubmissionBody(formValues);
        this.props.apiSF.createSFOMA(body);
        this.props.reset("submissionPage1");
        // redirect to CAPE here...
        console.log(this.props.submission.salesforceId);
        this.props.history.push(
          `/page2/?id=${this.props.submission.salesforceId}`
        );
      }
    } catch (err) {
      console.log(err);
      this.props.handleError(err);
    }
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
                onSubmit={() => this.props.handleTab(1)}
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
                reCaptchaChange={this.reCaptchaChange}
                reCaptchaRef={this.props.reCaptchaRef}
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
                toggleSignatureInputType={this.props.toggleSignatureInputType}
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
                classes={classes}
                loading={this.props.submission.loading}
                handleTab={this.props.handleTab}
                back={this.props.back}
                formValues={this.props.formValues}
                paymentRequired={
                  this.props.submission.formPage1.paymentRequired
                }
                changeFieldValue={this.props.changeFieldValue}
                iFrameURL={this.props.submission.payment.cardAddingUrl}
                afhDuesRate={this.props.submission.formPage1.afhDuesRate}
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
