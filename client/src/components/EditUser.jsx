// import React from "react";
// import PropTypes from "prop-types";
// import { connect } from "react-redux";
// import { bindActionCreators } from "redux";

// import { TextField, Typography } from "@mui/material";
// import { withStyles } from "@mui/styles";

// import * as apiUserActions from "../store/actions/apiUserActions";

// import ButtonWithSpinner from "../components/ButtonWithSpinner";
// import AlertDialog from "../components/AlertDialog";
// import * as formElements from "../components/SubmissionFormElements";

// const styles = theme => ({
//   root: {},
//   container: {
//     padding: "10px 0 140px 0",
//     background: "white"
//   },
//   head: {
//     color: theme.palette.primary.light,
//     fontSize: "2.5em",
//     marginBottom: "1em"
//   },
//   form: {
//     maxWidth: 600,
//     margin: "auto"
//   },
//   group: {
//     display: "flex",
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "center"
//   },
//   input: {
//     width: "100%",
//     margin: "0 0 20px 0"
//   },
//   textarea: {
//     width: "100%",
//     margin: "0 0 20px 0"
//   },
//   formButton: {
//     width: "100%",
//     padding: 20
//   },
//   buttonDelete: {
//     width: "100%",
//     padding: 20,
//     marginTop: "20px",
//     backgroundColor: theme.palette.danger.main,
//     "&:hover": {
//       backgroundColor: theme.palette.danger.light
//     }
//   },
//   formControl: {
//     width: "100%"
//   },
//   radioLabel: {
//     width: "100%",
//     textAlign: "center"
//   }
// });

// export class EditUserFormUnconnected extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       edit: false
//     };
//     this.submit = this.submit.bind(this);
//   }

//   findUserByEmail = async e => {
//     e.preventDefault();
//     const { existingUserEmail } = this.props.user.form;
//     const requestingUserType = this.props.appState.userType;
//     await this.props.apiUser
//       .getUserByEmail(existingUserEmail, requestingUserType)
//       .then(result => {
//         // console.log(result);
//         if (result.payload && result.payload.message) {
//           // console.log(result.payload);
//           return formElements.handleError(
//             result.payload.message ||
//               "An error occurred while trying to find user"
//           );
//         }
//       })
//       .catch(err => {
//         console.error(err);
//         return formElements.handleError(err);
//       });
//   };

//   submit(e) {
//     e.preventDefault();
//     const { fullName, email, type } = this.props.user.form;
//     const authToken = this.props.appState.authToken;
//     const requestingUserType = this.props.appState.userType;
//     let id = this.props.user.currentUser.id;
//     const body = {
//       updates: {
//         fullName,
//         email,
//         type
//       },
//       requestingUserType
//     };
//     return this.props.apiUser
//       .updateUser(authToken, id, body)
//       .then(result => {
//         if (result.type === "UPDATE_USER_FAILURE" || this.props.user.error) {
//           console.error(this.props.user.error);
//           return formElements.handleError(
//             this.props.user.error ||
//               "An error occurred while trying to update user"
//           );
//         } else {
//           this.props.apiUser.clearForm();
//           this.props.history.push("/admin");
//         }
//       })
//       .catch(err => {
//         console.error(err);
//         return formElements.handleError(err);
//       });
//   }

//   handleDeleteDialogOpen = () => {
//     if (this.props.user.currentUser && this.props.appState.loggedIn) {
//       this.props.apiUser.handleDeleteOpen(this.props.user.currentUser);
//     }
//   };

//   dialogAction = () => {
//     this.deleteUser(this.props.user.currentUser);
//     this.props.apiUser.handleDeleteClose().catch(err => console.log(err));
//   };

//   async deleteUser(user) {
//     const token = this.props.appState.authToken;
//     const requestingUserType = this.props.appState.userType;
//     this.props.apiUser
//       .deleteUser(token, user.id, requestingUserType)
//       .then(result => {
//         if (!result || result.type !== "DELETE_USER_SUCCESS") {
//           console.log(this.props.user.err);
//           return formElements.handleError(this.props.user.err);
//         } else {
//           this.props.history.push(`/admin`);
//         }
//       })
//       .catch(err => {
//         console.log(err.message);
//         return formElements.handleError(err.message);
//       });
//   }

//   render() {
//     const { classes } = this.props;
//     return (
//       <div data-testid="component-edit-user" className={classes.root}>
//         {this.props.user.deleteDialogOpen && (
//           <AlertDialog
//             open={this.props.user.deleteDialogOpen}
//             handleClose={this.props.apiUser.handleDeleteClose}
//             title="Delete User"
//             content={`Are you sure you want to delete ${this.props.user.currentUser.name}? This action cannot be undone and all user data will be lost.`}
//             danger={true}
//             action={this.dialogAction}
//             buttonText="Delete"
//             data-testid="alert-dialog"
//           />
//         )}
//         {this.props.user.currentUser.id && (
//           <div data-testid="component-edit-user-form">
//             <Typography
//               variant="h2"
//               align="center"
//               gutterBottom
//               className={classes.head}
//               style={{ paddingTop: 20 }}
//             >
//               Edit a User
//             </Typography>
//             <form
//               onSubmit={this.submit}
//               className={classes.form}
//               id="edit-user-form"
//             >
//               <TextField
//                 data-testid="fullName"
//                 name="fullName"
//                 id="fullName"
//                 label="Name"
//                 type="text"
//                 variant="outlined"
//                 required
//                 value={this.props.user.form.name}
//                 onChange={this.props.apiUser.handleInput}
//                 className={classes.input}
//               />
//               <TextField
//                 data-testid="email"
//                 name="email"
//                 id="email"
//                 label="Email"
//                 type="text"
//                 variant="outlined"
//                 required
//                 value={this.props.user.form.email}
//                 onChange={this.props.apiUser.handleInput}
//                 className={classes.input}
//               />
//               <TextField
//                 data-testid="type"
//                 name="type"
//                 id="type"
//                 label="User Type"
//                 type="text"
//                 variant="outlined"
//                 required
//                 value={this.props.user.form.type}
//                 onChange={this.props.apiUser.handleInput}
//                 className={classes.input}
//               />
//               <ButtonWithSpinner
//                 type="submit"
//                 color="secondary"
//                 className={classes.formButton}
//                 variant="contained"
//                 loading={this.props.user.loading}
//               >
//                 Submit
//               </ButtonWithSpinner>
//               <ButtonWithSpinner
//                 onClick={this.handleDeleteDialogOpen}
//                 color="primary"
//                 aria-label="Delete Content"
//                 data-testid="delete"
//                 className={classes.buttonDelete}
//                 variant="contained"
//                 loading={this.props.user.loading}
//               >
//                 Delete User
//               </ButtonWithSpinner>
//             </form>
//           </div>
//         )}
//         {!this.props.user.currentUser.id && (
//           <div data-testid="component-edit-user-find">
//             <Typography
//               variant="h2"
//               align="center"
//               gutterBottom
//               className={classes.head}
//               style={{ paddingTop: 20 }}
//             >
//               Find User to Edit
//             </Typography>
//             <form
//               onSubmit={this.findUserByEmail}
//               className={classes.form}
//               id="form"
//               data-testid="user-find-form"
//             >
//               <TextField
//                 data-testid="existingUserEmail"
//                 name="existingUserEmail"
//                 id="existingUserEmail"
//                 label="existingUserEmail"
//                 type="text"
//                 variant="outlined"
//                 required
//                 value={this.props.user.form.existingUserEmail}
//                 onChange={this.props.apiUser.handleInput}
//                 className={classes.input}
//               />
//               <ButtonWithSpinner
//                 type="submit"
//                 color="secondary"
//                 className={classes.formButton}
//                 variant="contained"
//                 loading={this.props.user.loading}
//               >
//                 Look Up
//               </ButtonWithSpinner>
//             </form>
//           </div>
//         )}
//       </div>
//     );
//   }
// }

// EditUserFormUnconnected.propTypes = {
//   user: PropTypes.shape({
//     form: PropTypes.shape({
//       firstName: PropTypes.string,
//       lastName: PropTypes.string,
//       email: PropTypes.string,
//       userType: PropTypes.string
//     }),
//     loading: PropTypes.bool
//   }).isRequired,
//   apiUser: PropTypes.shape({
//     handleInput: PropTypes.func,
//     clearForm: PropTypes.func,
//     getUserByEmail: PropTypes.func,
//     updateUser: PropTypes.func,
//     handleDeleteOpen: PropTypes.func,
//     deleteUser: PropTypes.func,
//     handleDeleteClose: PropTypes.func
//   }),
//   appState: PropTypes.shape({
//     authToken: PropTypes.string,
//     userType: PropTypes.string,
//     loggedIn: PropTypes.bool
//   }),
//   classes: PropTypes.object
// };

// const mapStateToProps = state => ({
//   user: state.user,
//   appState: state.appState
// });

// const mapDispatchToProps = dispatch => ({
//   apiUser: bindActionCreators(apiUserActions, dispatch)
// });

// export const EditUserFormConnected = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(EditUserFormUnconnected);

// export default withStyles(styles)(EditUserFormConnected);
