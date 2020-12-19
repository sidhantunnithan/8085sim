import "./App.css";
import "./Components/Navbar";
import Navbar from "./Components/Navbar";
import Body from "./Components/Body";

function App() {
    return (
        <div className="global-container">
            <Navbar />
            <Body />
        </div>
    );
}

export default App;
