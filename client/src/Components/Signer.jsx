/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Form,
  Button,
  Nav,
  ButtonGroup,
  InputGroup,
} from "react-bootstrap";

export default class Signer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signUp: false,
      username: "",
      password: "",
      bio: "",
      confirm: ""
    };
  }

  renderSignUp = () => {
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

  postSignUp = () => {
    console.log("register")
    // fetch ...
  }

  render() {
    const { username, password, bio, confirm } = this.state;
    return (
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
                  <Button variant="outline-primary" onClick={this.postSignUp}>
                    Sign Up
                  </Button>
                </InputGroup>
                <br />
                <InputGroup size="sm">
                  <InputGroup.Text>Shortly decribe yourself..</InputGroup.Text>
                  <Form.Control as="textarea" name="bio" value={bio} placeholder="Shortly decribe yourself.." onChange={this.handleChange} />
                </InputGroup>                
                <br />
                <InputGroup size="sm">
                  <InputGroup.Text>Repeat password</InputGroup.Text>
                  <Form.Control type="password" size="sm" name="confirm" value={confirm} onChange={this.handleChange} />
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
                  />
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={this.handleChange}
                    placeholder="Password"
                  />
                  <Button variant="outline-primary">
                    Sign In
                  </Button>
                  <Button variant="outline-primary" onClick={this.renderSignUp}>
                    Sign Up
                  </Button>
                </InputGroup>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  }
}
