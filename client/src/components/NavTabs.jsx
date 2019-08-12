import React from "react";
import PropTypes from "prop-types";

import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import Looks3Icon from "@material-ui/icons/Looks3";
// import Looks4Icon from '@material-ui/icons/Looks4';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    maxWidth: "100%",
    borderRadius: "4px 4px 0 0"
  }
});

export default function NavTabs(props) {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <Tabs
        value={props.tab}
        onChange={props.handleTab}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        aria-label="Navigation tabs"
      >
        <Tab
          icon={<LooksOneIcon style={{ color: "#531078" }} />}
          aria-label="1"
          id="tab1"
          index={0}
        />
        <Tab
          icon={<LooksTwoIcon style={{ color: "#531078" }} />}
          aria-label="2"
          id="tab2"
          index={1}
        />
        <Tab
          icon={<Looks3Icon style={{ color: "#531078" }} />}
          aria-label="3"
          id="tab3"
          index={2}
        />
      </Tabs>
    </Paper>
  );
}

NavTabs.propTypes = {
  classes: PropTypes.object,
  handleTab: PropTypes.func,
  tab: PropTypes.number
};