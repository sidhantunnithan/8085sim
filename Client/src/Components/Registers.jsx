import React, { Component } from "react";
import { connect } from "react-redux";
import "./Styles/BodyStyles.scss";

export class Registers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dec: "",
            hex: "",
            bin: "",
        };
    }

    handleDecChange = (e) => {
        if (isNaN(e.target.value)) {
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
        if (isNaN(e.target.value)) {
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
                <h1>Registers</h1>
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
                            <td className="register-value">Dec</td>
                            <td className="register-value">Hex</td>
                            <td className="register-value">Bin</td>
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

export default connect(mapStateToProps)(Registers);
