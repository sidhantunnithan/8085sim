import * as actionTypes from "../Actions/types";

// Initial value of the text of the editor
const initialState = {
    labelIndex: -1,
};

export default function assembled(state = initialState, action) {
    switch (action.type) {
        case actionTypes.STEP_LABEL:
            return {
                ...state,
                labelIndex: action.payload,
            };
        default:
            return state;
    }
}
