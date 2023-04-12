import React from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import { Translate } from "react-localize-redux";

// import { withStyles } from "@mui/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Slide,
  Box
} from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";

import { skip } from "../utils";
import { LanguagePicker } from "../components/SubmissionFormElements";
import logo from "../img/seiu503_white.svg";

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
          // button
          component={Button}
          href={`/${link}`}
          onClick={() => {
            this.props.history.push(`/${link}`);
            handleClose();
          }}
          sx={{
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
            color: "secondary.main" // "#ffce04" // yellow/gold
          }}
          data-testid="menu-item-mobile"
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
      <div data-testid="mobile-links">
        {adminLinks.map((link, index) => {
          return (
            <ListItemLink
              key={index}
              primary={link}
              handleClose={this.handleClose}
              link={link}
              data-testid="mobile-link"
            />
          );
        })}
      </div>
    );
    const adminMenuLinks = (
      <div data-testid="admin-menu-links">
        {adminLinks.map((link, index) => {
          return (
            <Button
              key={index}
              sx={{
                color: "secondary.main", // "#ffce04", // yellow/gold
                textTransform: "capitalize",
                fontSize: "1em"
                // className={classes.menuLink}
              }}
              href={`/${link}`}
            >
              {link}
            </Button>
          );
        })}
      </div>
    );
    return (
      <Box
        data-testid="component-navbar"
        sx={{
          flexGrow: 1,
          width: "100vw",
          color: "primary.main" // "#2c0940" // dark purple
          // className={classes.root}
        }}
      >
        <Box
          sx={{
            backgroundColor: "primary.main", // "#2c0940", // dark purple
            position: "fixed",
            zIndex: 1100
            // className={classes.appBar}
          }}
        >
          <AppBar position="fixed">
            <Toolbar>
              <Box
                sx={{
                  position: "absolute",
                  top: "-1000px",
                  left: "-1000px",
                  height: "1px",
                  width: "1px",
                  textAlign: "left",
                  overflow: "hidden"

                  // "&:focus": {
                  //   position: "relative",
                  //   top: 0,
                  //   left: "-13px",
                  //   width: "auto",
                  //   height: "auto",
                  //   overflow: "visible",
                  //   textAlign: "center",
                  //   zIndex: "1000"
                  // },
                  // className={classes.skip}
                }}
              >
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.skipToMain}
                  data-testid="skiplink-button"
                >
                  <Translate id="skipLink" data-testid="skiplink">
                    Skip to content &rsaquo;
                  </Translate>
                </Button>
              </Box>
              <Box
                sx={
                  {
                    // className={classes.logoLink}
                  }
                }
              >
                <Link to="/" data-testid="logo-link">
                  <Box
                    component="img"
                    src={logo}
                    alt="SEIU 503"
                    data-testid="logo-image"
                    sx={{
                      height: "60px",
                      width: "auto",
                      marginRight: "10px",
                      height: {
                        xs: "40px",
                        md: "60px"
                      }
                    }}
                  />
                </Link>
              </Box>
              <Typography
                variant="h6"
                color="inherit"
                data-testid="title"
                style={{ flexGrow: 1 }}
              >
                <Box
                  component={Link}
                  to="/"
                  sx={{
                    flexGrow: 1,
                    color: "secondary.light", // "#ffffff", // white
                    fontFamily: '"Source Sans Pro", sans-serif',
                    fontSize: {
                      xs: "1.1em",
                      sm: "1.1em",
                      md: "2em"
                    },
                    textDecoration: "none",
                    paddingLeft: "10px",
                    fontWeight: 200,
                    fontWeight: {
                      xs: 400,
                      sm: 400,
                      md: 400
                    },
                    display: {
                      xs: "none",
                      sm: "block"
                    }
                  }}
                >
                  <Translate id={values.cape ? "capeBanner" : "siteBanner"}>
                    {values.cape ? "SEIU 503 CAPE" : "Membership Application"}
                  </Translate>
                </Box>
              </Typography>
              <LanguagePicker
                id="languagePicker"
                ref={this.props.language_picker}
                classes={{
                  labelShrink: {
                    color: "white !important",
                    background: "#2c0940 !important"
                  },
                  labelFocused: {
                    color: "white !important",
                    background: "#2c0940 !important",
                    marginTop: -8
                  },
                  labelOutlined: {
                    color: "white !important"
                  }
                }}
                name="languagePicker"
                label="Select Language"
                userSelectedLanguage={this.props.userSelectedLanguage}
                style={{ width: 200 }}
                // labelWidth={200}
                onChange={this.props.updateLanguage}
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
                    color="secondary"
                    aria-label="Menu"
                    aria-owns={anchorEl ? "nav-menu" : null}
                    aria-haspopup="true"
                    onClick={e => this.handleClick(e)}
                    data-testid="menu-button"
                    sx={{
                      display: {
                        xs: "block",
                        md: "none"
                      },
                      position: {
                        xs: "absolute",
                        md: "static"
                      },
                      right: {
                        xs: 20,
                        md: 0
                      }
                    }}
                  >
                    <MenuOutlined />
                  </IconButton>
                  <Menu
                    element={Menu}
                    id="nav-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    component="nav"
                    elevation={0}
                    anchorOrigin={{ horizontal: "right", vertical: "top" }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    TransitionComponent={Slide}
                    TransitionProps={{ direction: "left" }}
                    PaperProps={{ className: classes.drawer }}
                    data-testid="menu"
                    style={{
                      boxShadow:
                        "inset 0px 2px 4px -1px rgba(0,0,0,.2), inset 0px -2px 4px -1px rgba(0,0,0,.2), inset 0px 4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px -4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px 1px 10px 0px rgba(0, 0, 0, 0.12), inset 0px -1px 10px 0px rgba(0, 0, 0, 0.12), -4px 0px 10px -2px rgba(0,0,0,.2)"
                      // className="drawer"
                    }}
                  >
                    {mobileLinks}
                  </Menu>
                  <Box
                    element="nav"
                    sx={{
                      display: {
                        xs: "none",
                        md: "block"
                      }
                    }}
                  >
                    {adminMenuLinks}
                  </Box>
                </React.Fragment>
              )}
            </Toolbar>
          </AppBar>
        </Box>
      </Box>
    );
  }
}

NavBar.propTypes = {
  // classes: PropTypes.object.isRequired,
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

export default withRouter(connect(mapStateToProps)(NavBar));
