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

        dispatch({
            type: actionTypes.MEMORY_UPDATE,
            payload: payloadLocal.memory,
        });
    }
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

    dispatch({
        type: actionTypes.MEMORY_UPDATE,
        payload: pastStack.memory,
    });

    dispatch({
        type: actionTypes.STATE_STACK_CHANGE,
        payload: stateStackCopy,
    });
};
