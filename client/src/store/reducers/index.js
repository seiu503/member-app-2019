import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import appState from "../reducers/appState";
import submission from "../reducers/submission";

const rootReducer = combineReducers({
  appState,
  submission,
  form: formReducer
});

export default rootReducer;
