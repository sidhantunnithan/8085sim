import * as actionTypes from "./types";

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

export const memoryOnInit = (payload) => (dispatch, getState) => {
    var linearMem = [];
    var memory = [...getState().memoryReducer.memory];

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

    var loadedMemoryLocal = new Map();
    memory.forEach((rValue, rIndex) => {
        rValue.forEach((cValue, cIndex) => {
            if (parseInt(cValue, 16) > 0) {
                var key = (
                    "0000" +
                    rIndex.toString(16).toUpperCase() +
                    cIndex.toString(16).toUpperCase()
                ).slice(-4);
                loadedMemoryLocal.set(key, cValue);
            }
        });
    });

    dispatch({
        type: actionTypes.MEMORY_INIT,
        payload: {
            memory: memory,
            instructions: payload.instructions,
            loadedMemory: loadedMemoryLocal,
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

    if (getState().bodyReducer.editorView) {
        dispatch({
            type: actionTypes.SWITCH_VIEW,
            payload: {
                editorView: !getState().bodyReducer.editorView,
                editorDisappearText: getState().editorReducer.editorText,
            },
        });
    }
};

export const memoryOnReset = () => (dispatch) => {
    var memory = new Array(4096).fill(0).map((i) => {
        return new Array(16).fill(0);
    });

    dispatch({
        type: actionTypes.MEMORY_UPDATE,
        payload: {
            memory: memory,
            loadedMemory: new Map(),
        },
    });
};

export const memoryOnStep = (vis) => (dispatch) => {
    dispatch({
        type: actionTypes.MEMORY_STEP,
        payload: vis,
    });
};
