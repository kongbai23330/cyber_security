import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RBNav from "./Components/RBNav";
import Index from "./Components/Index";
import Profile from "./Components/Profile";
import Post from "./Components/Post";
import Signer from "./Components/Signer";
import Writer from "./Components/Writer";
import Modifier from "./Components/Modifier";
import { P404 } from "./Components/404";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signed: false,
      username: null,
      avatar: null,
      bio: null,
    };
  }

  // Method to load the user's basic profile information from the server
  loadBasic = async () => {
    const token = localStorage.getItem("token");
    const pro = await fetch("https://localhost:3001/profile/info", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    // Update the component's state with the loaded information
    this.setState({
      signed: true,
      username: res.username,
      avatar: res.avatar,
      bio: res.bio,
    });
  };

  // Method called when the component is mounted, which loads the user's basic profile information
  componentDidMount = () => {
    this.loadBasic();
  };

  // Method to update the user's basic profile information
  updateBasic = () => {
    this.loadBasic();
  };

  // Method called when the user signs out, which clears the component's state and removes the token from local storage
  handleSignOut = async () => {
    localStorage.removeItem("token");
    // Update the component's state to reflect that the user is no longer signed in
    this.setState({
      signed: false,
      username: null,
      avatar: null,
      bio: null,
    });
  };

  render() {
    // Destructure relevant values from the component's state
    const { signed, username, avatar } = this.state;
    return (
      <>
        {/* Set up the React Router */}
        <Router>
          {/* Render a navigation bar component with various props */}
          <RBNav
            signed={signed}
            username={username}
            avatar={avatar}
            handleSignOut={this.handleSignOut}
            updateBasic={this.updateBasic}
          />
          {/* Define the routes and their corresponding components */}
          <Routes>
            
            <Route
              path="/sign"
              element={<Signer updateBasic={this.updateBasic} />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/post/add/:title" element={<Writer />} />
            <Route path="/post/:postid" element={<Post />} />
            <Route path="/post/modify/:postid" element={<Modifier />} />
            <Route path="*" element={<P404 />} />
            <Route path="/" exact element={<Index />} />
          </Routes>
        </Router>
      </>
    );
  }
}

export default App;
