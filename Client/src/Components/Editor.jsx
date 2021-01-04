import React, { useRef } from "react";
import { connect } from "react-redux";
import { monaco } from "@monaco-editor/react";

import "./Styles/BodyStyles.scss";
import SIM_LANG from "./EditorConfig/language";
import SIM_THEME from "./EditorConfig/theme";
import { editorOnChange } from "../Redux/Actions/editorOnChangeAction";

export const Editor = (props) => {
    var editorRef = useRef();

    // Save a reference to the editor
    // editorRef will be used to get the value later
    function handleEditor(editor) {
        editorRef = editor;
        editorRef.onDidChangeContent(handleContentChange);
    }

    // Change the state whenever content of the editor changes
    function handleContentChange(e) {
        props.editorOnChange(editorRef.getValue());
    }

    // Initialise editor with following properties :
    // value -> Initial Value of the editor
    // language -> Custom language defined and imported as sim-lang
    // theme -> Custom theme with syntax highlighting for specific language defined
    //          and imported as sim-dark
    // scrollbar -> Options to reduce the size from the default
    // minimap -> Enable/Disable the minimap for the Monaco Editor
    monaco
        .init()
        .then((monacoInstance) => {
            const wrapper = document.getElementById("editor-child");
            const properties = {
                value: "",
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
            monacoInstance.editor.onDidCreateModel(handleEditor);
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

export default connect(null, { editorOnChange })(Editor);
