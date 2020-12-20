import React, { Component } from "react";
import "./Styles/BodyStyles.scss";
import Registers from "./Registers";
import Editor from "./Editor";
import Memory from "./Memory";

export class Body extends Component {
    render() {
        return (
            <div className="body">
                <Registers />
                <Editor />
                <Memory />
            </div>
        );
    }
}

export default Body;
