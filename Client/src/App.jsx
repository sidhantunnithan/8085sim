import React, { Component } from "react";
import { connect } from "react-redux";
import "./App.scss";
import Navbar from "./Components/Navbar";
import Body from "./Components/Body";
import PopupWindow from "./Components/PopupWindow.jsx";

export class App extends Component {
    render() {
        return (
            <React.Fragment>
                {this.props.popupView ? (
                    <div className="popupView">
                        <PopupWindow />
                    </div>
                ) : null}
                <div className="global-container">
                    <Navbar />
                    <Body />
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        popupView: state.bodyReducer.popupView,
    };
};

export default connect(mapStateToProps)(App);
