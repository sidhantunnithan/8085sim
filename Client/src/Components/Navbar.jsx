import React, { Component } from "react";
import { connect } from "react-redux";
import "./Styles/NavBarStyles.scss";
import store from "../Redux/store";
import Logo from "../res/logo.png";
import { navbarOnChange } from "../Redux/Actions/navbarOnChange";

export class Navbar extends Component {
    constructor(props) {
        super(props);
    }

    handleProjectName = (e) => {
        this.props.navbarOnChange(e.target.value);
    };

    handleRunClick = (e) => {};

    handleSaveClick = (e) => {
        const blob = store.getState().editorReducer.editorText;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "test.asm");
        link.click();
        window.URL.revokeObjectURL(link.href);
    };

    handleEnter = (e) => {
        if (e.keyCode === 13) {
            document.activeElement.blur();
            return;
        }
    };

    handleBlur = (e) => {
        if (e.target.value == "") {
            this.props.navbarOnChange("Untitled");
        }
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
                                    <i className="fas fa-pen"></i>
                                </li>
                                <li className="projectAuthor">Sidhant</li>
                            </ul>
                        </li>
                    </ul>
                    <ul className="navbar-tail">
                        <li
                            className="navbar-item"
                            onClick={this.handleRunClick}
                        >
                            <i className="fas fa-play"></i>
                            Run
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

export default connect(mapStateToProps, { navbarOnChange })(Navbar);
