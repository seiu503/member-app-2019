import React, { useEffect } from "react";
import { getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import { withTranslation } from "react-i18next";

import withRouter from "../components/ComponentWithRouterProp";

import SubmissionFormPage2FormWrap from "../components/SubmissionFormPage2CompFunction";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
// import { stylesPage2 } from "../components/SubmissionFormElements";

export const SubmissionFormPage2Function = props => {
  const classes = props.classes;

  useEffect(() => {
    // check state for ids from page1
    let cId = props.submission.salesforceId,
      sId = props.submission.submissionId;
    // console.log(`previously saved sId: ${sId}`);
    // check for ids in query string
    const params = queryString.parse(props.location.search);
    if (!cId && params.cId) {
      cId = params.cId;
      props.apiSubmission.saveSalesforceId(cId);
    }
    if (!sId && params.sId) {
      sId = params.sId;
      props.apiSubmission.saveSubmissionId(sId);
    }

    // if find cId, call API to fetch contact info for prefill
    if (cId) {
      props.apiSF
        .getSFContactById(cId)
        .then(result => {
          // console.log("result.payload", result.payload);
        })
        .catch(err => {
          console.log(err);
          props.handleError(err);
        });
    } else {
      return props.navigate("/");
    }
  }, []);

  return (
    <div data-testid="container-submission-form-page-2">
      <SubmissionFormPage2FormWrap {...props} />
    </div>
  );
};

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues: state.submission.formPage2,
  formValues: getFormValues("submissionPage2")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch)
});

export const SubmissionFormPage2Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage2Function);

export default withTranslation()(withRouter(SubmissionFormPage2Connected));
