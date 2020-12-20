import React, { Component } from "react";
import "./BodyStyles.scss";

export class Memory extends Component {
    constructor(props) {
        super(props);

        this.memoryArray = new Array(65535).fill(0).map((i) => {
            return new Array(15).fill(0);
        });

        this.state = {
            memory: this.memoryArray.slice(0, 150),
        };
    }

    render() {
        return (
            <div className="memory-container">
                <h1>Memory</h1>
            </div>
        );
    }
}

const LoadedMemoryView = (props) => {
    return (
        <table>
            {props.memory.map((row) => {
                return (
                    <tr>
                        {row.map((value) => {
                            return <td>{value}</td>;
                        })}
                    </tr>
                );
            })}
        </table>
    );
};

export default Memory;
