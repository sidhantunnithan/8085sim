import * as actionTypes from "./types";

export const stepLabelForward = (payloadLocal) => (dispatch, getState) => {
    // Push to stack
    var stateStackCopy = getState().stackReducer.stateStack;

    stateStackCopy.push({
        primaryRegisters: getState().registerReducer.primaryRegisters,
        flagRegisters: getState().registerReducer.flagRegisters,
        memory: getState().memoryReducer.memory,
    });

    dispatch({
        type: actionTypes.STATE_STACK_CHANGE,
        payload: stateStackCopy,
    });

    dispatch({
        type: actionTypes.STEP_LABEL,
        payload: getState().assembledReducer.labelIndex + 1,
    });

    if (payloadLocal.final === false) {
        dispatch({
            type: actionTypes.REGISTER_CHANGE,
            payload: {
                primaryRegisters: payloadLocal.primaryRegisters,
                flagRegisters: payloadLocal.flagRegisters,
            },
        });

        var loadedMemoryLocal = new Map();
        payloadLocal.memory.forEach((rValue, rIndex) => {
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
            type: actionTypes.MEMORY_UPDATE,
            payload: {
                memory: payloadLocal.memory,
                loadedMemory: loadedMemoryLocal,
            },
        });
    }
};

export const onRun = (payloadLocal) => (dispatch, getState) => {
    dispatch({
        type: actionTypes.STEP_LABEL,
        payload: -1,
    });

    dispatch({
        type: actionTypes.REGISTER_CHANGE,
        payload: {
            primaryRegisters: payloadLocal.primaryRegisters,
            flagRegisters: payloadLocal.flagRegisters,
        },
    });

    var loadedMemoryLocal = new Map();
    payloadLocal.memory.forEach((rValue, rIndex) => {
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
        type: actionTypes.MEMORY_UPDATE,
        payload: {
            memory: payloadLocal.memory,
            loadedMemory: loadedMemoryLocal,
        },
    });
};

export const stepLabelBackward = () => (dispatch, getState) => {
    dispatch({
        type: actionTypes.STEP_LABEL,
        payload: getState().assembledReducer.labelIndex - 1,
    });

    var stateStackCopy = getState().stackReducer.stateStack;
    var pastStack = stateStackCopy.pop();

    dispatch({
        type: actionTypes.REGISTER_CHANGE,
        payload: {
            primaryRegisters: pastStack.primaryRegisters,
            flagRegisters: pastStack.flagRegisters,
        },
    });

    var loadedMemoryLocal = new Map();
    pastStack.memory.forEach((rValue, rIndex) => {
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
        type: actionTypes.MEMORY_UPDATE,
        payload: {
            memory: pastStack.memory,
            loadedMemory: loadedMemoryLocal,
        },
    });

    dispatch({
        type: actionTypes.STATE_STACK_CHANGE,
        payload: stateStackCopy,
    });
};
