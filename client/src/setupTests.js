import Enzyme from "enzyme";
// import EnzymeAdapter from "enzyme-adapter-react-16";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

Enzyme.configure({
  // adapter: new EnzymeAdapter(),
  adapter: new Adapter(),
  disableLifecycleMethods: true
});

global.fetch = require("jest-fetch-mock");
global.canvas = require("jest-canvas-mock");
// global.File = class MockFile {
//     filename: string;
//     constructor(parts: (string | Blob | ArrayBuffer | ArrayBufferView)[], filename: string, properties ? : FilePropertyBag) {
//       this.filename = filename;
//     }
//   }
