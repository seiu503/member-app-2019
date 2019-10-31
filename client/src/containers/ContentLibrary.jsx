import React from "react";
import PropTypes from "prop-types";
import MaterialTable from "material-table";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import Typography from "@material-ui/core/Typography";
import FAB from "@material-ui/core/Fab";
import Create from "@material-ui/icons/Create";
import Tooltip from "@material-ui/core/Tooltip";

import * as apiContentActions from "../store/actions/apiContentActions";
import * as utils from "../utils";
import GenerateURL from "./GenerateURL";
import AlertDialog from "../components/AlertDialog";
import { openSnackbar } from "./Notifier";
import {
  tableIcons,
  contentTableFieldList
} from "../components/SubmissionFormElements";

const BASE_URL = process.env.REACT_APP_BASE_URL;

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
  buttonEdit: {
    position: "absolute",
    bottom: 20,
    right: 20,
    visibility: "hidden",
    "&:hover": {
      backgroundColor: theme.palette.primary.light
    }
  },
  buttonDelete: {
    position: "absolute",
    bottom: 20,
    right: 80,
    visibility: "hidden",
    backgroundColor: theme.palette.danger.main,
    "&:hover": {
      backgroundColor: theme.palette.danger.light
    }
  },
  actionArea: {
    borderRadius: 6,
    zIndex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,.05)"
    },
    "&:hover $buttonEdit": {
      visibility: "visible"
    },
    "&:hover $buttonDelete": {
      visibility: "visible"
    }
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
  },
  card: {
    width: "31%",
    padding: 20,
    margin: "10px",
    position: "relative",
    border: `1px solid ${theme.palette.primary.main}`,
    [theme.breakpoints.down("md")]: {
      width: "47%"
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      margin: "10px 0px"
    }
  },
  buttonWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: 40
  }
});

const loginLinkStr = "click here to login";
const loginLink = loginLinkStr.link(`${BASE_URL}/api/auth/google`);
const warning = `You do not have access to the page you were trying to reach. Please ${loginLink} or contact an administrator to request access.`;

export class ContentLibraryUnconnected extends React.Component {
  componentDidMount() {
    const { authToken, userType } = this.props.appState;
    if (authToken && userType) {
      this.props.apiContent
        .getAllContent(authToken, userType)
        .then(result => {
          if (
            result.type === "GET_ALL_CONTENT_FAILURE" ||
            this.props.content.error
          ) {
            openSnackbar(
              "error",
              this.props.content.error ||
                "An error occurred while fetching content"
            );
          }
        })
        .catch(err => {
          openSnackbar("error", err);
        });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      ((!prevProps.appState.authToken || !prevProps.appState.userType) &&
        (this.props.appState.authToken && this.props.appState.userType)) ||
      prevProps.content.allContent.length !==
        this.props.content.allContent.length ||
      prevProps.appState.userType !== this.props.appState.userType
    ) {
      this.props.apiContent
        .getAllContent(
          this.props.appState.authToken,
          this.props.appState.userType
        )
        .then(result => {
          if (
            result.type === "GET_ALL_CONTENT_FAILURE" ||
            this.props.content.error
          ) {
            openSnackbar(
              "error",
              this.props.content.error ||
                "An error occurred while fetching content"
            );
          }
        })
        .catch(err => {
          openSnackbar("error", err);
        });
    }
  }

  handleDeleteDialogOpen = (event, rowData) => {
    if (rowData && this.props.appState.loggedIn) {
      const { userType } = this.props.appState;
      if (!["admin", "edit"].includes(userType)) {
        openSnackbar("error", warning);
      }
      this.props.apiContent.handleDeleteOpen(rowData);
    }
  };

  async deleteContent(contentData) {
    const token = this.props.appState.authToken;
    const { userType } = this.props.appState;
    const contentDeleteResult = await this.props.apiContent.deleteContent(
      token,
      contentData.id,
      userType
    );
    if (
      !contentDeleteResult.type ||
      contentDeleteResult.type !== "DELETE_CONTENT_SUCCESS"
    ) {
      openSnackbar("error", this.props.content.error);
    } else if (
      contentDeleteResult.type === "DELETE_CONTENT_SUCCESS" &&
      contentData.content_type === "image"
    ) {
      const keyParts = contentData.content.split("/");
      const key = keyParts[keyParts.length - 1];
      const imageDeleteResult = await this.props.apiContent.deleteImage(
        token,
        key
      );
      if (imageDeleteResult.type === "DELETE_IMAGE_SUCCESS") {
        openSnackbar("success", `Deleted ${contentData.content_type}.`);
        this.props.apiContent.getAllContent(token);
      }
    } else if (contentDeleteResult.type === "DELETE_CONTENT_SUCCESS") {
      openSnackbar("success", `Deleted ${contentData.content_type}.`);
      this.props.apiContent.getAllContent(token);
    }
  }

  handleEdit = (event, rowData) =>
    this.props.history.push(`/edit/${rowData.id}`);

  handleSelect = async (event, rowData) => {
    const idsArray = Object.values(this.props.content.selectedContent);
    if (idsArray.indexOf(rowData.id) === -1) {
      return this.props.apiContent.selectContent(
        rowData.id,
        rowData.content_type
      );
    }
    return this.props.apiContent.unselectContent(
      rowData.id,
      rowData.content_type
    );
  };

  checked = rowData => {
    console.log("checked");
    console.log(rowData);
    const idsArray = Object.values(this.props.content.selectedContent);
    if (idsArray.indexOf(rowData.id) > -1) {
      return tableIcons.CheckBoxChecked;
    }
    return tableIcons.CheckBoxBlank;
  };

  selectAction = rowData => {
    const idsArray = Object.values(this.props.content.selectedContent);
    return {
      icon:
        idsArray.indexOf(rowData.id) > -1
          ? tableIcons.CheckBoxChecked
          : tableIcons.CheckBoxBlank,
      tooltip: "Select Content",
      onClick: this.handleSelect
    };
  };

  editAction = () => ({
    icon: tableIcons.Edit,
    tooltip: "Edit Content",
    onClick: this.handleEdit
  });

  deleteAction = () => ({
    icon: tableIcons.Delete,
    tooltip: "Delete Content",
    onClick: this.handleDeleteDialogOpen
  });

  render() {
    const { classes } = this.props;
    const { loggedIn } = this.props.appState;
    const contentType =
      utils.labelsObj[this.props.content.currentContent.content_type];
    return (
      <div data-test="component-content-library" className={classes.root}>
        {loggedIn && this.props.content.deleteDialogOpen && (
          <AlertDialog
            open={this.props.content.deleteDialogOpen}
            handleClose={this.props.apiContent.handleDeleteClose}
            title="Delete Content"
            content={`Are you sure you want to delete? Note that any live form versions that use this ${contentType} will render the default ${contentType} instead after this is deleted.`}
            danger={true}
            action={() => {
              this.deleteContent(this.props.content.currentContent);
              this.props.apiContent.handleDeleteClose();
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
            Content Library
          </Typography>
          <GenerateURL />
          <div className={classes.buttonWrap}>
            <Tooltip title="New Content" aria-label="New Content">
              <FAB
                className={classes.buttonNew}
                href="/new"
                color="primary"
                aria-label="New Content"
                data-test="button-new"
              >
                <Create />
              </FAB>
            </Tooltip>
          </div>
          <div className={classes.gridWrapper}>
            <MaterialTable
              style={{ width: "100%", margin: "0 20px" }}
              columns={contentTableFieldList}
              isLoading={this.props.content.loading}
              data={this.props.content.allContent}
              title="Content"
              options={{
                filtering: true,
                sorting: true
              }}
              icons={tableIcons}
              actions={[this.selectAction, this.editAction, this.deleteAction]}
            />
          </div>
        </div>
      </div>
    );
  }
}

ContentLibraryUnconnected.propTypes = {
  classes: PropTypes.object.isRequired,
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool,
    authToken: PropTypes.string
  }),
  content: PropTypes.shape({
    filteredList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        content_type: PropTypes.string,
        content: PropTypes.string,
        updated_at: PropTypes.string
      })
    ),
    allContent: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        content_type: PropTypes.string,
        content: PropTypes.string,
        updated_at: PropTypes.string
      })
    ),
    currentContent: PropTypes.shape({
      id: PropTypes.number,
      content_type: PropTypes.string,
      content: PropTypes.string,
      updated_at: PropTypes.string
    }),
    deleteDialogOpen: PropTypes.bool,
    apiContent: PropTypes.shape({
      getAllContent: PropTypes.func,
      handleDeleteOpen: PropTypes.func,
      deleteContent: PropTypes.func,
      deleteImage: PropTypes.func
    })
  })
};

const mapStateToProps = state => ({
  appState: state.appState,
  profile: state.profile,
  content: state.content,
  localize: state.localize
});

const mapDispatchToProps = dispatch => ({
  apiContent: bindActionCreators(apiContentActions, dispatch)
});

export const ContentLibraryConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentLibraryUnconnected);

export default withRouter(withStyles(styles)(ContentLibraryConnected));
