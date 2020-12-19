import React, { Component } from "react";
import "./BodyStyles.css";
import InfiniteScroll from "react-infinite-scroll-component";

export class Memory extends Component {
    constructor(props) {
        super(props);

        this.memoryArray = new Array(65535).fill(0).map((i) => {
            return new Array(15).fill(0);
        });
    }

    render() {
        return (
            <div className="memory-container">
                <h1>Memory</h1>
            </div>
        );
    }

    fullMemoryView = () => {};
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
