import React, { Component } from "react";
import { connect } from "react-redux";
import { monaco } from "@monaco-editor/react";
import "./Styles/BodyStyles.scss";

import SIM_LANG from "./EditorConfig/language";
import SIM_THEME from "./EditorConfig/theme";

export const Editor = (code) => {
    console.log(code);

    monaco
        .init()
        .then((monacoInstance) => {
            const wrapper = document.getElementById("editor-child");
            const properties = {
                value: code.code,
                language: "sim-lang",
                theme: "sim-dark",
                height: "100%",
                scrollbar: {
                    useShadows: false,
                    vertical: "auto",
                    horizontal: "auto",
                    verticalScrollbarSize: 4,
                    horizontalScrollbarSize: 4,
                },
                minimap: {
                    enabled: false,
                },
            };

            monacoInstance.languages.register({ id: "sim-lang" });
            monacoInstance.languages.setMonarchTokensProvider(
                "sim-lang",
                SIM_LANG
            );
            monacoInstance.editor.defineTheme("sim-dark", SIM_THEME);
            monacoInstance.editor.create(wrapper, properties);
        })
        .catch((error) =>
            console.error(
                "An error occurred during initialization of Monaco: ",
                error
            )
        );

    return (
        <div id="editor-container" className="editor-container">
            <div className="header">
                <h1>Editor</h1>
            </div>
            <div id="editor-child" className="editor-child"></div>
        </div>
    );
};

const mapStateToProps = (state, ownProps) => {
    return {
        code: state.editorReducer.code,
    };
};

export default connect(mapStateToProps)(Editor);
