import { combineReducers } from "redux";
import appState from "../reducers/appState";
import profile from "../reducers/profile";
import content from "../reducers/content";
import submission from "../reducers/submission";

const rootReducer = combineReducers({
  appState,
  profile,
  content,
  submission
});

export default rootReducer;
