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

// const styles = theme => ({
//   root: {
//     flexGrow: 1,
//     width: "100vw",
//     color: "#2c0940" // dark purple // theme.palette.primary.main,
//   },
//   flex: {
//     flexGrow: 1
//   },
//   appBar: {
//     backgroundColor: "#2c0940", // dark purple // theme.palette.primary.main,
//     position: "fixed"
//   },
//   menuButton: {
//     display: "none",
//     [theme.breakpoints.down("sm")]: {
//       display: "block",
//       position: "absolute",
//       right: 20
//     }
//   },
//   menuWrap: {
//     [theme.breakpoints.down("sm")]: {
//       display: "none"
//     }
//   },
//   menuLink: {
//     color: "#ffce04", // yellow/gold // theme.palette.secondary.main,
//     textTransform: "capitalize",
//     fontSize: "1em"
//   },
//   title: {
//     flexGrow: 1,
//     color: "#ffffff", // white // theme.palette.secondary.light,
//     fontFamily: '"Source Sans Pro", sans-serif',
//     fontSize: "1.7em",
//     textDecoration: "none",
//     paddingLeft: 10,
//     fontWeight: 200,
//     [theme.breakpoints.down("md")]: {
//       fontSize: "1.1rem",
//       fontWeight: 400
//     },
//     [theme.breakpoints.down("xs")]: {
//       display: "none"
//     }
//   },
//   loginButton: {
//     textDecoration: "none"
//   },
//   avatar: {
//     marginRight: 20,
//     [theme.breakpoints.down("xs")]: {
//       display: "none"
//     }
//   },
//   admin: {
//     display: "flex"
//   },
//   skip: {
//     position: "absolute",
//     top: "-1000px",
//     left: "-1000px",
//     height: "1px",
//     width: "1px",
//     textAlign: "left",
//     overflow: "hidden",

//     "&:focus": {
//       position: "relative",
//       top: 0,
//       left: "-13px",
//       width: "auto",
//       height: "auto",
//       overflow: "visible",
//       textAlign: "center",
//       zIndex: "1000"
//     }
//   },
//   menuItem: {
//     padding: "24px 16px",
//     textAlign: "center",
//     textTransform: "capitalize",
//     fontFamily: [
//       '"Source Sans Pro"',
//       '"Helvetica Neue"',
//       "Helvetica",
//       "Arial",
//       "sans-serif"
//     ].join(","),
//     fontWeight: 400,
//     color: "#ffce04" // yellow/gold // theme.palette.secondary.main,
//   },
//   ListItemText: {
//     color: "#ffce04" // yellow/gold // theme.palette.secondary.main,
//   },
//   logo: {
//     height: 60,
//     width: "auto",
//     marginRight: 10,
//     [theme.breakpoints.down("sm")]: {
//       height: 40
//     }
//   },
//   drawer: {
//     boxShadow:
//       "inset 0px 2px 4px -1px rgba(0,0,0,.2), inset 0px -2px 4px -1px rgba(0,0,0,.2), inset 0px 4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px -4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px 1px 10px 0px rgba(0, 0, 0, 0.12), inset 0px -1px 10px 0px rgba(0, 0, 0, 0.12), -4px 0px 10px -2px rgba(0,0,0,.2)"
//   },
//   languagePicker: {
//     color: "white",
//     [theme.breakpoints.down("sm")]: {
//       position: "absolute",
//       top: 20,
//       right: 10
//     }
//   },
//   languagePickerLabel: {
//     color: "white",
//     marginTop: -14,
//     marginLeft: 25
//   },
//   languagePickerSelect: {
//     color: "white",
//     width: 195,
//     border: "1px solid white",
//     paddingLeft: "7px !important"
//   },
//   lpInput: {
//     // height: 30,
//   },
//   icon: {
//     display: "none"
//     // fill: 'white',
//   },
//   notched: {
//     borderColor: "transparent"
//     // borderRadius: 4,
//     // "&:hover": "white",
//     // "&:focused": "white",
//   },
//   labelShrink: {
//     color: "white"
//   },
//   labelFocused: {
//     color: "white !important",
//     marginTop: -8
//   },
//   adornedStart: {
//     paddingLeft: 10
//   }
// });

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
            color: "#ffce04" // yellow/gold // theme.palette.secondary.main,
            //className={classes.menuItem}
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
                color: "#ffce04", // yellow/gold // theme.palette.secondary.main,
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
      <div
        data-testid="component-navbar"
        sx={{
          flexGrow: 1,
          width: "100vw",
          color: "#2c0940" // dark purple // theme.palette.primary.main,
          // className={classes.root}
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "#2c0940", // dark purple // theme.palette.primary.main,
            position: "fixed"
            // className={classes.appBar}
          }}
        >
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
            <Link
              to="/"
              data-testid="logo-link"
              sx={
                {
                  // className={classes.logoLink}
                }
              }
            >
              <img
                src={logo}
                alt="SEIU 503"
                data-testid="logo-image"
                sx={{
                  height: "60px",
                  width: "auto",
                  marginRight: "10px",
                  height: {
                    xs: "40px",
                    sm: "40px"
                  }
                  // [theme.breakpoints.down("sm")]: {
                  //   height: "40px"
                  // }
                  // className={classes.logo}
                }}
              />
            </Link>
            <Typography
              variant="h6"
              color="inherit"
              data-testid="title"
              sx={{
                flexGrow: 1,
                color: "#ffffff", // white // theme.palette.secondary.light,
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: "1.7em",
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.1rem",
                  md: "1.1rem"
                },
                textDecoration: "none",
                paddingLeft: "10px",
                fontWeight: 200,
                fontWeight: {
                  xs: 400,
                  sm: 400,
                  md: 400
                },
                // [theme.breakpoints.down("md")]: {
                //   fontSize: "1.1rem",
                //   fontWeight: 400
                // },
                // [theme.breakpoints.down("xs")]: {
                //   display: "none"
                // }
                display: {
                  xs: "none"
                }
                // className={classes.title}
              }}
            >
              <Link
                to="/"
                sx={{
                  flexGrow: 1,
                  color: "#ffffff", // white // theme.palette.secondary.light,
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: "1.7em",
                  fontSize: {
                    xs: "1.1rem",
                    sm: "1.1rem",
                    md: "1.1rem"
                  },
                  textDecoration: "none",
                  paddingLeft: "10px",
                  fontWeight: 200,
                  fontWeight: {
                    xs: 400,
                    sm: 400,
                    md: 400
                  },
                  // [theme.breakpoints.down("md")]: {
                  //   fontSize: "1.1rem",
                  //   fontWeight: 400
                  // },
                  // [theme.breakpoints.down("xs")]: {
                  //   display: "none"
                  // }
                  display: {
                    xs: "none"
                  }
                  // className={classes.title}
                }}
              >
                <Translate id={values.cape ? "capeBanner" : "siteBanner"}>
                  {values.cape ? "SEIU 503 CAPE" : "Membership Application"}
                </Translate>
              </Link>
            </Typography>
            <LanguagePicker
              id="languagePicker"
              ref={this.props.language_picker}
              classes={{
                labelShrink: {
                  color: "white"
                },
                labelFocused: {
                  color: "white !important",
                  marginTop: -8
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
                    display: "none",
                    [theme.breakpoints.down("sm")]: {
                      display: "block",
                      position: "absolute",
                      right: 20
                      // className={classes.menuButton}
                    }
                  }}
                >
                  <MenuOutlined />
                </IconButton>
                <Menu
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
                  sx={{
                    boxShadow:
                      "inset 0px 2px 4px -1px rgba(0,0,0,.2), inset 0px -2px 4px -1px rgba(0,0,0,.2), inset 0px 4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px -4px 5px 0px rgba(0, 0, 0, 0.14), inset 0px 1px 10px 0px rgba(0, 0, 0, 0.12), inset 0px -1px 10px 0px rgba(0, 0, 0, 0.12), -4px 0px 10px -2px rgba(0,0,0,.2)"
                    // className="drawer"
                  }}
                >
                  {mobileLinks}
                </Menu>
                <nav
                  sx={{
                    [theme.breakpoints.down("sm")]: {
                      display: "none"
                    }
                    // className={classes.menuWrap}
                  }}
                >
                  {adminMenuLinks}
                </nav>
              </React.Fragment>
            )}
          </Toolbar>
        </AppBar>
      </div>
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

// export default withRouter(withStyles(styles)(connect(mapStateToProps)(NavBar)));
export default withRouter(connect(mapStateToProps)(NavBar));
