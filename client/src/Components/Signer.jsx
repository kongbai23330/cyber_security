/* eslint-disable no-unused-vars */
import React from "react";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import { Navigate } from "react-router-dom";

export default class Signer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      signUp: false,
      username: "",
      password: "",
      bio: "",
      confirm: "",
    };
  }

  renderSignUp = async () => {
    const { username, password } = this.state;
    if (username.length < 6) return alert("Username at least 6 characters");
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[~`!@#$%^&*()-_+={}[]|\\;:"<>,\.\/\?]/.test(password)
    )
      return alert("Password not strong enough");
    const pro = await fetch("http://localhost:3001/user/validate/" + username);
    const res = await pro.json();
    if (res.exists) return alert("Username already exists");
    this.setState({
      signUp: true,
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  postSignUp = async () => {
    const { username, password, bio, confirm } = this.state;
    if (password !== confirm) {
      this.setState({
        signUp: false,
      });
      return alert("Repeated password not match");
    }
    const pro = await fetch("http://localhost:3001/user/signup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        bio: bio,
      }),
    });
    const res = await pro.json();
    if (!res.success) return alert("Something went wrong");
    this.setState({
      signUp: false,
    });
    return alert("Sign up success");
  };

  handleSignIn = async () => {
    const pro = await fetch("http://localhost:3001/user/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    });
    const res = await pro.json();
    if (!res.success) {
      this.setState({
        password: ''
      })
      return alert(res.errno);
    }
    localStorage.setItem("token", res.token);
    this.setState(
      () => {
        return { login: true };
      },
      () => {
        this.props.updateBasic();
      }
    );
    alert("Login Successful");
  };

  render() {
    const { username, password, bio, confirm, login } = this.state;
    return (
      <>
        {login ? (
          <Navigate to="/" />
        ) : (
          <div className="main-panel">
            <Card>
              <Card.Body>
                {this.state.signUp ? (
                  <>
                    <InputGroup size="sm">
                      <Form.Control
                        value={username}
                        placeholder="Username"
                        disabled
                      />
                      <Form.Control
                        type="password"
                        value={password}
                        placeholder="Password"
                        disabled
                      />
                      <Button
                        variant="outline-primary"
                        onClick={this.postSignUp}
                      >
                        Sign Up
                      </Button>
                    </InputGroup>
                    <br />
                    <InputGroup size="sm">
                      <InputGroup.Text>
                        Shortly decribe yourself..
                      </InputGroup.Text>
                      <Form.Control
                        as="textarea"
                        name="bio"
                        value={bio}
                        placeholder="Shortly decribe yourself.."
                        onChange={this.handleChange}
                      />
                    </InputGroup>
                    <br />
                    <InputGroup size="sm">
                      <InputGroup.Text>Repeat password</InputGroup.Text>
                      <Form.Control
                        type="password"
                        size="sm"
                        name="confirm"
                        value={confirm}
                        onChange={this.handleChange}
                      />
                    </InputGroup>
                  </>
                ) : (
                  <>
                    <InputGroup size="sm">
                      <Form.Control
                        name="username"
                        value={username}
                        onChange={this.handleChange}
                        placeholder="Username"
                        autoComplete="off"
                      />
                      <Form.Control
                        type="password"
                        name="password"
                        value={password}
                        onChange={this.handleChange}
                        placeholder="Password"
                      />
                      <Button
                        variant="outline-primary"
                        onClick={this.handleSignIn}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline-primary"
                        onClick={this.renderSignUp}
                      >
                        Sign Up
                      </Button>
                    </InputGroup>
                  </>
                )}
              </Card.Body>
            </Card>
          </div>
        )}
      </>
    );
  }
}
