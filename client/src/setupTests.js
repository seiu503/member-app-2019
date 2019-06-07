import Enzyme from "enzyme";
import EnzymeAdapter from "enzyme-adapter-react-16";
require("jest-localstorage-mock");

Enzyme.configure({
  adapter: new EnzymeAdapter(),
  disableLifecycleMethods: true
});
