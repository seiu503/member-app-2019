import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";

import * as apiContentActions from "../store/actions/apiContentActions";
import { defaultWelcomeInfo } from "../utils/index";
import SamplePhoto from "../img/sample-form-photo.jpg";

const styles = theme => ({
  root: {
    margin: "40px 0",
    color: theme.palette.primary.main
  },
  body: {
    color: "black"
  },
  media: {
    height: "auto",
    paddingTop: "56.25%", // 16:9,
    position: "relative"
  },
  card: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 20
  }
});

class WelcomeInfo extends React.Component {
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {
      headline: defaultWelcomeInfo.headline,
      body: defaultWelcomeInfo.body,
      image: null
    };
  }

  getHeadline() {}

  componentDidMount() {
    const values = queryString.parse(this.props.location.search);
    // if find contact id, call API to fetch contact info for prefill
    if (values.headline) {
      const { headline } = values;
      this.props.apiContent
        .getContentById(headline)
        .then(result => {
          if (!result || result.payload.message) {
            console.log(
              result.payload.message ||
                "there was an error loading the headline"
            );
          } else {
            console.log(result);
            this.setState({ headline: result.payload.content });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    if (values.body) {
      const { body } = values;
      this.props.apiContent
        .getContentById(body)
        .then(result => {
          if (!result || result.payload.message) {
            console.log(
              result.payload.message || "there was an error loading the body"
            );
          } else {
            console.log(result);
            this.setState({ body: result.payload.content });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    if (values.image) {
      const { image } = values;
      this.props.apiContent
        .getContentById(image)
        .then(result => {
          if (!result || result.payload.message) {
            console.log(
              result.payload.message || "there was an error loading the body"
            );
          } else {
            console.log(result);
            this.setState({ image: result.payload.content });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

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
            align="center"
            gutterBottom
            className={this.classes.head}
            style={{ paddingTop: 20 }}
            data-test="headline"
          >
            {this.state.headline}
          </Typography>

          <Typography
            variant="body1"
            align="center"
            gutterBottom
            className={this.classes.body}
            data-test="body"
          >
            {this.state.body}
          </Typography>
        </Card>
      </div>
    );
  }
}

WelcomeInfo.propTypes = {
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
  )(WelcomeInfo)
);
