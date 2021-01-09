import * as actionTypes from "./types";

export const bodyOnChange = () => (dispatch, getState) => {
    dispatch({
        type: actionTypes.SWITCH_VIEW,
        payload: {
            editorView: !getState().bodyReducer.editorView,
            editorDisappearText: getState().editorReducer.editorText,
        },
    });
};

export const fileUploadPopup = () => (dispatch, getState) => {
    dispatch({
        type: actionTypes.FILEOPEN_POPUP,
        payload: {
            popupView: !getState().bodyReducer.popupView,
            editorDisappearText: getState().bodyReducer.editorDisappearText,
        },
    });
};
