import { combineReducers } from "redux";
import registerReducer from "./registerReducer";
import memoryReducer from "./memoryReducer";

export default combineReducers({
    registerReducer,
    memoryReducer,
});
