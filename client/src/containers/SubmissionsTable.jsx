// NEED TO UPDATE THIS WHOLE COMPONENT TO USE REACT-TABLE INSTEAD OF MATERIAL-TABLE

// import React from "react";
// import PropTypes from "prop-types";
// import MaterialTable from "material-table";
// import { connect } from "react-redux";
// import { bindActionCreators } from "redux";
// import { withRouter } from "react-router-dom";
// import { withStyles } from "@mui/styles";

// import { Typography } from "@mui/material";
// import BackupIcon from '@mui/icons-material/Backup';

// import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";

// import AlertDialog from "../components/AlertDialog";
// import {
//   tableIcons,
//   submTableFieldList
// } from "../components/SubmissionFormElements";
// import { openSnackbar } from "./Notifier";

// const BASE_URL = process.env.REACT_APP_BASE_URL;

// const styles = theme => ({
//   root: {
//     margin: "0 auto",
//     width: "100%",
//     maxWidth: 1920,
//     paddingBottom: 60,
//     background: "white",
//     minHeight: "100vh"
//   },
//   section: {
//     padding: "60px 0 0 0"
//   },
//   head: {
//     color: theme.palette.primary.main
//   },
//   gridWrapper: {
//     margin: "0 auto",
//     display: "flex",
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     padding: "50px 0",
//     [theme.breakpoints.down("sm")]: {
//       padding: "10px 0px"
//     }
//   }
// });
// const loginLinkStr = "click here to login";
// const loginLink = loginLinkStr.link(`${BASE_URL}/api/auth/google`);
// const warning = `You do not have access to the page you were trying to reach. Please ${loginLink} or contact an admin to request access.`;

// export class SubmissionsTableUnconnected extends React.Component {
//   async componentDidMount() {
//     const { authToken } = this.props.appState;
//     const { userType } = this.props.appState;
//     if (userType && authToken) {
//       this.props.apiSubmission
//         .getAllSubmissions(authToken, userType)
//         .then(result => {
//           console.log(result.payload);
//           if (
//             result.type === "GET_ALL_SUBMISSIONS_FAILURE" ||
//             this.props.submission.error
//           ) {
//             openSnackbar(
//               "error",
//               this.props.submission.error ||
//                 "An error occurred while fetching submissions"
//             );
//           }
//         })
//         .catch(err => {
//           openSnackbar("error", err);
//         });
//     }
//   }

//   async componentDidUpdate(prevProps) {
//     if (
//       ((!prevProps.appState.authToken || !prevProps.appState.userType) &&
//         this.props.appState.authToken &&
//         this.props.appState.userType) ||
//       (this.props.submission &&
//         this.props.submission.allSubmissions &&
//         prevProps.submission.allSubmissions.length !==
//           this.props.submission.allSubmissions.length) ||
//       prevProps.appState.userType !== this.props.appState.userType
//     ) {
//       if (this.props.appState.userType) {
//         this.props.apiSubmission
//           .getAllSubmissions(
//             this.props.appState.authToken,
//             this.props.appState.userType
//           )
//           .then(result => {
//             console.log(result.payload);
//             if (
//               result.type === "GET_ALL_SUBMISSIONS_FAILURE" ||
//               this.props.submission.error
//             ) {
//               openSnackbar(
//                 "error",
//                 this.props.submission.error ||
//                   "An error occurred while fetching submissions"
//               );
//             }
//           })
//           .catch(err => {
//             openSnackbar("error", err);
//           });
//       }
//     }
//   }

//   handleDeleteDialogOpen = submission => {
//     if (submission && this.props.appState.loggedIn) {
//       const { userType } = this.props.appState;
//       if (!userType || userType === "view") {
//         openSnackbar("error", warning);
//       } else {
//         this.props.apiSubmission.handleDeleteOpen(submission);
//       }
//     }
//   };

//   async deleteSubmission(submissionData) {
//     const token = this.props.appState.authToken;
//     const { userType } = this.props.appState;
//     const submissionDeleteResult = await this.props.apiSubmission
//       .deleteSubmission(token, submissionData.id, userType)
//       .catch(err => {
//         openSnackbar("error", this.props.submission.error);
//       });
//     if (
//       !submissionDeleteResult ||
//       !submissionDeleteResult.type ||
//       submissionDeleteResult.type !== "DELETE_SUBMISSION_SUCCESS"
//     ) {
//       openSnackbar("error", this.props.submission.error);
//     } else if (submissionDeleteResult.type === "DELETE_SUBMISSION_SUCCESS") {
//       openSnackbar(
//         "success",
//         `Deleted submission from ${submissionData.firstName} ${submissionData.lastName}.`
//       );
//       this.props.apiSubmission.getAllSubmissions(token);
//     }
//   }

//   deleteAndClose() {
//     this.deleteSubmission(this.props.submission.currentSubmission);
//     this.props.apiSubmission.handleDeleteClose();
//   }

//   render() {
//     const { classes } = this.props;
//     return (
//       <div data-testid="component-submissions-table" className={classes.root}>
//         {this.props.submission.deleteDialogOpen && (
//           <AlertDialog
//             open={this.props.submission.deleteDialogOpen}
//             handleClose={this.props.apiSubmission.handleDeleteClose}
//             title="Delete Submission"
//             content={`Are you sure you want to delete? You cannot undo this action.`}
//             danger={true}
//             action={this.deleteAndClose}
//             buttonText="Delete"
//             data-testid="alert-dialog"
//           />
//         )}
//         <div className={classes.section}>
//           <Typography
//             variant="h2"
//             align="center"
//             gutterBottom
//             className={classes.head}
//             style={{ paddingTop: 20 }}
//             data-testid="headline"
//           >
//             Form Submissions
//           </Typography>
//           <div className={classes.gridWrapper}>
//             <MaterialTable
//               style={{ width: "100%", margin: "0 20px" }}
//               columns={submTableFieldList}
//               isLoading={this.props.submission.loading}
//               data={this.props.submission.allSubmissions}
//               title="Submissions"
//               options={{
//                 exportButton: true,
//                 filtering: true,
//                 sorting: true,
//                 columnsButton: true,
//                 rowStyle: rowData => ({
//                   backgroundColor:
//                     rowData && rowData.submission_status === "error"
//                       ? "#f9c7c7"
//                       : "#FFF"
//                 })
//               }}
//               icons={tableIcons}
//               actions={[
//                 {
//                   icon: () => BackupIcon,
//                   tooltip: "Resubmit",
//                   onClick: (event, rowData) => {
//                     console.log("resubmit");
//                     console.log(rowData);
//                     this.props.resubmitSubmission(rowData);
//                   }
//                 }
//               ]}
//             />
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// SubmissionsTableUnconnected.propTypes = {
//   classes: PropTypes.object.isRequired,
//   appState: PropTypes.shape({
//     loggedIn: PropTypes.bool,
//     authToken: PropTypes.string
//   }),
//   submission: PropTypes.shape({
//     filteredList: PropTypes.arrayOf(
//       PropTypes.shape({
//         id: PropTypes.number,
//         firstName: PropTypes.string,
//         lastName: PropTypes.string,
//         updated_at: PropTypes.string
//       })
//     ),
//     allSubmissions: PropTypes.arrayOf(
//       PropTypes.shape({
//         id: PropTypes.string,
//         firstName: PropTypes.string,
//         lastName: PropTypes.string,
//         updated_at: PropTypes.string
//       })
//     ),
//     currentSubmission: PropTypes.shape({
//       id: PropTypes.string,
//       firstName: PropTypes.string,
//       lastName: PropTypes.string,
//       updated_at: PropTypes.string
//     }),
//     deleteDialogOpen: PropTypes.bool,
//     apiSubmission: PropTypes.shape({
//       getAllSubmissions: PropTypes.func,
//       handleDeleteOpen: PropTypes.func,
//       deleteSubmission: PropTypes.func,
//       resubmit: PropTypes.func
//     })
//   })
// };

// const mapStateToProps = state => ({
//   appState: state.appState,
//   profile: state.profile,
//   submission: state.submission
// });

// const mapDispatchToProps = dispatch => ({
//   apiSubmission: bindActionCreators(apiSubmissionActions, dispatch)
// });

// export const SubmissionsTableConnected = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(SubmissionsTableUnconnected);

// export default withRouter(withStyles(styles)(SubmissionsTableConnected));
