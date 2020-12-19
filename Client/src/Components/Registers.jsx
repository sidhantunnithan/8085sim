import React, { Component } from "react";
import "./BodyStyles.css";

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
            hexNumber = decNumber.toString(16);
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
            hexNumber = e.target.value;
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
            hexNumber = decNumber.toString(16);
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
                    <tr>
                        <td>Accumulator</td>
                        <td className="register-value">00</td>
                    </tr>
                    <tr>
                        <td>B Register</td>
                        <td className="register-value">00</td>
                    </tr>
                    <tr>
                        <td>C Register</td>
                        <td className="register-value">00</td>
                    </tr>
                    <tr>
                        <td>D Register</td>
                        <td className="register-value">00</td>
                    </tr>
                    <tr>
                        <td>E Register</td>
                        <td className="register-value">00</td>
                    </tr>
                    <tr>
                        <td>H Register</td>
                        <td className="register-value">00</td>
                    </tr>
                    <tr>
                        <td>L Register</td>
                        <td className="register-value">00</td>
                    </tr>
                    <tr>
                        <td>Memory</td>
                        <td className="register-value">00</td>
                    </tr>
                </table>

                <table className="flag-registers">
                    <tr>
                        <td className="register-value">S</td>
                        <td className="register-value">Z</td>
                        <td className="register-value">AC</td>
                        <td className="register-value">P</td>
                        <td className="register-value">CY</td>
                    </tr>
                    <tr>
                        <td className="register-value">00</td>
                        <td className="register-value">00</td>
                        <td className="register-value">00</td>
                        <td className="register-value">00</td>
                        <td className="register-value">00</td>
                    </tr>
                </table>

                <table className="number-converter">
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
                </table>
            </div>
        );
    }
}

export default Registers;
