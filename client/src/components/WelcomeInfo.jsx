import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import sanitizeHtml from "sanitize-html";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";

import * as apiContentActions from "../store/actions/apiContentActions";
import { defaultWelcomeInfo } from "../utils/index";
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
  card: {
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
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {
      headline: defaultWelcomeInfo.headline,
      body: defaultWelcomeInfo.body,
      image: null
    };
  }

  componentDidMount() {
    const values = queryString.parse(this.props.location.search);
    // if find contact id, call API to fetch contact info for prefill
    if (values.h || values.b || values.i) {
      const { h, i, b } = values;
      const queryIds = [h, i, b];
      queryIds.forEach(id => {
        this.props.apiContent
          .getContentById(id)
          .then(result => {
            if (!result || result.payload.message) {
              console.log(
                result.payload.message ||
                  "there was an error loading the content"
              );
            } else {
              switch (result.payload.content_type) {
                case "headline":
                  return this.setState({ headline: result.payload.content });
                case "bodyCopy":
                  return this.setState({ body: result.payload.content });
                case "image":
                  return this.setState({ image: result.payload.content });
                default:
                  break;
              }
            }
          })
          .catch(err => {
            // console.log(err);
          });
      });
    }
  }

  createMarkup = () => {
    return {
      __html: sanitizeHtml(this.state.body)
    };
  };

  render() {
    if (this.props.appState.loading) {
      return <div>loading...</div>;
    }
    return (
      <div className={this.classes.root} data-test="component-welcome-info">
        <Card className={this.classes.card}>
          <CardMedia
            className={this.classes.media}
            title="Welcome Photo"
            alt="Welcome Photo"
            image={this.state.image || SamplePhoto}
          />

          <Typography
            variant="h3"
            align="left"
            gutterBottom
            className={this.classes.headline}
            style={{ paddingTop: 20 }}
            data-test="headline"
          >
            {this.state.headline}
          </Typography>

          <Typography
            variant="body1"
            align="left"
            gutterBottom
            className={this.classes.body}
            data-test="body"
            dangerouslySetInnerHTML={this.createMarkup()}
          />
          <div className={this.classes.buttonWrap}>
            <Button
              type="button"
              onClick={() => this.props.handleTab(0)}
              color="primary"
              className={this.classes.next}
              variant="contained"
            >
              Next
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}

WelcomeInfoUnconnected.propTypes = {
  classes: PropTypes.object
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
