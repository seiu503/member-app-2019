import React from "react";
import { withRouter } from "react-router-dom";

export class UnwrappedScrollToTop extends React.Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.location !== prevProps.location &&
      !this.props.location.hash
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  render() {
    return this.props.children;
  }
}

export default withRouter(UnwrappedScrollToTop);
