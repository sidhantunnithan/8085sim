import * as actionTypes from "../Actions/types";

// Editor View is set to true
const initialState = {
    editorView: true,
    editorDisappearText: "",
};

export default function body(state = initialState, action) {
    switch (action.type) {
        case actionTypes.SWITCH_VIEW:
            return {
                ...state,
                editorView: action.payload.editorView,
                editorDisappearText: action.payload.editorDisappearText,
            };
        default:
            return state;
    }
}
