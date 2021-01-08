import * as actionTypes from "./types";

export const bodyOnChange = (editorView) => (dispatch, getState) => {
    dispatch({
        type: actionTypes.ASSEMBLED_VIEW,
        payload: {
            editorView: editorView,
            editorDisappearText: getState().editorReducer.editorText,
        },
    });
};
