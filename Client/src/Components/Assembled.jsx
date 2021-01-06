import React, { Component } from "react";
import { connect } from "react-redux";
import { bodyOnChange } from "../Redux/Actions/bodyOnChangeAction";
import { stepLabel } from "../Redux/Actions/assembledOnChangeAction";

export class Assembled extends Component {
    constructor(props) {
        super(props);
    }

    // Change editor view
    onViewChange = (e) => {
        this.props.bodyOnChange(
            !this.props.editorView,
            this.props.editorDisappearText
        );
    };

    // Handle run forward
    onStepForward = (e) => {
        this.props.stepLabel(this.props.labelIndex + 1);
    };

    // Handle run backward
    onStepBackward = (e) => {
        this.props.stepLabel(this.props.labelIndex - 1);
    };

    render() {
        return (
            <div className="assembled-container">
                <div className="header">
                    <h1>Assembled</h1>
                    <i className="fas fa-code" onClick={this.onViewChange}></i>
                </div>
                <div className="assembled-child">
                    <div className="assembled-table">
                        {this.props.instructions.map((value, index) => {
                            return (
                                <div
                                    className={
                                        this.props.labelIndex === index
                                            ? "assembled-row coloured"
                                            : "assembled-row"
                                    }
                                    key={index}
                                >
                                    {value.endsWith(":") ? (
                                        <React.Fragment>
                                            <div className="assembled-labels">
                                                {value}
                                            </div>
                                            <div className="assembled-instructions">
                                                {
                                                    this.props.instructions[
                                                        index + 1
                                                    ]
                                                }
                                            </div>
                                        </React.Fragment>
                                    ) : (
                                        <React.Fragment>
                                            {index === 0 ||
                                            !this.props.instructions[
                                                index - 1
                                            ].endsWith(":") ? (
                                                <React.Fragment>
                                                    <div className="assembled-labels"></div>
                                                    <div className="assembled-instructions">
                                                        {value}
                                                    </div>
                                                </React.Fragment>
                                            ) : (
                                                <React.Fragment></React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="assembled-navigation">
                    {this.props.labelIndex < 0 ? (
                        <div className="navigation-button disabled">
                            <i className="fas fa-step-backward"></i>
                        </div>
                    ) : (
                        <div
                            className="navigation-button"
                            onClick={this.onStepBackward}
                        >
                            <i className="fas fa-step-backward"></i>
                        </div>
                    )}

                    <div className="navigation-button">
                        <i className="fas fa-play"></i>
                    </div>

                    {this.props.labelIndex >= this.props.instructions.length ? (
                        <div className="navigation-button disabled">
                            <i className="fas fa-step-forward"></i>
                        </div>
                    ) : (
                        <div
                            className="navigation-button"
                            onClick={this.onStepForward}
                        >
                            <i className="fas fa-step-forward"></i>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        editorView: state.bodyReducer.editorView,
        editorDisappearText: state.bodyReducer.editorDisappearText,
        instructions: state.memoryReducer.instructions,
        labelIndex: state.assembledReducer.labelIndex,
    };
};

export default connect(mapStateToProps, { bodyOnChange, stepLabel })(Assembled);
