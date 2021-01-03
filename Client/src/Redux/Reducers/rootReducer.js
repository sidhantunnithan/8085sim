import { combineReducers } from "redux";
import navbarReducer from "./navbarReducer";
import registerReducer from "./registerReducer";
import memoryReducer from "./memoryReducer";
import editorReducer from "./editorReducer";

export default combineReducers({
    navbarReducer,
    registerReducer,
    memoryReducer,
    editorReducer,
});
