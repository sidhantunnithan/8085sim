import { combineReducers } from "redux";
import registerReducer from "./registerReducer";
import memoryReducer from "./memoryReducer";
import editorReducer from "./editorReducer";

export default combineReducers({
    registerReducer,
    memoryReducer,
    editorReducer,
});
