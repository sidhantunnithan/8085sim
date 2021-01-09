import React, { Component } from "react";
import { connect } from "react-redux";
import "../App.scss";
import { editorOnUpload } from "../Redux/Actions/editorOnChangeAction";
import { fileUploadPopup } from "../Redux/Actions/bodyOnChangeAction";

export class PopupWindow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dragging: false,
        };
    }

    dropRef = React.createRef();

    componentDidMount = () => {
        let div = this.dropRef.current;
        this.dragCounter = 0;
        div.addEventListener("dragenter", this.handleDragIn);
        div.addEventListener("dragleave", this.handleDragOut);
        div.addEventListener("dragover", this.handleDrag);
        div.addEventListener("drop", this.handleDrop);
        document.addEventListener("mousedown", this.handleClick);
    };

    componentWillUnmount() {
        let div = this.dropRef.current;
        div.removeEventListener("dragenter", this.handleDragIn);
        div.removeEventListener("dragleave", this.handleDragOut);
        div.removeEventListener("dragover", this.handleDrag);
        div.removeEventListener("drop", this.handleDrop);
        document.removeEventListener("mousedown", this.handleClick);
    }

    handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({ dragging: true });
        }
    };

    handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter--;
        if (this.dragCounter === 0) {
            this.setState({ dragging: false });
        }
    };

    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        var fileReader = new FileReader();

        fileReader.addEventListener("load", (e) => {
            console.log(e);
            this.props.editorOnUpload(e.target.result);
        });

        if (!e.dataTransfer.files.length === 1) {
        } else if (
            !e.dataTransfer.files[0].name.endsWith(".asm") &&
            !e.dataTransfer.files[0].name.endsWith(".txt")
        ) {
        } else {
            fileReader.readAsText(e.dataTransfer.files[0]);
        }
    };

    handleBrowseFiles = (e) => {
        const link = document.createElement("input");
        link.type = "file";
        link.name = "inputFile";
        link.id = "inputFile";

        link.addEventListener("change", (e) => {
            var fileReader = new FileReader();

            fileReader.addEventListener("load", (e) => {
                this.props.editorOnUpload(e.target.result);
            });

            if (!e.target.files.length === 1) {
                alert("Please upload only one file");
            } else if (
                !e.target.files[0].name.endsWith(".asm") &&
                !e.target.files[0].name.endsWith(".txt")
            ) {
                alert("Please upload a .asm or a .txt file");
            } else {
                fileReader.readAsText(e.target.files[0]);
            }
        });

        link.click();
    };

    handleClick = (e) => {
        if (this.dropRef && !this.dropRef.current.contains(e.target)) {
            this.props.fileUploadPopup();
        }
    };

    render() {
        return (
            <div
                ref={this.dropRef}
                id="fileUploadWindow"
                className="fileUploadWindow"
            >
                <div
                    className={
                        this.state.dragging
                            ? "inner-window bright"
                            : "inner-window"
                    }
                >
                    <div className="desc">
                        <i className="fas fa-cloud-upload-alt"></i>
                    </div>

                    <div className="desc">Drag & Drop Here</div>
                    <div className="desc">or</div>
                    <div className="desc">
                        <div
                            className="browse-button"
                            onClick={this.handleBrowseFiles}
                        >
                            Browse Files
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(null, { editorOnUpload, fileUploadPopup })(PopupWindow);
