import React from "react";
import PropTypes from "prop-types";

const ContentTile = props => (
  <div className={props.classes.contentTile}>Content Tile</div>
);

ContentTile.propTypes = {
  classes: PropTypes.object
};

export default ContentTile;
