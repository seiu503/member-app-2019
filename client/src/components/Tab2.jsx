import React from "react";
import { Field } from "redux-form";
import { reduxForm } from "redux-form";

import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";

import { validate } from "../utils/validators";
import { scrollToFirstError } from "../utils";

export const Tab2 = props => {
  const {
    onSubmit,
    classes,
    renderTextField,
    renderCheckbox,
    back,
    legal_language,
    direct_pay,
    formValues
  } = props;
  // console.log(formValues.employerType);
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
          formControlName="controlCheckboxMarginBold"
          label="Agree to Terms of Membership"
          name="termsAgree"
          id="termsAgree"
          type="checkbox"
          classes={classes}
          bold={true}
          component={renderCheckbox}
        />
        <div
          className={classes.formHelperTextLegal}
          id="termsOfServiceLegalLanguage"
          ref={legal_language}
        >
          {community ? (
            <p>
              <Translate id="communityMembershipTerms2022" />
            </p>
          ) : (
            <p>
              <Translate id="membershipTerms2021" />
            </p>
          )}
          {!community && !retiree && !afh && (
            <div>
              <Field
                formControlName="controlCheckboxMarginBoldSpacer"
                label="Agree to Dues Authorization"
                name="MOECheckbox"
                id="MOECheckbox"
                type="checkbox"
                classes={classes}
                bold={true}
                component={renderCheckbox}
              />
              <p>
                <Translate id="checkoff2021" />
              </p>
            </div>
          )}
        </div>

        {(afh || community || retiree) && (
          <React.Fragment>
            <Field
              formControlName="controlCheckboxMarginBold"
              data-test="checkbox-DPA"
              label="Direct Pay Authorization"
              name="directPayAuth"
              id="directPayAuth"
              type="checkbox"
              classes={classes}
              bold={true}
              component={renderCheckbox}
            />
            <div
              className={classes.formHelperTextLegal}
              id="directPayAuthLegalLanguage"
              ref={direct_pay}
            >
              {afh && (
                <React.Fragment>
                  <p>
                    <Translate id="afhDPA1" />
                  </p>
                  <p>
                    <Translate id="afhDPA2" />
                  </p>
                </React.Fragment>
              )}
              {community && (
                <>
                  <p>
                    <Translate id="communityDPA2022_1" />
                  </p>
                  <p>
                    <Translate id="communityDPA2022_2" />
                  </p>
                </>
              )}
              {retiree && (
                <p>
                  <Translate id="retireeDPA1" />
                </p>
              )}
              <p>
                <Translate id={afh ? "afhDPA3" : "DPA3"} />
              </p>
              {community && (
                <p>
                  <Translate id="communityDPA2022_4" />
                </p>
              )}
              <p>
                <Translate id="DPA4" />
              </p>
            </div>
          </React.Fragment>
        )}
        <Field
          formControlName="controlCheckboxMargin"
          data-test="checkbox-ScholarshipBox"
          label="Scholarship Fund"
          name="scholarshipBox"
          id="scholarshipBox"
          type="checkbox"
          mini={true}
          classes={classes}
          component={renderCheckbox}
        />
        <Typography component="h3" className={classes.fieldLabel}>
          <Translate id="signatureTitle" />
        </Typography>

        <React.Fragment>
          <Field
            label="Signature"
            data-test="input-signature"
            name="signature"
            id="signature"
            type="text"
            classes={classes}
            component={renderTextField}
          />
          <FormHelperText className={classes.formHelperText}>
            <Translate id="signatureHint" />
          </FormHelperText>
        </React.Fragment>

        <div className={classes.buttonWrap}>
          <Button
            type="button"
            data-test="button-back"
            onClick={() => back(0)}
            color="primary"
            className={classes.back}
            variant="contained"
          >
            <Translate id="back">Back</Translate>
          </Button>
          <Button
            type="submit"
            color="primary"
            className={classes.next}
            variant="contained"
          >
            <Translate id="next">Next</Translate>
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
  formPage1: PropTypes.object
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
  onSubmitFail: scrollToFirstError
})(Tab2);

export default Tab2Form;
