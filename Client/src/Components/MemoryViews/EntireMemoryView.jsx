import React, { Component } from "react";
import { connect } from "react-redux";
import "../Styles/BodyStyles.scss";

export class EntireMemoryView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: 0,
        };
    }

    // Load visible memory
    componentWillReceiveProps(nextProps) {
        var vis = Math.floor(nextProps.jumpTo / 16) * 16;
        this.setState({ visible: vis });
    }

    // Handle right button clicked
    onRightNav = () => {
        this.setState({
            visible: this.state.visible + 16,
        });
    };

    // Handle left button clicked
    onLeftNav = () => {
        this.setState({
            visible: this.state.visible - 16,
        });
    };

    render() {
        var starting = this.state.visible;
        var ending = starting + 15;

        return (
            <div className="entire-memory-view">
                <div className="grid">
                    <div className="grid-element"></div>
                    <div className="grid-element grid-bold">0</div>
                    <div className="grid-element grid-bold">1</div>
                    <div className="grid-element grid-bold">2</div>
                    <div className="grid-element grid-bold">3</div>
                    <div className="grid-element grid-bold">4</div>
                    <div className="grid-element grid-bold">5</div>
                    <div className="grid-element grid-bold">6</div>
                    <div className="grid-element grid-bold">7</div>
                    <div className="grid-element grid-bold">8</div>
                    <div className="grid-element grid-bold">9</div>
                    <div className="grid-element grid-bold">A</div>
                    <div className="grid-element grid-bold">B</div>
                    <div className="grid-element grid-bold">C</div>
                    <div className="grid-element grid-bold">D</div>
                    <div className="grid-element grid-bold">E</div>
                    <div className="grid-element grid-bold">F</div>

                    {this.props.memory
                        .slice(starting, ending + 1)
                        .map((row, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <div className="grid-element grid-bold">
                                        {(
                                            "000" +
                                            (this.state.visible + index)
                                                .toString(16)
                                                .toUpperCase()
                                        ).slice(-3) + "0"}
                                    </div>
                                    {row.map((value, i) => {
                                        return (
                                            <div
                                                key={i}
                                                className="grid-element"
                                            >
                                                {("0" + value).slice(-2)}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                </div>

                <div className="navigation">
                    {this.state.visible > 0 ? (
                        <i
                            className="fas fa-chevron-left"
                            onClick={this.onLeftNav}
                        ></i>
                    ) : (
                        <i className="fas fa-chevron-left disabled"></i>
                    )}

                    <div className="current">
                        {("0000" + starting.toString(16))
                            .slice(-3)
                            .toUpperCase() + "0"}{" "}
                        -&nbsp;
                        {("0000" + ending.toString(16))
                            .slice(-3)
                            .toUpperCase() + "F"}
                    </div>

                    {this.state.visible !== 4080 ? (
                        <i
                            className="fas fa-chevron-right"
                            onClick={this.onRightNav}
                        ></i>
                    ) : (
                        <i className="fas fa-chevron-right disabled"></i>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        memory: state.memoryReducer.memory,
        visible: ownProps.jumpTo,
    };
};

export default connect(mapStateToProps)(EntireMemoryView);
