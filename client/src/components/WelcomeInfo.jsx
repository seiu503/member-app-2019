import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Trans } from "react-i18next";

import { Typography, CardMedia, Card, Button, Box } from "@mui/material";

import SamplePhoto from "../img/sample-form-photo.jpg";

export class WelcomeInfoUnconnected extends React.Component {
  render() {
    const { classes } = this.props;
    const imageUrl =
      this.props.image && this.props.image.url
        ? this.props.image.url
        : SamplePhoto;
    return (
      <Box
        data-testid="component-welcome-info"
        sx={{
          paddingBottom: {
            xs: "20px",
            sm: 0
          },
          margin: {
            xs: 0,
            md: "40px auto",
            lg: 0
          },
          maxWidth: {},
          color: "primary.main" // "#2c0940", // dark purple
        }}
      >
        <Card
          sx={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px"
          }}
        >
          {imageUrl && !this.props.appState.embed && (
            <Box
              sx={{
                // height: "auto",
                // paddingTop: "56.25%", // 16:9,
                // position: "relative",
                // display: {
                //   md: "none"
                // },
                margin: {
                  xs: "-24px -20px 0 -20px",
                  sm: "inherit",
                  md: "inherit",
                  lg: "inherit",
                  xl: "inherit"
                }
              }}
            >
              <CardMedia
                title="Welcome Photo"
                alt="Welcome Photo"
                image={imageUrl}
                sx={{
                  height: "auto",
                  paddingTop: "56.25%", // 16:9,
                  position: "relative",
                  display: {
                    md: "none"
                  },
                  margin: {
                    xs: "-24px -20px 0 -20px",
                    sm: "inherit",
                    md: "inherit",
                    lg: "inherit",
                    xl: "inherit"
                  }
                }}
                component="div"
              />
            </Box>
          )}

          {process.env.REACT_APP_ENV_TEXT !== "production" && (
            <Box
              sx={{
                padding: "20px",
                backgroundColor: "danger.main", // orange[500], // #b71c1c
                margin: {
                  xs: "auto -20px",
                  sm: "-20px -20px 0px -20px",
                  // md: "10px",
                  // lg: "10px",
                  xl: "0px"
                }
              }}
            >
              <div>
                <Typography
                  variant="body1"
                  gutterBottom
                  data-testid="testWarning"
                  style={{ display: "inline" }}
                >
                  This form is for testing only. Membership data submitted
                  through this form will not be processed. If you landed on the
                  test page by mistake and want to become a member of SEIU Local
                  503, please click here:&nbsp;
                </Typography>
                <strong>
                  <a
                    style={{ fontWeight: "bold", fontSize: "1.2em" }}
                    href="https://seiu503signup.org"
                  >
                    seiu503signup.org
                  </a>
                </strong>
              </div>
            </Box>
          )}
          {this.props.renderHeadline(this.propsappState.headline.id)}
          {this.props.renderBodyCopy(this.props.appState.body.id)}
          <Box
            sx={{
              width: "100%",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <Button
              type="button"
              data-testid="button-next"
              onClick={() => this.props.handleTab(0)}
              color="primary"
              variant="contained"
              sx={{
                textTransform: "none",
                fontSize: "1.3rem",
                padding: "6px 20px",
                color: "secondary.main", // "#ffce04", // yellow/gold
                "&:hover": {
                  backgroundColor: "primary.light" // "#531078" // medium purple
                }
              }}
            >
              <Trans i18nKey="next">Next</Trans>
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }
}

WelcomeInfoUnconnected.propTypes = {
  classes: PropTypes.object,
};

const mapStateToProps = state => ({
  appState: state.appState
});

export default connect(mapStateToProps)(WelcomeInfoUnconnected);
