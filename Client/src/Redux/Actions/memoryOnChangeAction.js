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

    for (var i = 0; i < payload.byteCodes.length; i++) {
        linearMem = linearMem.concat(payload.byteCodes[i]);
    }

    var j = 0;
    var k = 0;

    for (var i = 0; i < linearMem.length; i++) {
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
};

export const memoryOnReset = () => (dispatch) => {
    var memory = new Array(4095).fill(0).map((i) => {
        return new Array(16).fill(0);
    });

    dispatch({
        type: actionTypes.MEMORY_RESET,
        payload: memory,
    });
};
