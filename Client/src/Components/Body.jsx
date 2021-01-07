import React, { Component } from "react";
import { connect } from "react-redux";
import "./Styles/BodyStyles.scss";
import Registers from "./Registers";
import Editor from "./Editor";
import Assembled from "./Assembled";
import Memory from "./Memory";

export class Body extends Component {
    render() {
        return (
            <div className="body">
                <Registers />
                {this.props.editorView ? <Editor /> : <Assembled />}
                <Memory />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        editorView: state.bodyReducer.editorView,
    };
};

export default connect(mapStateToProps)(Body);
