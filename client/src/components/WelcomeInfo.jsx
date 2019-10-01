import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// import sanitizeHtml from "sanitize-html";
import { Translate } from "react-localize-redux";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";

import * as apiContentActions from "../store/actions/apiContentActions";
import { defaultWelcomeInfo } from "../utils/index";
import welcomeInfo from "../translations/welcomeInfo.json";
import SamplePhoto from "../img/sample-form-photo.jpg";
import Spinner from "../components/Spinner";

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
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {
      headline: {
        text: defaultWelcomeInfo.headline,
        id: 0
      },
      body: {
        text: defaultWelcomeInfo.body,
        id: 0
      },
      image: null
    };
  }

  componentDidMount() {
    const values = queryString.parse(this.props.location.search);
    // if find contact id, call API to fetch contact info for prefill
    if (values.h || values.b || values.i) {
      const { h, i, b } = values;
      let idArray = [h, i, b];
      const queryIds = idArray.filter(id => (id ? id : null));
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
                  return this.setState({
                    headline: {
                      text: result.payload.content,
                      id: id
                    }
                  });
                case "bodyCopy":
                  return this.setState({
                    body: {
                      text: result.payload.content,
                      id: id
                    }
                  });
                case "image":
                  return this.setState({
                    image: {
                      text: result.payload.content,
                      id: id
                    }
                  });
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

  renderBodyCopy = id => {
    // sample spanish translations in bodyCopy0_xx and headline0 keys
    // (in /translations/welcomeInfo.json) are for testing only and
    // should be replaced with better translations when we get them
    let paragraphIds = [];
    // find all paragraphs belonging to this bodyCopy id
    Object.keys(welcomeInfo).forEach(key => {
      if (key.includes(`bodyCopy${id}`)) {
        paragraphIds.push(key);
      }
    });
    // for each paragraph selected, generate translated text
    // in appropriate language rendered inside a <p> tag
    const paragraphs = (
      <React.Fragment>
        {paragraphIds.map((id, index) => (
          <p key={id}>
            <Translate id={id} />
          </p>
        ))}
      </React.Fragment>
    );
    // wrap in MUI typography element and return
    return (
      <Typography
        variant="body1"
        component="div"
        align="left"
        gutterBottom
        className={this.classes.body}
        data-test="body"
      >
        {paragraphs}
      </Typography>
    );
  };

  render() {
    return (
      <div className={this.classes.root} data-test="component-welcome-info">
        {this.props.appState.loading && <Spinner />}
        <Card className={this.classes.welcomeCard}>
          <CardMedia
            className={this.classes.media}
            title="Welcome Photo"
            alt="Welcome Photo"
            image={this.state.image ? this.state.image.text : SamplePhoto}
          />

          <Typography
            variant="h3"
            align="left"
            gutterBottom
            className={this.classes.headline}
            style={{ paddingTop: 20 }}
            data-test="headline"
          >
            <Translate id={`headline${this.state.headline.id}`} />
          </Typography>
          {this.renderBodyCopy(this.state.body.id)}
          <div className={this.classes.buttonWrap}>
            <Button
              type="button"
              onClick={() => this.props.handleTab(0)}
              color="primary"
              className={this.classes.next}
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
