import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-localize-redux";

import { Typography, CardMedia, Card, Button, Box } from "@mui/material";
import { withStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";

import * as apiContentActions from "../store/actions/apiContentActions";

import SamplePhoto from "../img/sample-form-photo.jpg";

import { theme } from "../styles/theme";

const styles = theme => ({
  root: {
    [theme.breakpoints.up("lg")]: {
      margin: 0
    },
    margin: "40px 0 0 0",
    color: theme.palette.primary.main,
    [theme.breakpoints.only("xs")]: {
      margin: 0
    }
  },
  body: {
    color: "black"
  },
  headline: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.7rem"
    }
  },
  media: {
    height: "auto",
    paddingTop: "56.25%", // 16:9,
    position: "relative",
    [theme.breakpoints.up("md")]: {
      display: "none"
    },
    [theme.breakpoints.only("xs")]: {
      margin: "-24px -20px 0 -20px"
    }
  },
  welcomeCard: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 20
  },
  buttonWrap: {
    width: "100%",
    paddingRight: 20,
    display: "flex",
    justifyContent: "flex-end"
  },
  next: {
    textTransform: "none",
    fontSize: "1.3rem",
    padding: "6px 20px",
    color: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.light
    }
  },
  testWarning: {
    padding: 20,
    backgroundColor: "#d32f2f" // theme.palette.danger.light
  }
});

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
          //   [theme.breakpoints.up("lg")]: {
          //   margin: 0
          // },
          margin: {
            xs: 0,
            sm: "40px 0 0 0",
            lg: 0
          },
          color: theme.palette.primary.main
          // [theme.breakpoints.only("xs")]: {
          //   margin: 0
          // }
          // className={classes.root}
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
            margin: "0 auto",
            padding: 20
            // // className={classes.welcomeCard}
          }}
        >
          <Card>
            {imageUrl && !this.props.embed && (
              <Box
                sx={{
                  height: "auto",
                  paddingTop: "56.25%", // 16:9,
                  position: "relative",
                  display: {
                    md: "none"
                  },
                  // [theme.breakpoints.up("md")]: {
                  //     display: "none"
                  //   },
                  margin: {
                    xs: "-24px -20px 0 -20px",
                    sm: "inherit",
                    md: "inherit",
                    lg: "inherit",
                    xl: "inherit"
                  }
                  // [theme.breakpoints.only("xs")]: {
                  //     margin: "-24px -20px 0 -20px"
                  //   }
                }}
                // className={classes.media}
              >
                <CardMedia
                  title="Welcome Photo"
                  alt="Welcome Photo"
                  image={imageUrl}
                />
              </Box>
            )}

            {process.env.REACT_APP_ENV_TEXT !== "production" && (
              <Box
                sx={{
                  padding: 20,
                  backgroundColor: "#d32f2f" // theme.palette.danger.light SUB FOR // className={classes.testWarning}>
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
                    through this form will not be processed. If you landed on
                    the test page by mistake and want to become a member of SEIU
                    Local 503, please click here:&nbsp;
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
            {this.props.renderHeadline(this.props.headline.id)}
            {this.props.renderBodyCopy(this.props.body.id)}
            <Box
              sx={{
                width: "100%",
                paddingRight: 20,
                display: "flex",
                justifyContent: "flex-end"
                // className={classes.buttonWrap}
              }}
            >
              <Button
                type="button"
                onClick={() => this.props.handleTab(0)}
                color="primary"
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontSize: "1.3rem",
                  padding: "6px 20px",
                  color: theme.palette.secondary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.light
                  }
                  // className={classes.next}
                }}
              >
                <Translate id="next">Next</Translate>
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }
}

WelcomeInfoUnconnected.propTypes = {
  classes: PropTypes.object,
  headline: PropTypes.object,
  body: PropTypes.object,
  image: PropTypes.object
};

const mapStateToProps = state => ({
  appState: state.appState
});

const mapDispatchToProps = dispatch => ({
  apiContent: bindActionCreators(apiContentActions, dispatch)
});

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(WelcomeInfoUnconnected)
);
