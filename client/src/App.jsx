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
  constructor(props) {
    super(props)
    this.state = {
      signed: false,
      username: null,
      avatar: null,
      bio: null
    }
  }

  loadBasic = async() => {
    const token = localStorage.getItem("token")
    const pro = await fetch('http://localhost:3001/profile/info', {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    const res = await pro.json()
    this.setState({
      signed: true,
      username: res.username,
      avatar: res.avatar,
      bio: res.bio
    })
  }

  componentDidMount = () => {
    this.loadBasic()
  }

  updateBasic = () => {
    this.loadBasic()
  }

  handleSignOut = async() => {
    localStorage.removeItem("token")
    this.setState({
      signed: false,
      username: null,
      avatar: null,
      bio: null
    })
  }

  render() {
    const { signed, username, avatar } = this.state
    return (
      <>
        <Router>
          <RBNav
          signed={signed} username={username} avatar={avatar}
          handleSignOut={this.handleSignOut}
          updateBasic={this.updateBasic}
          />
          <Routes>
            <Route path="/" exact element={<Index />} />
            <Route path="/sign" element={<Signer updateBasic={this.updateBasic} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/post/:postid" element={<Post />} />
            <Route path="/post/add/:title" element={<p>muli</p>} />
            <Route path="*" element={<h1>404: NOT THE PAGE YOU ARE LOOKING FOR</h1>} />
          </Routes>
        </Router>
      </>
    );
  }
}

export default App;
