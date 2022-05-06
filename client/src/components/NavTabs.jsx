import PropTypes from "prop-types";
import shortid from "shortid";

import { Tabs, Tab, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  Looks4Icon,
  Looks3Icon,
  LooksTwoIcon,
  LooksOneIcon
} from "@mui/icons-material";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    maxWidth: 600,
    margin: "auto",
    borderRadius: "4px 4px 0 0"
  }
});

export default function NavTabs(props) {
  const classes = useStyles();
  const { howManyTabs } = props;
  const icons = [
    <LooksOneIcon style={{ color: "#531078" }} />,
    <LooksTwoIcon style={{ color: "#531078" }} />,
    <Looks3Icon style={{ color: "#531078" }} />,
    <Looks4Icon style={{ color: "#531078" }} />
  ];
  const renderTab = index => (
    <Tab
      icon={icons[index]}
      aria-label={index + 1}
      id={`tab${index + 1}`}
      index={index}
      disabled
      key={shortid()}
    />
  );
  const tabs = [];
  for (let i = 0; i <= howManyTabs - 1; i++) {
    tabs.push(renderTab(i));
  }
  return (
    <Paper className={classes.root} data-test="component-navtabs">
      <Tabs
        value={props.tab}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        aria-label="Navigation tabs"
      >
        {tabs}
      </Tabs>
    </Paper>
  );
}

NavTabs.propTypes = {
  classes: PropTypes.object,
  handleTab: PropTypes.func,
  tab: PropTypes.number
};
