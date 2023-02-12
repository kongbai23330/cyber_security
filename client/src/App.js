import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Index from "./Components/Index";
import RBNav from "./Components/RBNav";
import './App.css';

class App extends React.Component {

  render() {
    return (
      <>
      <Router>
        <div>
          <RBNav />
          <nav>
            <Link to="/">Index</Link>
          </nav>
          <Routes>
          <Route path="/" exact element={<Index />} />
          <Route path="/book/:bookName" element={<></>} />
          </Routes>
        </div>
      </Router>
  
      </>
    );
  }
}

export default App;
