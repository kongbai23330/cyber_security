import React from "react";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RBNav from "./Components/RBNav";
import Index from "./Components/Index";
import Profile from "./Components/Profile";
import Protrait from "./Components/Portrait";

class App extends React.Component {

  render() {
    return (
      <>
      <Router>
        <RBNav />
        <Routes>
        <Route path="/" exact element={<Index />} />
        {/* /profile/:userId; /post/:postid */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/post/:postid" element={<p>post</p>} />
        <Route path="/test" element={<Protrait />} />
        </Routes>
      </Router>
  
      </>
    );
  }
}

export default App;
