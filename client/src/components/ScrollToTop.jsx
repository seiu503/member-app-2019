import React from "react";
import withRouter from "../components/ComponentWithRouterProp";

export class UnwrappedScrollToTop extends React.Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.location !== prevProps.location &&
      !this.props.location.hash
    ) {
      console.log("10");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  render() {
    return this.props.children;
  }
}

export default withRouter(UnwrappedScrollToTop);
// export default UnwrappedScrollToTop;
