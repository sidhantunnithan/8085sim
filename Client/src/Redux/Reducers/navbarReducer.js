import * as actionTypes from "../Actions/types";

// File name initialised to "Untitled"
const initialState = {
    filename: "Untitled",
};

export default function memory(state = initialState, action) {
    switch (action.type) {
        case actionTypes.FILENAME_CHANGE:
            console.log("Entered");
            return {
                ...state,
                filename: action.payload,
            };
        default:
            return state;
    }
}
