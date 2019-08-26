import React from "react";
import { Field } from "redux-form";
import { reduxForm } from "redux-form";
import SignatureCanvas from "react-signature-canvas";

import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";

import validate from "../utils/validators";
import { scrollToFirstError } from "../utils";
import {
  hcwDirectDepositAuthText,
  hcwDPAText,
  afhDPAText,
  retireeDPAText,
  communityDPAText,
  membershipTerms
} from "./SubmissionFormElements";

export const Tab2 = props => {
  const {
    onSubmit,
    classes,
    renderTextField,
    renderCheckbox,
    back,
    legal_language,
    direct_pay,
    direct_deposit,
    sigBox,
    clearSignature,
    handleInput,
    signatureType,
    toggleSignatureInputType,
    formValues
  } = props;
  // console.log(formValues.employerType);
  const hcw =
    formValues.employerType.toLowerCase() ===
    "state homecare or personal support";
  const afh = formValues.employerType.toLowerCase() === "adult foster home";
  const retiree = formValues.employerType.toLowerCase() === "retired";
  const community =
    formValues.employerType.toLowerCase() === "community member";
  return (
    <div data-test="component-tab2" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab2"
        className={classes.form}
        style={{ paddingTop: 40 }}
      >
        <Field
          formControlName="controlCheckbox"
          label="Agree to Terms of Membership"
          name="termsAgree"
          id="termsAgree"
          type="checkbox"
          classes={classes}
          component={renderCheckbox}
        />
        <div
          className={classes.formHelperTextLegal}
          id="termsOfServiceLegalLanguage"
          ref={legal_language}
        >
          {membershipTerms}
        </div>

        {(hcw || afh || community || retiree) && (
          <React.Fragment>
            <Field
              formControlName="controlCheckbox"
              label="Direct Pay Authorization"
              name="directPayAuth"
              id="directPayAuth"
              type="checkbox"
              classes={classes}
              component={renderCheckbox}
            />
            <div
              className={classes.formHelperTextLegal}
              id="directPayAuthLegalLanguage"
              ref={direct_pay}
            >
              {hcw
                ? hcwDPAText
                : afh
                ? afhDPAText
                : retiree
                ? retireeDPAText("m")
                : community
                ? communityDPAText
                : ""}
            </div>
          </React.Fragment>
        )}
        {hcw && (
          <React.Fragment>
            <Field
              formControlName="controlCheckbox"
              label="Direct Deposit Authorization"
              name="directDepositAuth"
              id="directDepositAuth"
              type="checkbox"
              classes={classes}
              component={renderCheckbox}
            />
            <div
              className={classes.formHelperTextLegal}
              id="directDepositAuthLegalLanguage"
              ref={direct_deposit}
            >
              {hcwDirectDepositAuthText}
            </div>
          </React.Fragment>
        )}
        <Typography component="h3" className={classes.fieldLabel}>
          Signature
        </Typography>
        {signatureType === "write" && (
          <React.Fragment>
            <Field
              label="Signature"
              name="signature"
              id="signature"
              type="text"
              classes={classes}
              component={renderTextField}
            />
            <FormHelperText className={classes.formHelperText}>
              Enter your full legal name. This will act as your signature.
            </FormHelperText>
          </React.Fragment>
        )}
        {signatureType === "draw" && (
          <React.Fragment>
            <div className={classes.sigBox}>
              <SignatureCanvas
                ref={sigBox}
                penColor="black"
                canvasProps={{
                  width: 594,
                  height: 100,
                  className: "sigCanvas"
                }}
                backgroundColor="rgb(255,255,255)"
                label="Signature"
                name="signature"
                id="signature"
                onChange={handleInput}
              />
              <Button
                type="button"
                onClick={clearSignature}
                color="secondary"
                className={classes.clearButton}
                variant="contained"
              >
                Clear Signature
              </Button>
            </div>
            <FormHelperText className={classes.formHelperText}>
              Draw your signature in the box above.&nbsp;
              <button
                type="button"
                data-test="button-sig-toggle"
                className={classes.buttonLink}
                aria-label="Change Signature Input Method"
                name="signatureType"
                onClick={() => toggleSignatureInputType()}
              >
                Click here to type your signature
              </button>
            </FormHelperText>
          </React.Fragment>
        )}
        <div className={classes.buttonWrap}>
          <Button
            type="button"
            data-test="button-back"
            onClick={() => back(0)}
            color="primary"
            className={classes.back}
            variant="contained"
          >
            Back
          </Button>
          <Button
            type="submit"
            color="primary"
            className={classes.next}
            variant="contained"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

Tab2.propTypes = {
  onSubmit: PropTypes.func,
  classes: PropTypes.object,
  renderTextField: PropTypes.func,
  renderCheckbox: PropTypes.func,
  handleTab: PropTypes.func,
  legal_language: PropTypes.object,
  sigBox: PropTypes.object,
  clearSignature: PropTypes.func,
  handleInput: PropTypes.func,
  formPage1: PropTypes.object,
  signatureType: PropTypes.string,
  toggleSignatureInputType: PropTypes.func
};

// add reduxForm to component
export const Tab2Form = reduxForm({
  form: "submissionPage1",
  validate,
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: errors => scrollToFirstError(errors)
})(Tab2);

export default Tab2Form;
