import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";

import { withLocalize } from "react-localize-redux";
import * as formElements from "./SubmissionFormElements";
import NavTabs from "./NavTabs";
import Tab1Form from "./Tab1";
import Tab2Form from "./Tab2";
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
    this.donationFrequencyOnChange = this.donationFrequencyOnChange.bind(this);
  }
  sigBox = {};
  componentDidMount() {
    // console.log("cDM");
    // API call to SF to populate employers picklist
    this.props.apiSF
      .getSFEmployers()
      .then(result => {
        // console.log(result);
        // console.log(result.payload);
        this.loadEmployersPicklist();
      })
      .catch(err => {
        console.error(err);
        // don't return this error to client, it's a background api call
        // this.props.handleError(err);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.submission.employerNames.length < 3) {
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
      ? this.props.submission.employerObjects.map(employer => {
          if (
            employer.Name &&
            employer.Name.toLowerCase() === "community members"
          ) {
            return "Community Members";
          } else if (
            employer.Name &&
            employer.Name.toLowerCase() === "seiu local 503 opeu"
          ) {
            // removing staff option from prefill list
            // return "SEIU LOCAL 503 OPEU";
            return "";
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
    // console.log(`employerType: ${employerTypeUserSelect}`);
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
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() === "seiu 503 staff"
      ) {
        employerList = ["SEIU 503 Staff"];
      }
      // remove 'HCW Holding' from employer options for State HCWs, make user-friendly names for others
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() ===
          "state homecare or personal support"
      ) {
        employerList = employerList.map(employer => {
          if (employer === "PPL PSW") {
            return "Personal Support Worker (paid by PPL)";
          } else if (employer === "State PSW") {
            return "Personal Support Worker (paid by State of Oregon)";
          } else if (employer === "State APD") {
            return "Homecare Worker (Aging and People with Disabilities)";
          } else if (employer !== "HCW Holding") {
            return employer;
          }
          return "";
        });
      }
      // remove blank employers
      employerList = employerList.filter(employer => employer !== "");
      // add one blank line to top so placeholder text is visible
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
      if (
        employerTypeUserSelect &&
        employerTypeUserSelect.toLowerCase() === "seiu 503 staff"
      ) {
        this.props.formValues.employerName = "SEIU 503 Staff";
      }
      return employerList;
    }
  };

  donationFrequencyOnChange(event, value) {
    // console.log("donationFrequencyOnChange");
    // console.log(value);
    this.props.change("donationFrequency", value);
    this.props.handleDonationFrequencyChange(value);
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

  async handleSubmit(formValues) {
    console.log("handleSubmit");
    this.props.actions.setSpinner();

    // await this.props
    //   .verifyRecaptchaScore()
    //   .then(score => {
    //     console.log(`score: ${score}`);
    //     if (!score || score <= 0.5) {
    //       console.log(`recaptcha failed: ${score}`);
    //       return this.props.handleError(
    //         "ReCaptcha validation failed, please reload the page and try again."
    //       );
    //     }
    //   })
    //   .catch(err => {
    //     console.error(err);
    //   });

    return Promise.all([
      this.props.createSubmission(formValues),
      this.createSFOMA()
    ])
      .then(() => {
        // update submission status and redirect to CAPE tab
        if (!this.props.submission.error) {
          console.log("updating submission status");
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
                return this.props.handleError(this.props.submission.error);
              }
              this.props.handleTab(this.props.howManyTabs - 1);
            })
            .catch(err => {
              console.error(err);
              return this.props.handleError(err);
            });
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
    const checkoff = this.props.submission.formPage1.checkoff;
    // console.log(employerTypesList.length);
    // console.log(employerList.length);
    return (
      <div
        data-testid="component-submissionformpage1"
        className={
          this.props.embed ? classes.formContainerEmbed : classes.formContainer
        }
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
                embed={this.props.embed}
                location={this.props.location}
                history={this.props.history}
                handleTab={this.props.handleTab}
                headline={this.props.headline}
                image={this.props.image}
                body={this.props.body}
                renderBodyCopy={this.props.renderBodyCopy}
                renderHeadline={this.props.renderHeadline}
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
                {(this.props.tab === 3 ||
                  (this.props.tab === 2 && this.props.howManyTabs === 3)) && (
                  <CAPEForm
                    {...this.props}
                    classes={classes}
                    loading={this.props.submission.loading}
                    formPage1={this.props.submission.formPage1}
                    handleInput={this.props.submission.handleInput}
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
export default withLocalize(SubmissionFormPage1Component);
