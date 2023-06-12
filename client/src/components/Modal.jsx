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

import { Translate } from "react-localize-redux";

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
          <Translate id="modalTitle" /> {`${props.fullName}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Translate id="modalDescription" /> {`${props.fullName}.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.dialogActionsOverride}>
          <Button
            data-testid="button-link-request"
            onClick={props.handleCloseAndClear}
            className={classes.modalButtonRed}
          >
            <Translate id="modalErrorButtonPreName" />
            {`${props.fullName}`}
          </Button>
          <Button
            onClick={props.handleClose}
            className={classes.modalButtonGreen}
            data-testid="button-close"
            autoFocus
          >
            <Translate id="modalConfirmButton" /> {`${props.fullName}`}
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
