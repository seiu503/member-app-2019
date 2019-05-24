import { combineReducers } from "redux";
import appState from "../reducers/appState";
import profile from "../reducers/profile";
import content from "../reducers/content";

const rootReducer = combineReducers({
  appState,
  profile,
  content
});

export default rootReducer;
