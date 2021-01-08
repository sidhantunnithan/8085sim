import * as actionTypes from "./types";

export const stepLabelForward = (payloadLocal) => (dispatch, getState) => {
    console.log(payloadLocal);
    // Push to stack
    var stateStackCopy = getState().stackReducer.stateStack;

    stateStackCopy.push({
        primaryRegisters: getState().registerReducer.primaryRegisters,
        flagRegisters: getState().registerReducer.flagRegisters,
        memory: getState().memoryReducer.memory,
    });
    console.log(stateStackCopy);

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
    }
};

export const stepLabelBackward = () => (dispatch, getState) => {
    dispatch({
        type: actionTypes.STEP_LABEL,
        payload: getState().assembledReducer.labelIndex - 1,
    });

    var stateStackCopy = getState().stackReducer.stateStack;
    var pastStack = stateStackCopy.pop();

    console.log(stateStackCopy);

    dispatch({
        type: actionTypes.REGISTER_CHANGE,
        payload: {
            primaryRegisters: pastStack.primaryRegisters,
            flagRegisters: pastStack.flagRegisters,
        },
    });

    dispatch({
        type: actionTypes.STATE_STACK_CHANGE,
        payload: stateStackCopy,
    });
};
