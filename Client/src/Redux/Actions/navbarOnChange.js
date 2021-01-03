import * as actionTypes from "./types";

export const navbarOnChange = (filename) => (dispatch) => {
    dispatch({
        type: actionTypes.FILENAME_CHANGE,
        payload: filename,
    });
};
