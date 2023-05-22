import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import appState from "../reducers/appState";
import submission from "../reducers/submission";
import { localizeReducer } from "react-localize-redux";

const rootReducer = combineReducers({
  appState,
  submission,
  localize: localizeReducer,
  form: formReducer
});

export default rootReducer;
