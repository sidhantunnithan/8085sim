import React, { Component } from "react";
import "./Styles/BodyStyles.scss";
import EntireMemoryView from "./MemoryViews/EntireMemoryView";
import LoadedMemoryView from "./MemoryViews/LoadedMemoryView";

export class Memory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memoryView: "entire-memory",
            jumpText: "",
            jumpTo: 0,
        };
    }

    onMemoryViewChange = (e) => {
        this.setState({
            memoryView: e.target.value,
        });
    };

    onJumpToChange = (e) => {
        var re = /^$|^([0-9A-F]){1,4}$/;
        if (!re.test(e.target.value.toUpperCase())) {
            return;
        }

        this.setState({
            jumpText: e.target.value.toUpperCase(),
        });
    };

    onJumpEnter = (e) => {
        if (e.key === "Enter") {
            this.setState({
                jumpText: ("0000" + e.target.value).slice(-4),
                jumpTo: parseInt("0000" + e.target.value.slice(0, -1), 16),
            });
        }
    };

    render() {
        return (
            <div className="memory-container">
                <div className="header">
                    <h1>Memory</h1>
                    {this.state.memoryView === "entire-memory" ? (
                        <input
                            type="text"
                            placeholder="Jump to"
                            value={this.state.jumpText}
                            onChange={this.onJumpToChange}
                            onKeyDown={this.onJumpEnter}
                        ></input>
                    ) : null}
                </div>

                {this.state.memoryView === "entire-memory" ? (
                    <EntireMemoryView jumpTo={this.state.jumpTo} />
                ) : (
                    <LoadedMemoryView />
                )}

                <div
                    className="memory-views"
                    onChange={this.onMemoryViewChange}
                >
                    <div className="radio-item">
                        <input
                            type="radio"
                            value="entire-memory"
                            name="memory-view"
                            checked={this.state.memoryView === "entire-memory"}
                        />
                        <label>Entire Memory</label>
                    </div>
                    <div className="radio-item">
                        <input
                            type="radio"
                            value="loaded-memory"
                            name="memory-view"
                            checked={this.state.memoryView === "loaded-memory"}
                        />
                        <label>Loaded Memory</label>
                    </div>
                </div>
            </div>
        );
    }
}

export default Memory;
