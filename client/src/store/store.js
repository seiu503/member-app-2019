import { createStore, applyMiddleware, compose } from "redux";
import { apiMiddleware } from "redux-api-middleware";
import rootReducer from "./reducers/";

const middleware = applyMiddleware(apiMiddleware);

// these two lines are for storeFactory in testUtils
export const middlewares = [apiMiddleware];
export const createStoreWithMiddleware = applyMiddleware(...middlewares)(
  createStore
);

const store = createStore(
  rootReducer,
  compose(
    middleware,
    window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__()
      : f => f
  )
);

export default store;
