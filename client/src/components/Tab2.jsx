import React from "react";
import { Field } from "redux-form";
import { reduxForm } from "redux-form";

import { Button, FormHelperText, Typography, Box } from "@mui/material";

import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";

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
  // console.log(formValues.employerType);
  const afh = formValues.employerType.toLowerCase() === "adult foster home";
  const retiree = formValues.employerType.toLowerCase() === "retired";
  const community =
    formValues.employerType.toLowerCase() === "community member";

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
          // sx={{
          //   margin: "-35px 0 40px 0",
          //   fontWeight: 700
          // }}
        />
        <Box
          // className={classes.formHelperTextLegal}
          sx={{
            margin: "0 0 35px 0",
            fontSize: "14px",
            lineHeight: "1.2em"
          }}
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
                classes={{
                  root: {
                    marginTop: "35px important!"
                  }
                }}
                bold={true}
                component={renderCheckbox}
              />
              <p>
                <Translate id="checkoff2021" />
              </p>
            </div>
          )}
        </Box>

        {(afh || community || retiree) && (
          <React.Fragment>
            <Field
              formControlName="controlCheckboxMarginBold"
              data-testid="checkbox-DPA"
              label="Direct Pay Authorization"
              name="directPayAuth"
              id="directPayAuth"
              type="checkbox"
              classes={classes}
              bold={true}
              component={renderCheckbox}
            />
            <Box
              // className={classes.formHelperTextLegal}
              sx={{
                margin: "-50px 0 50px 0",
                fontSize: "14px",
                lineHeight: "1.2em"
              }}
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
            </Box>
          </React.Fragment>
        )}
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
          <Translate id="signatureTitle" />
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
            <Translate id="signatureHint" />
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
            <Translate id="back">Back</Translate>
          </Button>
          <Button
            type="submit"
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
            <Translate id="next">Next</Translate>
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
