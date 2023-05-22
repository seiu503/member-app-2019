import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import appState from "../reducers/appState";
import submission from "../reducers/submission";
import user from "../reducers/user";
import { localizeReducer } from "react-localize-redux";

const rootReducer = combineReducers({
  appState,
  submission,
  user,
  localize: localizeReducer,
  form: formReducer
});

export default rootReducer;
