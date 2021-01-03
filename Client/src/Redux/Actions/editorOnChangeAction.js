import * as actionTypes from "./types";

export const editorOnChange = (editorText) => (dispatch) => {
    dispatch({
        type: actionTypes.EDITOR_CHANGE,
        payload: editorText,
    });
};
