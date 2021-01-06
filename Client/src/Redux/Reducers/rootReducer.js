import { combineReducers } from "redux";
import navbarReducer from "./navbarReducer";
import registerReducer from "./registerReducer";
import memoryReducer from "./memoryReducer";
import editorReducer from "./editorReducer";
import bodyReducer from "./bodyReducer";
import assembledReducer from "./assembledReducer";

export default combineReducers({
    navbarReducer,
    registerReducer,
    memoryReducer,
    editorReducer,
    bodyReducer,
    assembledReducer,
});
