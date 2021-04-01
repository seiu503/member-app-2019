import PropTypes from "prop-types";
import shortid from "shortid";

import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import Looks3Icon from "@material-ui/icons/Looks3";
import Looks4Icon from "@material-ui/icons/Looks4";

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
