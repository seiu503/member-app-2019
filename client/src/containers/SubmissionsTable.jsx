import React from "react";
import PropTypes from "prop-types";
import MaterialTable from "material-table";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import { forwardRef } from "react";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as utils from "../utils";
import AlertDialog from "../components/AlertDialog";
import { openSnackbar } from "./Notifier";

import Typography from "@material-ui/core/Typography";

import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const styles = theme => ({
  root: {
    margin: "0 auto",
    width: "100%",
    maxWidth: 1920,
    paddingBottom: 60,
    background: "white",
    minHeight: "100vh"
  },
  section: {
    padding: "60px 0 0 0"
  },
  head: {
    color: theme.palette.primary.main
  },
  gridWrapper: {
    margin: "0 auto",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: "50px 0",
    [theme.breakpoints.down("sm")]: {
      padding: "10px 0px"
    }
  }
});

export class SubmissionsTableUnconnected extends React.Component {
  componentDidMount() {
    const { authToken } = this.props.appState;
    this.props.apiSubmission
      .getAllSubmissions(authToken)
      .then(result => {
        if (
          result.type === "GET_ALL_SUBMISSIONS_FAILURE" ||
          this.props.submission.error
        ) {
          openSnackbar(
            "error",
            this.props.submission.error ||
              "An error occured while fetching content"
          );
        }
      })
      .catch(err => {
        openSnackbar("error", err);
      });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      (!prevProps.appState.authToken && this.props.appState.authToken) ||
      prevProps.submission.allSubmissions.length !==
        this.props.submission.allSubmissions.length
    ) {
      this.props.apiSubmission
        .getAllSubmissions(this.props.appState.authToken)
        .then(result => {
          if (
            result.type === "GET_ALL_SUBMISSIONS_FAILURE" ||
            this.props.submission.error
          ) {
            openSnackbar(
              "error",
              this.props.submission.error ||
                "An error occured while fetching submissions"
            );
          }
        })
        .catch(err => {
          openSnackbar("error", err);
        });
    }
  }

  handleDeleteDialogOpen = submission => {
    if (submission && this.props.appState.loggedIn) {
      this.props.apiSubmission.handleDeleteOpen(submission);
    }
  };

  async deleteSubmission(submissionData) {
    const token = this.props.appState.authToken;
    const submissionDeleteResult = await this.props.apiSubmission.deleteSubmission(
      token,
      submissionData.id
    );
    if (
      !submissionDeleteResult.type ||
      submissionDeleteResult.type !== "DELETE_SUBMISSION_SUCCESS"
    ) {
      openSnackbar("error", this.props.submission.error);
    } else if (submissionDeleteResult.type === "DELETE_SUBMISSION_SUCCESS") {
      openSnackbar(
        "success",
        `Deleted submission from ${submissionData.firstName} ${
          submissionData.lastName
        }.`
      );
      this.props.apiSubmission.getAllSubmissions(token);
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div data-test="component-submissions-table" className={classes.root}>
        {this.props.submission.deleteDialogOpen && (
          <AlertDialog
            open={this.props.submission.deleteDialogOpen}
            handleClose={this.props.apiSubmission.handleDeleteClose}
            title="Delete Submission"
            content={`Are you sure you want to delete? You cannot undo this action.`}
            danger={true}
            action={() => {
              this.deleteContent(this.props.submission.currentSubmission);
              this.props.apiSubmission.handleDeleteClose();
            }}
            buttonText="Delete"
            data-test="alert-dialog"
          />
        )}
        <div className={classes.section}>
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            className={classes.head}
            style={{ paddingTop: 20 }}
            data-test="headline"
          >
            Form Submissions
          </Typography>
          <div className={classes.gridWrapper}>
            <MaterialTable
              style={{ width: "100%", margin: "0 20px" }}
              columns={[
                { title: "First name", field: "first_name" },
                { title: "Last name", field: "last_name" },
                { title: "Employer", field: "employer_name" },
                { title: "Email", field: "home_email" },
                { title: "Source code", field: "campaign_source_code" },
                { title: "Id", field: "id" },
                {
                  title: "Updated at",
                  field: "updated_at",
                  type: "date",
                  render: rowData => utils.formatDate(rowData.updated_at)
                }
              ]}
              data={this.props.submission.allSubmissions}
              title="Submissions"
              options={{
                exportButton: true,
                filtering: true,
                sorting: true
              }}
              icons={tableIcons}
            />
          </div>
        </div>
      </div>
    );
  }
}

SubmissionsTableUnconnected.propTypes = {
  classes: PropTypes.object.isRequired,
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool,
    authToken: PropTypes.string
  }),
  submission: PropTypes.shape({
    filteredList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        updated_at: PropTypes.string
      })
    ),
    allSubmissions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        updated_at: PropTypes.string
      })
    ),
    currentSubmission: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      updated_at: PropTypes.string
    }),
    deleteDialogOpen: PropTypes.bool,
    apiSubmission: PropTypes.shape({
      getAllSubmissions: PropTypes.func,
      handleDeleteOpen: PropTypes.func,
      deleteSubmission: PropTypes.func,
      resubmit: PropTypes.func
    })
  })
};

const mapStateToProps = state => ({
  appState: state.appState,
  profile: state.profile,
  submission: state.submission
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch)
});

export const SubmissionsTableConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionsTableUnconnected);

export default withRouter(withStyles(styles)(SubmissionsTableConnected));
