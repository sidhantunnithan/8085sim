import * as actionTypes from "./types";

export const bodyOnChange = (editorView, editorDisappearText) => (dispatch) => {
    dispatch({
        type: actionTypes.ASSEMBLED_VIEW,
        payload: {
            editorView: editorView,
            editorDisappearText: editorDisappearText,
        },
    });
};
