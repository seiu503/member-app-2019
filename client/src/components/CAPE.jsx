import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { Trans } from "react-i18next";

import AlertDialog from "./AlertDialog";
import ButtonWithSpinner from "./ButtonWithSpinner";
import * as formElements from "./SubmissionFormElements";
import withRouter from "./ComponentWithRouterProp";

import {
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  FormLabel,
  FormHelperText,
  FormGroup,
  Box
} from "@mui/material";

import FormatQuote from "@mui/icons-material/FormatQuote";

import useMediaQuery from "@mui/material/useMediaQuery";

import headshot from "../img/ibrahim_coulibaly_300.png";

import PropTypes from "prop-types";

import { capeValidate } from "../utils/validators";
import { scrollToFirstError } from "../utils";

// change to class component and add getDJRRate on componentDidMount for standalone prefills (only needed for prefill with contact id AND !checkoff)
// if standalone blank slate skip DJR call, just require payment by default if !checkoff

export const CAPE = props => {
  const {
    handleCAPESubmit,
    loading,
    back,
    formValues,
    width,
    renderSelect,
    renderTextField,
    renderCheckbox,
    standAlone,
    // verifyCallback,
    employerTypesList,
    updateEmployersPicklist,
    employerList,
    cape_legal,
    change,
    lookupSFContact,
    capeObject,
    closeDialog,
    mobilePhoneOnBlur,
    checkoff
  } = props;

  const classes = formElements.classesPage1;
  const input2col = {
    width: {
      xs: "100%",
      sm: "48%"
    },
    display: {
      xs: "block",
      sm: "flex" // ????
    }
    // classes.input2col
  };

  const community = formValues.employerType === "community member";
  const matches = useMediaQuery("(min-width:450px)");
  // console.log("@@@@@@@@@@@@@@@@@@@");
  // console.log(props.handleSubmit);

  return (
    <Box
      data-testid="component-cape"
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
      {props.appState.capeOpen && (
        <AlertDialog
          open={props.appState.capeOpen}
          handleClose={() => props.actions.setCapeOpen(false)}
          title={<Trans i18nKey="skipTab" />}
          content={<Trans i18nKey="skipWarning" />}
          danger={true}
          action={() => props.actions.setCapeOpen(false)}
          buttonText={<Trans i18nKey="skip" />}
          data-testid="component-alert-dialog"
        />
      )}
      <form
        onSubmit={props.handleSubmit(() => handleCAPESubmit(standAlone))}
        id="CAPE"
        // className={classes.form}
        data-testid="cape-form"
      >
        <Box
          // className={classes.paymentCopy}
          sx={{
            paddingBottom: "1.5em"
          }}
        >
          <Typography
            component="h2"
            // className={classes.head}
            sx={{
              color: "#531078", // medium purple // theme.palette.primary.light
              fontSize: "1.75em",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: "15px"
            }}
          >
            <Trans i18nKey="capeHeadline" data-testid="headline-cape">
              Contribute to CAPE: Citizen Action for Political Education
            </Trans>
          </Typography>
          <Typography
            component="p"
            // className={classes.subhead}
            sx={{
              color: "#531078", // medium purple // theme.palette.primary.light
              fontSize: "1.25em",
              fontWeight: 400,
              paddingBottom: "20px"
            }}
          >
            <Trans i18nKey="capeSubhead">
              Collective political action to raise wages, protect benefits, fund
              public services, and build strong communities.
            </Trans>
          </Typography>
          {!standAlone && (
            <Typography
              component="p" // className={classes.body}
            >
              <Trans i18nKey="capeBody1" />
            </Typography>
          )}
          {!standAlone && (
            <Box
              sx={{
                fontSize: ".875em"
              }}
            >
              <ul
              // className={classes.ul}
              >
                <li
                // className={classes.li}
                >
                  <Trans i18nKey="capeBullet1" />
                </li>
                <li // className={classes.li}
                >
                  <Trans i18nKey="capeBullet2" />
                </li>
                <li // className={classes.li}
                >
                  <Trans i18nKey="capeBullet3" />
                </li>
              </ul>
            </Box>
          )}
          {!standAlone && (
            <Typography
              component="p" // className={classes.body}
            >
              <Trans i18nKey="capeBody2" />
            </Typography>
          )}
          <Card
            // className={classes.card}
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row"
              }
            }}
          >
            <Box
              // className={classes.details}
              sx={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              <CardContent
                //className={classes.content}
                sx={{
                  flex: "1 0 auto"
                }}
              >
                <Typography
                  component="h5"
                  variant="h5"
                  // className={classes.cardHead}
                  sx={{
                    color: "#531078", // medium purple // theme.palette.primary.light
                    fontWeight: 400,
                    paddingBottom: "10px"
                  }}
                >
                  <Trans i18nKey="capeCardHead">Join us</Trans>
                </Typography>
                <div style={{ position: "relative" }}>
                  <FormatQuote
                    style={{
                      color: "#531078",
                      transform: "scaleX(-1)",
                      position: "absolute",
                      top: -3,
                      left: -5,
                      opacity: 0.8
                    }}
                  />
                  <Typography
                    component="p"
                    // className={classes.pullQuote}
                    sx={{
                      textIndent: 20
                    }}
                  >
                    <Trans i18nKey="capePullQuote" />
                  </Typography>
                  <FormatQuote
                    style={{
                      color: "#531078",
                      position: "absolute",
                      bottom: 5,
                      right: -10,
                      opacity: 0.8
                    }}
                  />
                </div>
                <Typography
                  component="p"
                  // className={classes.quoteAttr}
                  sx={{
                    color: "#531078", // medium purple // theme.palette.primary.light
                    fontStyle: "italic",
                    paddingTop: "10px"
                  }}
                >
                  <Trans i18nKey="capeQuoteAttr" />
                </Typography>
              </CardContent>
            </Box>
            <CardMedia
              // className={classes.cover}
              sx={{
                minWidth: "200px",
                minHeight: "200px"
              }}
              image={headshot}
              title="Ibrahim Coulibaby"
              component="img"
            />
          </Card>
        </Box>
        {standAlone && (
          <div data-testid="form-contact-info">
            <FormGroup
              row
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: {
                  xs: "wrap",
                  sm: "nowrap"
                },
                justifyContent: "space-between",
                marginBottom: {
                  xs: 0,
                  sm: "35px"
                }
                // classes.formGroup2Col
              }}
            >
              <Field
                twocol
                mobile={!matches}
                label="First Name"
                name="firstName"
                id="firstName"
                type="text"
                classes={{ input2col }}
                component={renderTextField}
              />

              <Field
                twocol
                mobile={!matches}
                name="lastName"
                id="lastName"
                label="Last Name"
                classes={{ input2col }}
                component={renderTextField}
                type="text"
              />
            </FormGroup>
            <FormGroup
              classes={{
                root: {
                  marginTop: "30px"
                }
                // classes.formGroupTopMargin
              }}
            >
              <Field
                label="Home Email"
                name="homeEmail"
                id="homeEmail"
                type="email"
                classes={classes}
                component={renderTextField}
              />
            </FormGroup>
            <FormHelperText
              // className={classes.formHelperText}
              sx={{
                margin: "-30px 0 30px",
                fontSize: ".75rem"
              }}
            >
              <Trans i18nKey="homeEmailHint" />
            </FormHelperText>
            {employerTypesList.length < 3 && (
              <Box
                sx={{
                  padding: "20px",
                  backgroundColor: "danger.main", // orange[500], // #b71c1c
                  margin: {
                    xs: "auto -20px",
                    sm: "-20px -20px 0px -20px",
                    md: "10px 0px",
                    lg: "10px 0px",
                    xl: "0px"
                  }
                }}
              >
                <div>
                  <Typography
                    variant="body1"
                    gutterBottom
                    data-testid="apiWarning"
                    style={{ display: "inline" }}
                  >
                    <Trans i18nKey="apiWarning" />
                  </Typography>
                  &nbsp;
                  <strong>
                    <a
                      style={{ fontWeight: "bold" }}
                      href="https://seiu503.tfaforms.net/490"
                    >
                      <Trans i18nKey="reportProblem" />
                    </a>
                  </strong>
                </div>
              </Box>
            )}
            <FormGroup>
              <Field
                data-testid="select-employer-type"
                label="Employer Type"
                name="employerType"
                id="employerType"
                type="select"
                classes={classes}
                component={renderSelect}
                options={employerTypesList}
                onChange={updateEmployersPicklist}
                // labelWidth={'100'}
                style={{ width: "100%" }}
              />
              {formValues.employerType !== "" && (
                <Field
                  // labelWidth={'104'}
                  style={{ width: "100%" }}
                  label="Employer Name"
                  name="employerName"
                  id="employerName"
                  type="select"
                  classes={classes}
                  component={renderSelect}
                  options={employerList}
                  onBlur={lookupSFContact}
                />
              )}
            </FormGroup>

            <FormLabel
              // className={classes.formLabel}
              sx={{
                margin: "10px 0 10px"
                // fontSize: "20px",
                // color: "black"
              }}
              component="legend"
            >
              <Trans i18nKey="birthDate" />
            </FormLabel>
            <FormGroup
              row
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                justifyContent: "space-between",
                width: "280px"
                //classes.formGroup2ColShort
              }}
            >
              <Field
                label="Month"
                name="mm"
                id="mm"
                type="select"
                classes={classes}
                formControlName="formControlDate"
                component={renderSelect}
                style={{ width: "100%" }}
                options={formElements.monthList}
              />

              <Field
                label="Day"
                name="dd"
                id="dd"
                type="select"
                formControlName="formControlDate"
                classes={classes}
                component={renderSelect}
                style={{ width: "100%" }}
                options={formElements.dateOptions(props)}
              />

              <Field
                label="Year"
                name="yyyy"
                id="yyyy"
                type="select"
                formControlName="formControlDate"
                classes={classes}
                component={renderSelect}
                style={{ width: "100%" }}
                options={formElements.yearOptions()}
              />
            </FormGroup>

            <FormLabel
              // className={classes.formLabel}
              sx={{
                margin: "10px 0 10px"
                // fontSize: "20px",
                // color: "black"
              }}
              component="legend"
            >
              <Trans i18nKey="address">Address</Trans>
            </FormLabel>

            <Field
              label="Home Street"
              name="homeStreet"
              id="homeStreet"
              type="text"
              classes={classes}
              component={renderTextField}
            />
            <FormGroup
              row
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: {
                  xs: "wrap",
                  sm: "nowrap"
                },
                justifyContent: "space-between",
                marginBottom: "30px"
                // classes.formGroup2Col
              }}
            >
              <Field
                label="Home City"
                name="homeCity"
                id="homeCity"
                type="text"
                twocol
                mobile={!matches}
                classes={classes}
                component={renderTextField}
              />

              <Field
                label="Home State"
                name="homeState"
                id="homeState"
                type="select"
                short
                mobile={!matches}
                classes={classes}
                component={renderSelect}
                options={formElements.stateList}
                style={{ width: "100%" }}
              />

              <Field
                label="Home Zip"
                name="homeZip"
                id="homeZip"
                short
                mobile={!matches}
                type="text"
                classes={classes}
                component={renderTextField}
              />
            </FormGroup>

            <FormGroup>
              <Field
                label="Mobile Phone†"
                name="mobilePhone"
                id="mobilePhone"
                type="tel"
                classes={classes}
                component={renderTextField}
              />

              <FormHelperText
                // className={classes.formHelperText}
                sx={{
                  margin: "-30px 0 10px",
                  fontSize: ".75rem"
                }}
              >
                <Trans i18nKey="phoneLegalLanguage" />
              </FormHelperText>

              <Field
                label="Opt Out Of Receiving Mobile Alerts"
                name="textAuthOptOut"
                id="textAuthOptOut"
                type="checkbox"
                formControlName="controlCheckbox"
                component={renderCheckbox}
                classes={classes}
              />
            </FormGroup>
          </div>
        )}
        <Field
          label="Job Title"
          name="jobTitle"
          id="jobTitle"
          type="text"
          classes={classes}
          component={renderTextField}
          sx={{
            marginTop: "30px"
          }}
        />
        <div data-testid="component-cape-payment-fields">
          <Box
            // className={classes.paymentCopy}
            sx={{
              paddingBottom: "1.5em"
            }}
          >
            <Typography
              component="h2"
              // className={classes.head}
              sx={{
                color: "#531078", // medium purple // theme.palette.primary.light
                fontSize: "2em",
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: "15px"
              }}
            >
              <Trans i18nKey="capePaymentHead">
                Make your contribution today
              </Trans>
            </Typography>
            <Box
              //className={classes.suggestedAmounts}
              sx={{
                display: "block",
                flexWrap: "wrap",
                margin: "0 -1.666666666666667% 13px",
                paddingTop: "20px",
                marginTop: "15px",
                backgroundColor: "#FBE796"
              }}
            >
              <Box
                // className={classes.suggestedAmountBoxes}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap"
                }}
              >
                <Field
                  data-testid="radio-cape-amount"
                  label="Donation amount"
                  name="capeAmount"
                  formControlName="capeAmount"
                  id="capeAmountMonthly"
                  direction="horiz"
                  // className={classes.horizRadio}
                  sx={{
                    display: "flex",
                    flexDirection: "row"
                  }}
                  classes={classes}
                  component={formElements.renderCAPERadioGroup}
                  options={props.submission.cape.monthlyOptions}
                  onChange={(event, value) => {
                    change("capeAmount", value);
                  }}
                />
              </Box>
            </Box>
            {formValues.capeAmount === "Other" && (
              <Field
                dataTestId="field-other-amount"
                label="Monthly Donation Amount"
                name="capeAmountOther"
                id="capeAmountOther"
                type="number"
                inputProps={{ min: 1 }}
                classes={classes}
                component={renderTextField}
                onChange={(event, value) => {
                  change("capeAmountOther", value);
                }}
              />
            )}
          </Box>
          <div
            // className={classes.legalCopy}
            ref={cape_legal}
          >
            <p>
              <Trans
                i18nKey={checkoff ? "capeLegalCheckoff1" : "capeLegalStripe1"}
              />
            </p>
            <p>
              <strong>
                <Trans i18nKey="capeNewLegal1" />
              </strong>
            </p>
            <p>
              <Trans i18nKey="capeNewLegal2" />
            </p>
            <p>
              <Trans i18nKey="capeNewLegal3" />
            </p>
            <p>
              <Trans i18nKey="capeNewLegal4" />
            </p>
            <p>
              <Trans i18nKey="capeNewLegal5" />
            </p>
            <p>
              <Trans i18nKey="capeNewLegal6" />
            </p>
            <p>
              <Trans i18nKey="capeNewLegal7" />
            </p>
            <p>
              <Trans i18nKey="capeNewLegal8" />
            </p>
          </div>
          <ButtonWithSpinner
            type="submit"
            color="primary"
            className={standAlone ? "g-recaptcha" : ""}
            sx={{
              width: "100%",
              padding: "20px",
              margin: "25px 0 40px"
            }}
            variant="contained"
            loading={loading}
            data-sitekey="6LcIuOIqAAAAALoIbgk8ij8a_wggmfj8cQDyD_iW"
            // data-callback={verifyCallback}
            data-testid="button-submit"
            aria-label="Submit"
          >
            <Trans i18nKey="submitButton">Submit</Trans>
          </ButtonWithSpinner>
        </div>
        {!standAlone && (
          <Box
            // className={classes.buttonWrapCAPE}
            sx={{
              width: "100%",
              padding: "0 20px 40px 0",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <Button
              type="button"
              data-testid="button-back"
              onClick={() => back(1)}
              color="primary"
              // className={classes.backSmall}
              sx={{
                textTransform: "none",
                fontSize: ".8rem",
                padding: "3px 10px",
                color: "#ffffff", // white // theme.palette.secondary.light,
                "&:hover": {
                  backgroundColor: "#531078" // medium purple // theme.palette.primary.light
                }
              }}
              variant="contained"
            >
              <Trans i18nKey="back">Back</Trans>
            </Button>
            <Button
              type="button"
              data-testid="button-next"
              onClick={() => props.actions.setCapeOpen(true)}
              color="primary"
              // className={classes.nextSmall}
              sx={{
                textTransform: "none",
                fontSize: ".8rem",
                padding: "3px 10px",
                color: "#ffffff", // white // theme.palette.secondary.light,
                "&:hover": {
                  backgroundColor: "#531078" // medium purple // theme.palette.primary.light
                }
              }}
              variant="contained"
            >
              <Trans i18nKey="skip">Skip</Trans>
            </Button>
          </Box>
        )}
      </form>
    </Box>
  );
};

CAPE.propTypes = {
  onSubmit: PropTypes.func,
  classes: PropTypes.object,
  // verifyCallback: PropTypes.func,
  loading: PropTypes.bool,
  pristine: PropTypes.bool,
  invalid: PropTypes.bool
};

const mapStateToProps = state => ({
  submission: state.submission,
  initialValues: state.submission.formPage1,
  formValues: getFormValues("submissionPage1")(state) || {}
});

// add reduxForm to component
export const CAPEForm = reduxForm({
  form: "submissionPage1",
  validate: capeValidate,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: scrollToFirstError
})(CAPE);

// connect to redux store
export const CAPEConnected = connect(mapStateToProps)(withRouter(CAPEForm));

export default CAPEConnected;
