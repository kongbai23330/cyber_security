import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Index from "./Components/Index";
import './App.css';

class App extends React.Component {

  render() {
    return (
      <>
      <Router>
        <div>
          <nav>
            <Link to="/">Index</Link>
          </nav>
          <Routes>
          <Route path="/" exact element={<></>} />
          <Route path="/book/:bookName" element={<></>} />
          </Routes>
        </div>
      </Router>
  
      </>
    );
  }
}

export default App;
