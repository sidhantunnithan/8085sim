import * as actionTypes from "../Actions/types";

const DEFAULT_CODE =
`MVI C 0A
MVI A 00
LOOP:
ADD C
DCR C
JNZ LOOP
STA 2050
HLT`;

// Editor View is set to true
const initialState = {
    editorView: true,
    editorDisappearText: DEFAULT_CODE,
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
