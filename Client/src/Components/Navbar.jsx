import React, { Component } from "react";
import { connect } from "react-redux";

import "./Styles/NavBarStyles.scss";
import store from "../Redux/store";
import Logo from "../res/logo.png";
import { navbarOnChange } from "../Redux/Actions/navbarOnChange";
import { memoryOnInit } from "../Redux/Actions/memoryOnChangeAction";
import { getAssembledInstructions } from "./Processing/assembler";

export class Navbar extends Component {
    // Set state when project name is changed
    handleProjectName = (e) => {
        this.props.navbarOnChange(e.target.value);
    };

    // Call API and set state with response
    handleAssemblyClick = (e) => {
        var payload = getAssembledInstructions(
            store
                .getState()
                .editorReducer.editorText.replace(/[\r\n\t]+/gm, " ")
                .toUpperCase()
                .split(" ")
        );

        this.props.memoryOnInit({
            byteCodes: payload.byteCodes,
            instructions: payload.instructions,
        });
    };

    // Generate a new <a> tag and
    // click it
    handleSaveClick = (e) => {
        const blob = store.getState().editorReducer.editorText;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${this.props.filename}.asm`);
        link.click();
        window.URL.revokeObjectURL(link.href);
    };

    // Move text field out of focus on enter
    handleEnter = (e) => {
        if (e.keyCode === 13) {
            document.activeElement.blur();
            return;
        }
    };

    // Handling empty text field
    handleBlur = (e) => {
        if (e.target.value === "") {
            this.props.navbarOnChange("Untitled");
        }
    };

    // Handle clicking on the pencil icon
    handleOnPencilClick = (e) => {
        document.getElementById("project-name-input").select();
    };

    render() {
        return (
            <div className="navbar">
                <div className="navbar-items">
                    <ul className="navbar-head">
                        <li className="navbar-item">
                            <div className="logo-container">
                                <img
                                    src={Logo}
                                    alt="8085 Sim"
                                    className="logo"
                                />
                            </div>
                        </li>
                        <li className="navbar-item">
                            <ul className="projDetails">
                                <li className="projectName">
                                    <input
                                        type="text"
                                        id="project-name-input"
                                        value={this.props.filename}
                                        onChange={this.handleProjectName}
                                        onKeyDown={this.handleEnter}
                                        onBlur={this.handleBlur}
                                        style={{
                                            width: `${
                                                (this.props.filename.length +
                                                    3) *
                                                    8 >
                                                176
                                                    ? 176
                                                    : (this.props.filename
                                                          .length +
                                                          3) *
                                                      8
                                            }px`,
                                        }}
                                    />
                                    <i
                                        className="fas fa-pen"
                                        onClick={this.handleOnPencilClick}
                                    ></i>
                                </li>
                                <li className="projectAuthor">8085sim</li>
                            </ul>
                        </li>
                    </ul>
                    <ul className="navbar-tail">
                        <li
                            className="navbar-item"
                            onClick={this.handleAssemblyClick}
                        >
                            <i className="fas fa-play"></i>
                            Assemble
                        </li>
                        <li
                            className="navbar-item"
                            onClick={this.handleSaveClick}
                        >
                            <i className="fas fa-save"></i>
                            Save
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        filename: state.navbarReducer.filename,
    };
};

export default connect(mapStateToProps, { memoryOnInit, navbarOnChange })(
    Navbar
);
