import * as actionTypes from "./types";
import store from "../store";

// payload = {
//     byteCodes : [
//         [byteCodes of line 1]
//         [byteCodes of line 2]
//         ...
//     ]
//     instructions: [
//         "line 1"
//         "line 2"
//         ...
//     ]
// }

export const memoryOnInit = (payload) => (dispatch) => {
    var linearMem = [];
    var memory = [...store.getState().memoryReducer.memory];

    for (let i = 0; i < payload.byteCodes.length; i++) {
        linearMem = linearMem.concat(payload.byteCodes[i]);
    }

    var j = 0;
    var k = 0;

    for (let i = 0; i < linearMem.length; i++) {
        k = i % 16;
        j = Math.floor(i / 16);
        memory[j][k] = linearMem[i];
    }

    dispatch({
        type: actionTypes.MEMORY_INIT,
        payload: {
            memory: memory,
            instructions: payload.instructions,
        },
    });

    dispatch({
        type: actionTypes.MEMORY_BYTES,
        payload: payload.byteCodes,
    });

    dispatch({
        type: actionTypes.STEP_LABEL_RESET,
        payload: "",
    });

    dispatch({
        type: actionTypes.REGISTER_PC_RESET,
        payload: "",
    });
};

export const memoryOnReset = () => (dispatch) => {
    var memory = new Array(4096).fill(0).map((i) => {
        return new Array(16).fill(0);
    });

    dispatch({
        type: actionTypes.MEMORY_RESET,
        payload: memory,
    });
};

export const memoryOnStep = (vis) => (dispatch) => {
    dispatch({
        type: actionTypes.MEMORY_STEP,
        payload: vis,
    });
};
