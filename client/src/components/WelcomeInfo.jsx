import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-localize-redux";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";

import * as apiContentActions from "../store/actions/apiContentActions";

import SamplePhoto from "../img/sample-form-photo.jpg";

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
  }
});

export class WelcomeInfoUnconnected extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root} data-test="component-welcome-info">
        <Card className={classes.welcomeCard}>
          <CardMedia
            className={classes.media}
            title="Welcome Photo"
            alt="Welcome Photo"
            image={this.props.image ? this.props.image.url : SamplePhoto}
          />

          <Typography
            variant="h3"
            align="left"
            gutterBottom
            className={classes.headline}
            style={{ paddingTop: 20 }}
            data-test="headline"
          >
            <Translate id={`headline${this.props.headline.id}`}>
              SEIU 503 Membership signup and Recommit form
            </Translate>
          </Typography>
          {this.props.renderBodyCopy(this.props.body.id)}
          <div className={classes.buttonWrap}>
            <Button
              type="button"
              onClick={() => this.props.handleTab(0)}
              color="primary"
              className={classes.next}
              variant="contained"
            >
              <Translate id="next">Next</Translate>
            </Button>
          </div>
        </Card>
      </div>
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
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WelcomeInfoUnconnected)
);
