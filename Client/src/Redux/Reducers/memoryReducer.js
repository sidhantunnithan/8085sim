// Initial value of the memory.
// The 65535 memory addresses from 0x0000 to 0xFFFF
// is represented as a 4096 x 16 matrix
// all initialised to zero
import * as actionTypes from "../Actions/types";

const initialState = {
    memory: new Array(4095).fill(0).map((i) => {
        return new Array(16).fill(0);
    }),
    instructions: [],
};

export default function memory(state = initialState, action) {
    switch (action.type) {
        case actionTypes.MEMORY_INIT:
            return {
                ...state,
                memory: action.payload.memory,
                instructions: action.payload.instructions,
            };
        case actionTypes.MEMORY_RESET:
            return {
                ...state,
                memory: action.payload,
            };
        default:
            return state;
    }
}
