import PropTypes from "prop-types";

const NotFound = props => {
  return (
    <div
      className={props.classes.container}
      data-test="component-not-found"
      style={{
        margin: "0 auto",
        width: "100%",
        maxWidth: 320,
        background: "white",
        minHeight: "15vh",
        textAlign: "center",
        fontSize: "2em"
      }}
    >
      404 error.
      <br />
      Sorry, page not found.
    </div>
  );
};

NotFound.propTypes = {
  classes: PropTypes.object
};

export default NotFound;
