import React, { Component } from "react";
import { connect } from "react-redux";
import "./Styles/BodyStyles.scss";
import EntireMemoryView from "./MemoryViews/EntireMemoryView";
import LoadedMemoryView from "./MemoryViews/LoadedMemoryView";
import {
    memoryOnReset,
    memoryOnStep,
} from "../Redux/Actions/memoryOnChangeAction";

export class Memory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memoryView: "entire-memory",
            jumpText: "",
            jumpTo: 0,
        };
    }

    // Switch views between entire memory and loaded memory
    onMemoryViewChange = (e) => {
        this.setState({
            memoryView: e.target.value,
        });
    };

    onMemoryReset = (e) => {
        this.props.memoryOnReset();
    };

    // Handle Jump To Address input field
    onJumpToChange = (e) => {
        var re = /^$|^([0-9A-F]){1,4}$/;
        if (!re.test(e.target.value.toUpperCase())) {
            return;
        }

        this.setState({
            jumpText: e.target.value.toUpperCase(),
        });
    };

    // Handle Enter button pressed on Jump To Address input field
    onJumpEnter = (e) => {
        if (e.key === "Enter") {
            this.props.memoryOnStep(
                Math.floor(
                    parseInt("0000" + e.target.value.slice(0, -1), 16) / 16
                ) * 16
            );
        }
    };

    render() {
        return (
            <div className="memory-container">
                <div className="header">
                    <h1>Memory</h1>
                    {this.state.memoryView === "entire-memory" ? (
                        <div className="header-tail">
                            <i
                                className="fas fa-sync"
                                onClick={this.onMemoryReset}
                            ></i>
                            <input
                                type="text"
                                placeholder="Jump to"
                                value={this.state.jumpText}
                                onChange={this.onJumpToChange}
                                onKeyDown={this.onJumpEnter}
                            ></input>
                        </div>
                    ) : null}
                </div>

                {this.state.memoryView === "entire-memory" ? (
                    <EntireMemoryView />
                ) : (
                    <LoadedMemoryView />
                )}

                <div className="memory-views">
                    <div className="radio-item">
                        <input
                            type="radio"
                            value="entire-memory"
                            name="memory-view"
                            checked={this.state.memoryView === "entire-memory"}
                            onChange={this.onMemoryViewChange}
                        />
                        <label>Entire Memory</label>
                    </div>
                    <div className="radio-item">
                        <input
                            type="radio"
                            value="loaded-memory"
                            name="memory-view"
                            checked={this.state.memoryView === "loaded-memory"}
                            onChange={this.onMemoryViewChange}
                        />
                        <label>Loaded Memory</label>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(null, { memoryOnReset, memoryOnStep })(Memory);
