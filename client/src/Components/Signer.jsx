import React from "react";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import { Navigate } from "react-router-dom";

// render login and signup page
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
    // Check if the entered username has at least 6 characters; if not, display an error message and return
    if (username.length < 6) return alert("Username at least 6 characters");
    // Check if the entered password meets the following criteria:
    // - Has at least 8 characters
    // - Contains at least one lowercase letter
    // - Contains at least one uppercase letter
    // - Contains at least one digit
    // - Contains at least one special character
    // If not, display an error message and return
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[~`!@#$%^&*()-_+={}[\]|\\;:"<>,./?]/.test(password)
    ) {
      return alert("Password not strong enough");
    }
    // Send a GET request to the server to check if the entered username already exists
    const pro = await fetch("https://localhost:3001/user/validate/" + username);
    const res = await pro.json();
    // If the server indicates that the username already exists, display an error message and return
    if (res.exists) return alert("Username already exists");
    // If all validations pass, update the component's state to indicate that the user is signing up
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
    // Destructure the 'username', 'password', 'bio', and 'confirm' values from the component's state object
    const { username, password, bio, confirm } = this.state;
    // Check if the entered password matches the 'confirm' field; if not, display an error message, update the state, and return
    if (password !== confirm) {
      this.setState({
        signUp: false,
      });
      return alert("Repeated password not match");
    }
    // Send a POST request to the server to create a new user account with the entered information
    const pro = await fetch("https://localhost:3001/user/signup/", {
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
    // If the server indicates that the account creation was unsuccessful, display an error message and return
    if (!res.success) return alert("Something went wrong");
    // If the account creation was successful, update the component's state to indicate that the user is no longer signing up, display a success message, and return
    this.setState({
      signUp: false,
    });
    return alert("Sign up success");
  };

  handleSignIn = async () => {
    // Send a POST request to the server
    const pro = await fetch("https://localhost:3001/user/signin", {
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
    // If the response indicates an error, reset the password field and display an error message
    if (!res.success) {
      this.setState({
        password: "",
      });
      return alert(res.errno);
    }
    localStorage.setItem("token", res.token);
    this.setState(
      () => {
        return { login: true };
      },
      // callback after set state
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
                        id="username"
                        value={username}
                        placeholder="Username"
                        disabled
                      />
                      <Form.Control
                        id="password"
                        type="password"
                        value={password}
                        placeholder="Password"
                        disabled
                      />
                      <Button
                        id="signup"
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
                        rows={1}
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
                        id="username"
                        name="username"
                        value={username}
                        onChange={this.handleChange}
                        placeholder="Username"
                        autoComplete="off"
                      />
                      <Form.Control
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={this.handleChange}
                        placeholder="Password"
                      />
                      <Button
                        id="signin"
                        variant="outline-primary"
                        onClick={this.handleSignIn}
                      >
                        Sign In
                      </Button>
                      <Button
                        id="signup"
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
