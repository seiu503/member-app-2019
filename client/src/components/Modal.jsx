import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText
} from "@mui/material";
import { withStyles } from "@mui/styles";

import { Trans } from "react-i18next";

const styles = theme => ({
  modalButtonRed: {
    backgroundColor: "#b71c1c", // theme.palette.danger.main
    display: "block",
    textTransform: "none",
    width: "100%",
    marginBottom: 20,
    padding: 15,
    color: "white",
    fontSize: "1.2em",
    "&:hover": {
      backgroundColor: "#d32f2f" // theme.palette.danger.light
    }
  },
  modalButtonGreen: {
    backgroundColor: "#43A047", // theme.palette.success.main,
    display: "block",
    textTransform: "none",
    width: "100%",
    marginLeft: 0,
    color: "white",
    fontSize: "1.2em",
    padding: 15,
    "&:hover": {
      backgroundColor: "#66BB6A" // theme.palette.success.light
    }
  },
  dialogActionsOverride: {
    display: "block",
    padding: 15
  }
});

function Modal(props) {
  const { classes } = props;
  // console.log('*********** MODAL ***************');
  // console.log(`props.open: ${props.open}`);
  return (
    <div>
      <Dialog
        data-testid="component-modal"
        open={props.open}
        onClose={props.handleCloseAndClear}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Trans i18nKey="modalTitle" /> {`${props.fullName}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Trans i18nKey="modalDescription" /> {`${props.fullName}.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.dialogActionsOverride}>
          <Button
            data-testid="button-link-request"
            onClick={props.handleCloseAndClear}
            className={classes.modalButtonRed}
          >
            <Trans i18nKey="modalErrorButtonPreName" />
            {`${props.fullName}`}
          </Button>
          <Button
            onClick={props.handleClose}
            className={classes.modalButtonGreen}
            data-testid="button-close"
            autoFocus
          >
            <Trans i18nKey="modalConfirmButton" /> {`${props.fullName}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  fullName: PropTypes.string,
  handleClose: PropTypes.func,
  classes: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func
  })
};

export default withStyles(styles)(Modal);
