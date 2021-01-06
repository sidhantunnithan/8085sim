import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./Reducers/rootReducer";

const middleware = [thunk];

const initialState = {};

if (process.env.REACT_APP_PRODUCTION === "production") {
    var store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(...middleware)
    );
} else {
    var store = createStore(
        rootReducer,
        initialState,
        composeWithDevTools(applyMiddleware(...middleware))
    );
}

export default store;
