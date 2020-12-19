import React, { Component } from "react";
import "./BodyStyles.css";
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
