import * as actionTypes from "../Actions/types";

// Editor View is set to true
const initialState = {
    editorView: true,
    editorDisappearText: "",
    popupView: false,
};

export default function body(state = initialState, action) {
    switch (action.type) {
        case actionTypes.SWITCH_VIEW:
            return {
                ...state,
                editorView: action.payload.editorView,
                editorDisappearText: action.payload.editorDisappearText,
            };
        case actionTypes.FILEOPEN_POPUP:
            return {
                ...state,
                popupView: action.payload.popupView,
            };

        default:
            return state;
    }
}
