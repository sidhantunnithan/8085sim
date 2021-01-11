import React, { Component } from "react";
import { connect } from "react-redux";

export class LoadedMemoryView extends Component {
    render() {
        return (
            <div className="loaded-memory-view">
                <div className="loaded-child">
                    {Array.from(this.props.loadedMemory).map(([key, value]) => (
                        <div className="loaded-row">
                            <div className="loaded-column">{key}</div>
                            <div className="loaded-column">{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loadedMemory: state.memoryReducer.loadedMemory,
    };
};

export default connect(mapStateToProps)(LoadedMemoryView);
