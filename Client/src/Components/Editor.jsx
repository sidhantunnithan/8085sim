import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { monaco } from "@monaco-editor/react";

import "./Styles/BodyStyles.scss";
import SIM_LANG from "./EditorConfig/language";
import SIM_THEME from "./EditorConfig/theme";
import { editorOnChange } from "../Redux/Actions/editorOnChangeAction";
import { bodyOnChange } from "../Redux/Actions/bodyOnChangeAction";
import { getAssembledInstructions } from "./Processing/assembler";

export const Editor = (props) => {
    const [large, setLarge] = useState(0);
    var editorRef = useRef();

    window.addEventListener("resize", handleEditorWidth);

    // Save a reference to the editor
    // editorRef will be used to get the value later
    function handleEditor(editor) {
        editorRef = editor;
        editorRef.onDidChangeContent(handleContentChange);
    }

    // handle 4K displays
    function handleEditorWidth() {
        if (window.innerWidth >= 2560) setLarge(1);
        else setLarge(0);
    }

    // Change the state whenever content of the editor changes
    function handleContentChange(e) {
        props.editorOnChange(editorRef.getValue());
    }

    // Change editor view
    function onViewChange(e) {
        props.bodyOnChange(!props.editorView, editorRef.getValue());
    }

    // Handle Formatter of Editor
    function onFormat(model, options, token) {
        var instructionArray = getAssembledInstructions(
            model
                .getValue()
                .replace(/[\r\n\t]+/gm, " ")
                .split(" ")
        );
        console.log(instructionArray);

        var formattedString = "";
        instructionArray.instructions.map((value, index) => {
            if (value.endsWith(":")) {
                formattedString += value + "\n";
            } else {
                formattedString += "\t\t" + value + "\n";
            }
        });

        console.log(formattedString);

        return [
            {
                range: {
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: model.getLineCount() + 1,
                    endColumn: 1,
                },
                text: formattedString,
            },
        ];
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
                fontSize: large === 1 ? "28px" : "16px",
                automaticLayout: true,
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
            monacoInstance.languages.registerDocumentFormattingEditProvider(
                "sim-lang",
                {
                    provideDocumentFormattingEdits: onFormat,
                }
            );
            monacoInstance.editor.defineTheme("sim-dark", SIM_THEME);
            monacoInstance.editor.onDidCreateModel(handleEditor);
            monacoInstance.editor.create(wrapper, properties);
        })
        .then(() => {
            editorRef.setValue(props.editorDisappearText);
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
                <i className="fas fa-table" onClick={onViewChange}></i>
            </div>
            <div id="editor-child" className="editor-child"></div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        editorView: state.bodyReducer.editorView,
        editorDisappearText: state.bodyReducer.editorDisappearText,
    };
};

export default connect(mapStateToProps, {
    editorOnChange,
    bodyOnChange,
})(Editor);
