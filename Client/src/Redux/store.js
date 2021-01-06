import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./Reducers/rootReducer";

const middleware = [thunk];

const initialState = {};

const enhancers =
    process.env.REACT_APP_PRODUCTION === "production"
        ? applyMiddleware(...middleware)
        : composeWithDevTools(applyMiddleware(...middleware));

var store = createStore(rootReducer, initialState, enhancers);

export default store;
