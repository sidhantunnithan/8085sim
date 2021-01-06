import * as actionTypes from "./types";

export const stepLabel = (labelIndex) => (dispatch) => {
    dispatch({
        type: actionTypes.STEP_LABEL,
        payload: labelIndex,
    });
};
