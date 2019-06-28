import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";

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

class WelcomeFormComponent extends React.Component {
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className={this.classes.root} data-test="component-welcomeInfo">
        <Card className={this.classes.card}>
          <CardMedia
            className={this.classes.media}
            title="Purple lights"
            image={SamplePhoto}
          />

          <Typography
            variant="h3"
            align="center"
            gutterBottom
            className={this.classes.head}
            style={{ paddingTop: 20 }}
            data-test="headline"
          >
            Sample Headline
          </Typography>

          <Typography
            variant="body1"
            align="center"
            gutterBottom
            className={this.classes.body}
            data-test="body"
          >
            By joining together in union, SEIU 503 members have won incredible
            victories—including increasing our pay and benefits and improving
            our workplace conditions. In states where more public employees
            remain members of the union, salaries are higher for all employees
            because the union has the power to negotiate from a position of
            strength. <br />
            <br />
            We have strength in numbers. Please complete the following form to
            join tens of thousands of public service workers and care providers
            who make Oregon a great place to work and live. By doing so, you
            will commit to maintaining your membership for one year, or paying a
            non-member fee equivalent. Dues are 1.7% of your salary +
            $2.75/month. Your full name, network address, and a timestamp of
            your submission will serve as your signature.
          </Typography>
        </Card>
      </div>
    );
  }
}

WelcomeFormComponent.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles)(WelcomeFormComponent);
