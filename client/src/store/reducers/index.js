import { combineReducers } from "redux";
import appState from "../reducers/appState";
import profile from "../reducers/profile";
import formMeta from "../reducers/formMeta";

const rootReducer = combineReducers({
  appState,
  profile,
  formMeta
});

export default rootReducer;
