import React from "react";
import { Field } from "redux-form";
import { reduxForm } from "redux-form";

import { Button, FormHelperText, Typography, Box } from "@mui/material";

import PropTypes from "prop-types";
import { Trans } from "react-i18next";

import { validate } from "../utils/validators";
import { scrollToFirstError } from "../utils";
import * as formElements from "./SubmissionFormElements";

export const Tab2 = props => {
  const {
    onSubmit,
    // classes,
    renderTextField,
    renderCheckbox,
    back,
    legal_language,
    direct_pay,
    formValues
  } = props;

  const classes = formElements.classesPage1;

  return (
    <Box
      data-testid="component-tab2"
      sx={{
        maxWidth: "600px",
        margin: "auto",
        background: "white",
        padding: {
          xs: "15px 15px 40px 15px",
          sm: "20px 20px 40px 20px"
        },
        borderRadius: "0 0 4px 4px"
        // className={classes.form}
      }}
    >
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab2"
        data-testid="form-tab2"
        name="form-tab2"
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
        <Box
          sx={{
            margin: "0 0 35px 0",
            fontSize: "14px",
            lineHeight: "1.2em"
          }}
          id="termsOfServiceLegalLanguage"
          ref={legal_language}
        >
          <p>
            <Trans i18nKey="membershipTerms2021" />
          </p>

          <div>
            <Field
              formControlName="controlCheckboxMarginBoldSpacer"
              label="Agree to Dues Authorization"
              name="MOECheckbox"
              id="MOECheckbox"
              type="checkbox"
              classes={{
                root: {
                  marginTop: "35px important!"
                }
              }}
              bold={true}
              component={renderCheckbox}
            />
            <p>
              <Trans i18nKey="checkoff2021" />
            </p>
          </div>
        </Box>

        <Field
          formControlName="controlCheckboxMargin"
          data-testid="checkbox-ScholarshipBox"
          label="Scholarship Fund"
          name="scholarshipBox"
          id="scholarshipBox"
          type="checkbox"
          mini={true}
          classes={classes}
          component={renderCheckbox}
        />
        <Typography component="h3">
          <Trans i18nKey="signatureTitle" />
        </Typography>

        <React.Fragment>
          <Field
            label="Signature"
            data-testid="input-signature"
            name="signature"
            id="signature"
            type="text"
            classes={classes}
            component={renderTextField}
          />
          <FormHelperText
            // className={classes.formHelperText}
            sx={{
              margin: "-30px 0 40px",
              fontSize: ".75rem"
            }}
          >
            <Trans i18nKey="signatureHint" />
          </FormHelperText>
        </React.Fragment>

        <Box
          // className={classes.buttonWrap}
          sx={{
            width: "100%",
            padding: "0 20px 40px 0",
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px"
          }}
        >
          <Button
            type="button"
            data-testid="button-back"
            onClick={() => back(0)}
            color="primary"
            // className={classes.back}
            sx={{
              textTransform: "none",
              fontSize: "1.3rem",
              padding: "6px 20px",
              color: "#ffce04", // yellow/gold // theme.palette.secondary.main,
              "&:hover": {
                backgroundColor: "#531078" // medium purple // theme.palette.primary.light
              },
              marginRight: "40px"
            }}
            variant="contained"
          >
            <Trans i18nKey="back">Back</Trans>
          </Button>
          <Button
            type="submit"
            data-testid="button-submit-tab2"
            color="primary"
            sx={{
              textTransform: "none",
              fontSize: "1.3rem",
              padding: "6px 20px",
              color: "#ffce04", // yellow/gold // theme.palette.secondary.main,
              "&:hover": {
                backgroundColor: "#531078" // medium purple // theme.palette.primary.light
              }
              // classes.next
            }}
            variant="contained"
          >
            <Trans i18nKey="next">Next</Trans>
          </Button>
        </Box>
      </form>
    </Box>
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
