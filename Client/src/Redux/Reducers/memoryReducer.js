// Initial value of the memory.
// The 65535 memory addresses from 0x0000 to 0xFFFF
// is represented as a 4096 x 16 matrix
// all initialised to zero
import * as actionTypes from "../Actions/types";

const initialState = {
    memory: new Array(4096).fill(0).map((i) => {
        return new Array(16).fill(0);
    }),
    instructions: [],
    opCodes: [],
    visible: 0,
    loadedMemory: new Map(),
};

export default function memory(state = initialState, action) {
    switch (action.type) {
        case actionTypes.MEMORY_INIT:
            return {
                ...state,
                memory: action.payload.memory,
                instructions: action.payload.instructions,
                loadedMemory: action.payload.loadedMemory,
            };
        case actionTypes.MEMORY_BYTES:
            return {
                ...state,
                opCodes: action.payload,
            };
        case actionTypes.MEMORY_UPDATE:
            return {
                ...state,
                memory: action.payload.memory,
                loadedMemory: action.payload.loadedMemory,
            };
        case actionTypes.MEMORY_STEP:
            return {
                ...state,
                visible: action.payload,
            };
        default:
            return state;
    }
}
