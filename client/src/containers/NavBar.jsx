import React from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import { Translate } from "react-localize-redux";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import Slide from "@material-ui/core/Slide";

import { skip } from "../utils";
import { LanguagePicker } from "../components/SubmissionFormElements";
import logo from "../img/seiu503_white.svg";

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100vw",
    color: theme.palette.primary.main
  },
  flex: {
    flexGrow: 1
  },
  appBar: {
    backgroundColor: theme.palette.primary.main,
    position: "fixed"
  },
  menuButton: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "block",
      position: "absolute",
      right: 20
    }
  },
  menuWrap: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
  menuLink: {
    color: theme.palette.secondary.main,
    textTransform: "capitalize",
    fontSize: "1em"
  },
  title: {
    flexGrow: 1,
    color: theme.palette.secondary.light,
    fontFamily: '"Source Sans Pro", sans-serif',
    fontSize: "1.7em",
    textDecoration: "none",
    paddingLeft: 10,
    fontWeight: 200,
    [theme.breakpoints.down("md")]: {
      fontSize: "1.1rem",
      fontWeight: 400
    },
    [theme.breakpoints.down("xs")]: {
      display: "none"
    }
  },
  loginButton: {
    textDecoration: "none"
  },
  avatar: {
    marginRight: 20,
    [theme.breakpoints.down("xs")]: {
      display: "none"
    }
  },
  admin: {
    display: "flex"
  },
  skip: {
    position: "absolute",
    top: "-1000px",
    left: "-1000px",
    height: "1px",
    width: "1px",
    textAlign: "left",
    overflow: "hidden",

    "&:focus": {
      position: "relative",
      top: 0,
      left: "-13px",
      width: "auto",
      height: "auto",
      overflow: "visible",
      textAlign: "center",
      zIndex: "1000"
    }
  },
  menuItem: {
    padding: "24px 16px",
    textAlign: "center",
    textTransform: "capitalize",
    fontFamily: [
      '"Source Sans Pro"',
      '"Helvetica Neue"',
      "Helvetica",
      "Arial",
      "sans-serif"
    ].join(","),
    fontWeight: 400,
    color: theme.palette.secondary.main
  },
  ListItemText: {
    color: theme.palette.secondary.main
  },
  logo: {
    height: 60,
    width: "auto",
    marginRight: 10,
    [theme.breakpoints.down("sm")]: {
      height: 40
    }
  },
  drawer: {
    boxShadow:
      "inset 0px 2px 4px -1px rgba(0,0,0,.2), inset 0px -2px 4px -1px rgba(0,0,0,.2), inset 0px 4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px -4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px 1px 10px 0px rgba(0, 0, 0, 0.12), inset 0px -1px 10px 0px rgba(0, 0, 0, 0.12), -4px 0px 10px -2px rgba(0,0,0,.2)"
  },
  languagePicker: {
    color: "white"
    // height: 30
  },
  languagePickerLabel: {
    color: "white",
    marginTop: -14,
    marginLeft: 25
  },
  languagePickerSelect: {
    color: "white",
    width: 170,
    border: "1px solid white",
    paddingLeft: "7px !important"
  },
  lpInput: {
    // height: 30,
  },
  icon: {
    display: "none"
    // fill: 'white',
  },
  notched: {
    borderColor: "transparent"
    // borderRadius: 4,
    // "&:hover": "white",
    // "&:focused": "white",
  },
  labelShrink: {
    color: "white"
  },
  labelFocused: {
    color: "white !important",
    marginTop: -8
  },
  adornedStart: {
    paddingLeft: 10
  }
});

export class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(e) {
    this.setState({ anchorEl: e.currentTarget });
    this.props.main_ref.current.classList.add("is-blurred");
  }

  handleClose() {
    this.setState({ anchorEl: null });
    this.props.main_ref.current.classList.remove("is-blurred");
  }

  skipToMain() {
    return skip("main");
  }

  render() {
    const values = queryString.parse(this.props.location.search);
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const { loggedIn } = this.props.appState;
    const adminLinks = ["users", "content", "logout"];
    const ListItemLink = props => {
      const { primary, handleClose, link } = props;
      return (
        <MenuItem
          button
          component={Button}
          href={`/${link}`}
          onClick={() => {
            this.props.history.push(`/${link}`);
            handleClose();
          }}
          className={classes.menuItem}
          data-test="menu-item-mobile"
        >
          <ListItemText
            primary={primary}
            primaryTypographyProps={{
              color: "secondary"
            }}
          />
        </MenuItem>
      );
    };
    const mobileLinks = (
      <div data-test="mobile-links">
        {adminLinks.map((link, index) => {
          return (
            <ListItemLink
              key={index}
              primary={link}
              handleClose={this.handleClose}
              link={link}
              data-test="mobile-link"
            />
          );
        })}
      </div>
    );
    const adminMenuLinks = (
      <div data-test="admin-menu-links">
        {adminLinks.map((link, index) => {
          return (
            <Button key={index} className={classes.menuLink} href={`/${link}`}>
              {link}
            </Button>
          );
        })}
      </div>
    );
    return (
      <div className={classes.root} data-test="component-navbar">
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Button
              color="primary"
              variant="contained"
              className={classes.skip}
              onClick={this.skipToMain}
              data-test="skiplink-button"
            >
              <Translate id="skipLink" data-test="skiplink">
                Skip to content &rsaquo;
              </Translate>
            </Button>
            <Link to="/" className={classes.logoLink} data-test="logo-link">
              <img
                src={logo}
                alt="SEIU 503"
                className={classes.logo}
                data-test="logo-image"
              />
            </Link>
            <Typography
              variant="h6"
              color="inherit"
              className={classes.title}
              data-test="title"
            >
              <Link to="/" className={classes.title}>
                <Translate id={values.cape ? "capeBanner" : "siteBanner"}>
                  {values.cape ? "SEIU 503 CAPE" : "Membership Application"}
                </Translate>
              </Link>
            </Typography>
            <LanguagePicker
              id="languagePicker"
              ref={this.props.language_picker}
              classes={classes}
              name="languagePicker"
              label="Select Language"
              labelWidth={200}
              options={[
                "",
                "English",
                "Español",
                "Русский",
                "Tiếng Việt",
                "简体中文"
              ]}
            />
            {loggedIn && (
              <React.Fragment>
                <IconButton
                  className={classes.menuButton}
                  color="secondary"
                  aria-label="Menu"
                  aria-owns={anchorEl ? "nav-menu" : null}
                  aria-haspopup="true"
                  onClick={e => this.handleClick(e)}
                  data-test="menu-button"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="nav-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.handleClose}
                  component="nav"
                  className="drawer"
                  elevation={0}
                  anchorOrigin={{ horizontal: "right", vertical: "top" }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  TransitionComponent={Slide}
                  TransitionProps={{ direction: "left" }}
                  PaperProps={{ className: classes.drawer }}
                  data-test="menu"
                >
                  {mobileLinks}
                </Menu>
                <nav className={classes.menuWrap}>{adminMenuLinks}</nav>
              </React.Fragment>
            )}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool
  }),
  profile: PropTypes.shape({
    profile: PropTypes.shape({
      name: PropTypes.string,
      avatar_url: PropTypes.string
    })
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  history: PropTypes.shape({
    push: PropTypes.func
  })
};

const mapStateToProps = state => ({
  appState: state.appState,
  profile: state.profile
});

export default withRouter(withStyles(styles)(connect(mapStateToProps)(NavBar)));
