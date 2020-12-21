import React, { Component } from "react";
import "./Styles/BodyStyles.scss";
import EntireMemoryView from "./MemoryViews/EntireMemoryView";

export class Memory extends Component {
    constructor(props) {
        super(props);

        this.memoryArray = new Array(65535).fill(0).map((i) => {
            return new Array(16).fill(0);
        });

        this.state = {
            memory: this.memoryArray,
            memoryView: "entire-memory",
            visible: 0,
        };
    }

    onMemoryViewChange = (e) => {
        this.setState({
            memoryView: e.target.value,
        });
    };

    render() {
        return (
            <div className="memory-container">
                <div className="header">
                    <h1>Memory</h1>
                    {this.state.memoryView === "entire-memory" ? (
                        <input type="text" placeholder="Jump to"></input>
                    ) : null}
                </div>

                {this.state.memoryView === "entire-memory" ? (
                    <EntireMemoryView
                        memory={this.state.memory}
                        visible={this.state.visible}
                    />
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

const LoadedMemoryView = (props) => {
    return <div className=""></div>;
};

export default Memory;
