import * as actionTypes from "../Actions/types";

export const DEFAULT_CODE =
`MVI C 0A
MVI A 00
LOOP:
ADD C
DCR C
JNZ LOOP
STA 2050
HLT`;

// Initial value of the text of the editor
const initialState = {
    editorText: DEFAULT_CODE,
};

export default function editor(state = initialState, action) {
    switch (action.type) {
        case actionTypes.EDITOR_CHANGE:
            return {
                ...state,
                editorText: action.payload,
            };
        default:
            return state;
    }
}
