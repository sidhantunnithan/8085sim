import React, { Component } from "react";
import { connect } from "react-redux";
import "./Styles/BodyStyles.scss";
import { registerReset } from "../Redux/Actions/registerOnChangeAction";

export class Registers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dec: "",
            hex: "",
            bin: "",
        };
    }

    onRegisterReset = (e) => {
        this.props.registerReset();
    };

    // Utility functions :
    // handleDecChange -> change in the decimal text field
    // handleHexChange -> change in the hex text field
    // handleBinChange -> change in the binary text field

    handleDecChange = (e) => {
        var decNumber;
        var hexNumber;
        var binNumber;

        var re = /^$|^([0-9]){1,5}$/;
        if (!re.test(e.target.value)) {
            return;
        }

        if (e.target.value.length === 0) {
            decNumber = "";
            hexNumber = "";
            binNumber = "";
        } else {
            decNumber = parseInt(e.target.value);
            hexNumber = decNumber.toString(16).toUpperCase();
            binNumber = (decNumber >>> 0).toString(2);
        }

        this.setState({
            dec: "" + decNumber,
            hex: "" + hexNumber,
            bin: "" + binNumber,
        });
    };

    handleHexChange = (e) => {
        var decNumber;
        var hexNumber;
        var binNumber;

        var re = /^$|^([0-9A-F]){1,4}$/;
        if (!re.test(e.target.value.toUpperCase())) {
            return;
        }

        if (e.target.value.length === 0) {
            decNumber = "";
            hexNumber = "";
            binNumber = "";
        } else {
            decNumber = parseInt(e.target.value, 16);
            hexNumber = e.target.value.toUpperCase();
            binNumber = (decNumber >>> 0).toString(2);
        }

        this.setState({
            dec: "" + decNumber,
            hex: "" + hexNumber,
            bin: "" + binNumber,
        });
    };

    handleBinChange = (e) => {
        var re = /^$|^([0-1]){1,12}$/;
        if (!re.test(e.target.value)) {
            return;
        }

        var decNumber;
        var hexNumber;
        var binNumber;

        if (e.target.value.length === 0) {
            decNumber = "";
            hexNumber = "";
            binNumber = "";
        } else {
            decNumber = parseInt(e.target.value, 2);
            hexNumber = decNumber.toString(16).toUpperCase();
            binNumber = e.target.value;
        }

        this.setState({
            dec: "" + decNumber,
            hex: "" + hexNumber,
            bin: "" + binNumber,
        });
    };

    render() {
        return (
            <div className="registers-container">
                <div className="header">
                    <h1>Registers</h1>
                    <i
                        className="fas fa-sync"
                        onClick={this.onRegisterReset}
                    ></i>
                </div>
                <table className="primary-registers">
                    <tbody>
                        <tr>
                            <td>Accumulator</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.A}
                            </td>
                        </tr>
                        <tr>
                            <td>B Register</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.B}
                            </td>
                        </tr>
                        <tr>
                            <td>C Register</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.C}
                            </td>
                        </tr>
                        <tr>
                            <td>D Register</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.D}
                            </td>
                        </tr>
                        <tr>
                            <td>E Register</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.E}
                            </td>
                        </tr>
                        <tr>
                            <td>H Register</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.H}
                            </td>
                        </tr>
                        <tr>
                            <td>L Register</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.L}
                            </td>
                        </tr>
                        <tr>
                            <td>Memory</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.M}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className="special-registers">
                    <tbody>
                        <tr>
                            <td>Program Counter</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.PC}
                            </td>
                        </tr>
                        <tr>
                            <td>Stack Pointer</td>
                            <td className="register-value">
                                {this.props.primaryRegisters.SP}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className="flag-registers">
                    <tbody>
                        <tr>
                            <td className="register-value">S</td>
                            <td className="register-value">Z</td>
                            <td className="register-value">AC</td>
                            <td className="register-value">P</td>
                            <td className="register-value">CY</td>
                        </tr>
                        <tr>
                            <td className="register-value">
                                {this.props.flagRegisters.S}
                            </td>
                            <td className="register-value">
                                {this.props.flagRegisters.Z}
                            </td>
                            <td className="register-value">
                                {this.props.flagRegisters.AC}
                            </td>
                            <td className="register-value">
                                {this.props.flagRegisters.P}
                            </td>
                            <td className="register-value">
                                {this.props.flagRegisters.CY}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className="number-converter">
                    <tbody>
                        <tr>
                            <td className="register-value register-label">
                                Dec
                            </td>
                            <td className="register-value register-label">
                                Hex
                            </td>
                            <td className="register-value register-label">
                                Bin
                            </td>
                        </tr>
                        <tr>
                            <td className="register-value">
                                <input
                                    type="text"
                                    value={this.state.dec}
                                    onChange={this.handleDecChange}
                                />
                            </td>
                            <td className="register-value">
                                <input
                                    type="text"
                                    value={this.state.hex}
                                    onChange={this.handleHexChange}
                                />
                            </td>
                            <td className="register-value">
                                <input
                                    type="text"
                                    value={this.state.bin}
                                    onChange={this.handleBinChange}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        primaryRegisters: state.registerReducer.primaryRegisters,
        flagRegisters: state.registerReducer.flagRegisters,
    };
};

export default connect(mapStateToProps, { registerReset })(Registers);
