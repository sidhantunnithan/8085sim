import * as actionTypes from "../Actions/types";

// Initial value of the text of the editor
const initialState = {
    editorText: "",
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
