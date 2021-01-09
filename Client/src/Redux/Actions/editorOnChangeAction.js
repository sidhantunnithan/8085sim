import * as actionTypes from "./types";

export const editorOnChange = (editorText) => (dispatch) => {
    dispatch({
        type: actionTypes.EDITOR_CHANGE,
        payload: editorText,
    });
};

export const editorOnUpload = (editorText) => (dispatch, getState) => {
    dispatch({
        type: actionTypes.SWITCH_VIEW,
        payload: {
            editorView: !getState().bodyReducer.editorView,
            editorDisappearText: editorText,
        },
    });

    dispatch({
        type: actionTypes.FILEOPEN_POPUP,
        payload: {
            popupView: !getState().bodyReducer.popupView,
        },
    });

    dispatch({
        type: actionTypes.SWITCH_VIEW,
        payload: {
            editorView: !getState().bodyReducer.editorView,
            editorDisappearText: editorText,
        },
    });
};
