import React, { Component } from "react";

import "./NavBarStyles.css";
import Logo from "../res/logo.png";

export class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectName: "Untitled",
            styles: {
                width: "80px",
            },
        };
    }

    handleProjectName = (e) => {
        var newWidth = (e.target.value.length + 3) * 8;
        newWidth = newWidth > 176 ? 176 : newWidth;
        this.setState({
            projectName: e.target.value,
            styles: {
                width: newWidth + "px",
            },
        });
    };

    handleEnter = (e) => {
        if (e.keyCode === 13) {
            e.keyCode = 9;
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
                                        value={this.state.projectName}
                                        onChange={this.handleProjectName}
                                        onKeyDown={this.handleEnter}
                                        style={this.state.styles}
                                    />
                                    <i className="fas fa-pen"></i>
                                </li>
                                <li className="projectAuthor">Sidhant</li>
                            </ul>
                        </li>
                    </ul>
                    <ul className="navbar-tail">
                        <li className="navbar-item">
                            <i className="fas fa-play"></i>
                            Run
                        </li>
                        <li className="navbar-item">
                            <i className="fas fa-save"></i>
                            Save
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default Navbar;
