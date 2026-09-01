import { CircularProgress } from "@mui/material";
import { Trans } from "react-i18next";

const wrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  inset: 0,
  zIndex: 3,
  backgroundColor: "rgba(0, 0, 0, 0.55)"
};

const status = {
  width: "min(90%, 420px)",
  padding: "28px",
  textAlign: "center",
  color: "#ffffff",
  backgroundColor: "#531078",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
};

const heading = {
  margin: "18px 0 8px",
  fontSize: "1.25rem",
  fontWeight: 700
};

const message = {
  margin: 0,
  lineHeight: 1.5
};

const Spinner = () => (
  <div
    style={wrap}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div style={status}>
      <CircularProgress
        color="inherit"
        size={50}
        data-testid="component-spinner"
      />

      <p style={heading}>
        <Trans i18nKey="pleaseWait">Please wait…</Trans>
      </p>

      <p style={message}>
        <Trans i18nKey="savingInformation">
          We’re securely saving your information. This can sometimes take up to
          30 seconds. Please don’t close this page or submit the form again.
        </Trans>
      </p>
    </div>
  </div>
);

export default Spinner;