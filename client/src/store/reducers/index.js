import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import appState from "../reducers/appState";
import profile from "../reducers/profile";
import content from "../reducers/content";
import submission from "../reducers/submission";

const rootReducer = combineReducers({
  appState,
  profile,
  content,
  submission,
  form: formReducer
});

export default rootReducer;
