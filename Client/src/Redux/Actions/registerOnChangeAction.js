import * as actionTypes from "./types";

export const registerReset = () => (dispatch) => {
    dispatch({
        type: actionTypes.REGISTER_RESET,
        payload: "",
    });
};
