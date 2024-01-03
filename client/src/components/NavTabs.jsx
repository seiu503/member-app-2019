import PropTypes from "prop-types";
import shortid from "shortid";

import { Tabs, Tab, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Looks4, Looks3, LooksTwo, LooksOne } from "@mui/icons-material";

import { theme } from "../styles/theme";

// may need to fix this
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    maxWidth: 600,
    margin: "auto",
    borderRadius: "4px 4px 0 0"
  }
}));

export default function NavTabs(props) {
  const classes = useStyles();
  const { howManyTabs } = props;
  const icons = [
    <LooksOne style={{ color: "#531078" }} />,
    <LooksTwo style={{ color: "#531078" }} />,
    <Looks3 style={{ color: "#531078" }} />,
    <Looks4 style={{ color: "#531078" }} />
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
    <Paper className={classes.root} data-testid="component-navtabs">
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
