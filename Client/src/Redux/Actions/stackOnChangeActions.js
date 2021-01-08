import * as actionTypes from "./types";

export const stackPop = (stackState) => (dispatch) => {
    dispatch({
        type: actionTypes.STATE_STACK_CHANGE,
        payload: stackState,
    });
};
