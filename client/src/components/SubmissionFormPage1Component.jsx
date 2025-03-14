import React, { useEffect } from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import { Box } from "@mui/material";

import { withTranslation } from "react-i18next";
import * as formElements from "./SubmissionFormElements";
import NavTabs from "./NavTabs";
import SinglePageForm from "./SinglePageForm";
import Tab1Form from "./Tab1";
import Tab2Form from "./Tab2";
import CAPEForm from "./CAPE";
import WelcomeInfo from "./WelcomeInfo";
import withRouter from "./ComponentWithRouterProp";
import { employersPayload } from "../utils/testUtils";

// helper functions
const { employerTypeMap, getKeyByValue } = formElements;


export const SubmissionFormPage1Component = React.forwardRef((props, ref) => {

  useEffect(() => {
    // previously componentDidMount
    // console.log("Component is mounted");
    // API call to SF to populate employers picklist
    async function fetchData() {
      props.apiSF
      .getSFEmployers()
      .then(result => {
        // console.log(result);
        // console.log(result.payload);
        loadEmployersPicklist();
      })
      .catch(err => {
        console.error(err);
        // load placeholder data if api call fails
        loadEmployersPicklist();
        // don't return this error to client, it's a background api call
        // props.handleError(err);
      });
    }
    fetchData();
    
  }, []);

  useEffect(() => {
    // console.log('cDU');
    // console.log(props.submission.employerNames);
    // console.log(props.submission.employerNames.length);
    if (
      props.submission.employerNames &&
      props.submission.employerNames.length < 3
    ) {
      loadEmployersPicklist();
    }
  }, [props.submission.employerNames]);

  // reusable MUI form components
  const renderTextField = formElements.renderTextField;
  const renderSelect = formElements.renderSelect;
  const renderCheckbox = formElements.renderCheckbox;

  const loadEmployersPicklist = () => {
    // console.log('loadEmployersPicklist');
    // generate initial picklist of employer types by manipulating data
    // from redux store to replace with more user-friendly names

    // if development env & API call failing, load placeholder data for now
    if (process.env.REACT_APP_ENV_TEXT === 'development' && props.submission.employerObjects.length < 3) {
      console.log('developmnet env and no employer data loaded, loading placeholder data');
      props.submission.employerObjects = [ ...employersPayload ];
      };

    const employerTypesListRaw = props.submission.employerObjects
      ? props.submission.employerObjects.filter(employer => !!employer.Sub_Division__c).map(
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
        : code
    ) || [""];
    employerTypesList.unshift("");
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    // console.log(employerTypesList);

    return employerTypesList;
  };

  const updateEmployersPicklist = () => {
    // get the value of the employer type selected by user
    let employerTypeUserSelect = "";
    if (Object.keys(props.formValues).length) {
      employerTypeUserSelect = props.formValues.employerType;
    } else {
      // console.log("no formValues in props");
    }
    // console.log(`employerType: ${employerTypeUserSelect}`);
    const employerTypesList = loadEmployersPicklist();

    // if picklist finished populating and user has selected employer type,
    // filter the employer names list to return only names in that category
    if (
      employerTypesList &&
      employerTypesList.length > 1 &&
      employerTypeUserSelect !== "" &&
      props.submission.employerObjects
    ) {
      const employerObjectsFiltered = employerTypeUserSelect
        ? props.submission.employerObjects.filter(
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
  // don't think this method is ever called, App.jsx calls apiSF action directly
  // const createSFOMA = async (submissionId) => {
  //   console.log("createSFOMA");
  //   props.actions.setSpinner();
  //   const { formValues } = props;
  //   const body = await props.generateSubmissionBody(formValues);
  //   body.Worker__c = props.submission.salesforceId;
  //   props.apiSF
  //     .createSFOMA(body)
  //     .then(result => {
  //       // console.log(result.type);
  //       if (
  //         result.type === "CREATE_SF_OMA_FAILURE" ||
  //         props.submission.error
  //       ) {
  //         // console.log(props.submission.error);
  //         props.saveSubmissionErrors(
  //           submissionId,
  //           "createSFOMA",
  //           props.submission.error
  //         );
  //         console.error(props.submission.error);
  //         return props.handleError(props.submission.error);
  //       }
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       props.saveSubmissionErrors(
  //         submissionId,
  //         "createSFOMA",
  //         err
  //       );
  //       return props.handleError(err);
  //     });
  // }

    // render variables 
    const { classes } = props;
    const employerTypesList = loadEmployersPicklist() || [
      { Name: "", Sub_Division__c: "" }
    ];
    const employerList = updateEmployersPicklist() || [""];
    const values = queryString.parse(props.location.search);
    // console.log(`################# query params #################`)
    // console.log(values);
    // console.log(props);
    const checkoff = props.submission.formPage1.checkoff;
    const { spf, tab } = props.appState;

    // console.log(`tab SFP1C 203: ${tab}`);
    // console.dir(props.appState);
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
        sx={props.appState.embed ? formContainerEmbed : formContainer}
      >
        {values.cape ? (
          <CAPEForm
            {...props}
            standAlone={true}
            newCardNeeded={true}
            // verifyCallback={verifyCallback}
            employerTypesList={employerTypesList}
            employerList={employerList}
            updateEmployersPicklist={updateEmployersPicklist}
            classes={classes}
            loading={props.submission.loading}
            formPage1={props.submission.formPage1}
            handleInput={props.apiSubmission.handleInput}
            payment={props.submission.payment}
            renderSelect={renderSelect}
            renderTextField={renderTextField}
            renderCheckbox={renderCheckbox}
            checkoff={checkoff}
            capeObject={props.submission.cape}
          />
        ) : 

        spf && tab !== 2 ? (
          <SinglePageForm
            {...props}
            onSubmit={() => {
              props.handleTab(1);
              return false;
            }}
            // verifyCallback={verifyCallback}
            classes={classes}
            employerTypesList={employerTypesList}
            employerList={employerList}
            handleInput={props.apiSubmission.handleInput}
            updateEmployersPicklist={updateEmployersPicklist}
            renderSelect={renderSelect}
            renderTextField={renderTextField}
            renderCheckbox={renderCheckbox}
            handleError={props.handleError}
            openSnackbar={props.openSnackbar}
            prefillValues={props.submission.prefillValues}
          />
        ) :
        (
          <>
            {typeof tab !== "number" && (
              <WelcomeInfo
                location={props.location}
                history={props.history}
                handleTab={props.handleTab}
                renderBodyCopy={props.renderBodyCopy}
                renderHeadline={props.renderHeadline}
                handleError={props.handleError}
                openSnackbar={props.openSnackbar}
                style={
                  typeof tab !== "number"
                    ? { display: "block" }
                    : { display: "none" }
                }
              />
            )}

            {tab >= 0 && (
              <div
                style={
                  tab >= 0
                    ? { display: "block" }
                    : { display: "none" }
                }
              >
              {/*  <NavTabs {...props} /> */}
                {tab === 0 && (
                  <Tab1Form
                    {...props}
                    onSubmit={() => {
                      props.handleTab(1);
                      return false;
                    }}
                    // verifyCallback={verifyCallback}
                    classes={classes}
                    employerTypesList={employerTypesList}
                    employerList={employerList}
                    handleInput={props.apiSubmission.handleInput}
                    updateEmployersPicklist={updateEmployersPicklist}
                    renderSelect={renderSelect}
                    renderTextField={renderTextField}
                    renderCheckbox={renderCheckbox}
                    handleError={props.handleError}
                    openSnackbar={props.openSnackbar}
                  />
                )}
                {tab === 1 && !spf && (
                  <Tab2Form
                    {...props}
                    onSubmit={() => props.handleTab(2)}
                    classes={classes}
                    handleInput={props.apiSubmission.handleInput}
                    renderSelect={renderSelect}
                    renderTextField={renderTextField}
                    renderCheckbox={renderCheckbox}
                    handleError={props.handleError}
                    openSnackbar={props.openSnackbar}
                  />
                )}
                {tab === 2 && (
                  <CAPEForm
                    {...props}
                    classes={classes}
                    loading={props.submission.loading}
                    formPage1={props.submission.formPage1}
                    handleInput={props.submission.handleInput}
                    payment={props.submission.payment}
                    renderSelect={renderSelect}
                    renderTextField={renderTextField}
                    renderCheckbox={renderCheckbox}
                    checkoff={checkoff}
                    capeObject={props.submission.cape}
                    handleError={props.handleError}
                    openSnackbar={props.openSnackbar}
                  />
                )}
              </div>
            )}
          </>
        )}
      </Box>
    );
  });

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
  formValues: PropTypes.object,
  legal_language: PropTypes.shape({
    current: PropTypes.shape({
      textContent: PropTypes.string
    })
  }),
  handleTab: PropTypes.func,
  appState: PropTypes.shape({
    tab: PropTypes.number,
    spf: PropTypes.bool
  }),  
  pristine: PropTypes.bool,
  invalid: PropTypes.bool
};
export default withTranslation()(withRouter(SubmissionFormPage1Component));
