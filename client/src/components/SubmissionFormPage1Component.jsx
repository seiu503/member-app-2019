import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import { Box } from "@mui/material";

import { withTranslation } from "react-i18next";
import * as formElements from "./SubmissionFormElements";
import * as utils from "../utils";

import NavTabs from "./NavTabs";
import SinglePageForm from "./SinglePageForm";
import CAPEForm from "./CAPE";
import withRouter from "./ComponentWithRouterProp";

// helper functions
const { employerTypeMap, getKeyByValue } = formElements;

export class SubmissionFormPage1Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureType: "draw",
      defaultLanguage: "English"
    };
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
    // console.log('cDU');
    // console.log(this.props.submission.employerNames);
    // console.log(this.props.submission.employerNames.length);
    if (
      this.props.submission.employerNames &&
      this.props.submission.employerNames.length < 3
    ) {
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
          employer => employer.Sub_Division__c || ""
        )
      : [""];
    const employerTypesCodes = [...new Set(employerTypesListRaw)] || [""];
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    // console.log(employerTypesCodes);
    // console.log(formElements.employerTypeMap);
    const employerTypesList = employerTypesCodes.map(code =>
      formElements.employerTypeMap[code]
        ? formElements.employerTypeMap[code]
        : ""
    ) || [""];
    employerTypesList.unshift("");
    return employerTypesList;
  };

  updateEmployersPicklist = () => {
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
    if (
      employerTypesList &&
      employerTypesList.length > 1 &&
      employerTypeUserSelect !== "" &&
      this.props.submission.employerObjects
    ) {
      const employerObjectsFiltered = employerTypeUserSelect
        ? this.props.submission.employerObjects.filter(
            employer =>
              employer.Sub_Division__c ===
              formElements.getKeyByValue(
                formElements.employerTypeMap,
                employerTypeUserSelect
              )
          )
        : [{ Name: "" }];
      let employerList = employerObjectsFiltered.map(employer => employer.Name);

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
      return employerList;
    }
  };

  // called from createSubmission in App.jsx > 726
  // ^^ createSubmission is called from handleTab2 in SubmissionFormPage1.jsx > 511
  async createSFOMA() {
    console.log("createSFOMA");
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

  render() {
    // console.log('submFormPage1Comp Render');
    const { classes } = this.props;
    const employerTypesList = this.loadEmployersPicklist() || [
      { Name: "", Sub_Division__c: "" }
    ];
    const employerList = this.updateEmployersPicklist() || [""];
    const values = queryString.parse(this.props.location.search);
    // console.log(`################# query params #################`)
    // console.log(values);
    // console.log(this.props);
    const checkoff = this.props.submission.formPage1.checkoff;
    const formContainer = {
      display: "flex",
      padding: {
        xs: "20px 0",
        lg: "20px 50px 20px 0",
        xl: "80px 0 140px 0"
      },
      margin: {
        xs: "36px auto",
        sm: "44px auto",
        lg: "44px 0 44px 50%"
      },
      width: {
        xs: "100vw",
        sm: "auto"
      },
      maxWidth: {
        xs: "600px"
      },
      position: {
        xs: "absolute",
        sm: "static"
      },
      left: {
        xs: 0
      },
      top: {
        xs: 0
      }
    };
    const formContainerEmbed = {
      padding: "80px 0 140px 0",
      margin: "auto",
      width: {
        xs: "100vw",
        sm: "auto"
      },
      position: {
        xs: "absolute",
        sm: "static"
      },
      left: {
        xs: 0
      },
      top: {
        xs: 0
      }
    };
    return (
      <Box
        data-testid="component-submissionformpage1"
        sx={this.props.embed ? formContainerEmbed : formContainer}
      >
        {values.cape || this.props.tab === 2 ? (
          <CAPEForm
            {...this.props}
            standAlone={values.cape}
            newCardNeeded={true}
            // verifyCallback={this.verifyCallback}
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
          />
        ) : (
          <SinglePageForm
            {...this.props}
            onSubmit={() => {
              this.props.handleTab(1);
              return false;
            }}
            // verifyCallback={this.verifyCallback}
            classes={classes}
            employerTypesList={employerTypesList}
            employerList={employerList}
            handleInput={this.props.apiSubmission.handleInputSPF}
            updateEmployersPicklist={this.updateEmployersPicklist}
            renderSelect={this.renderSelect}
            renderTextField={this.renderTextField}
            renderCheckbox={this.renderCheckbox}
            handleError={this.props.handleError}
            openSnackbar={this.props.openSnackbar}
          />
        )}
      </Box> 
    );
  }
}
SubmissionFormPage1Component.propTypes = {
  submission: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.string,
    salesforceId: PropTypes.string,
    employerNames: PropTypes.array,
    // employerObjects: PropTypes.arrayOf(
    //   PropTypes.shape({
    //     Name: PropTypes.string,
    //     Sub_Division__c: PropTypes.string
    //   })
    // ),
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
export default withTranslation()(withRouter(SubmissionFormPage1Component));
