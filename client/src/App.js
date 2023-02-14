import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RBNav from "./Components/RBNav";
import Index from "./Components/Index";
import Profile from "./Components/Profile";
import Post from "./Components/Post";
import Signer from "./Components/Signer";

class App extends React.Component {
  render() {
    return (
      <>
        <Router>
          <RBNav />
          <Routes>
            <Route path="/" exact element={<Index />} />
            {/* /profile/:userId */}
            <Route path="/post/:postid" element={<p>post</p>} />
            <Route path="/sign" element={<Signer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/test" element={<Post />} />
          </Routes>
        </Router>
      </>
    );
  }
}

export default App;
