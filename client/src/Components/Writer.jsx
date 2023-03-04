/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Nav,
  CloseButton,
  ButtonGroup,
  Form,
} from "react-bootstrap";
import { Navigate } from "react-router-dom";

export default class Writer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      back: false,
      title: "",
      content: '',
      now: "",
    };
  }

  componentDidMount() {
    const title = window.location.pathname.match(/\/add\/(.+)/i)[1];
    const date = new Date();
    this.setState({
      title: title,
      now: `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
    });
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleBack = () => {
    this.setState({
      back: true,
    });
  };

  handleNewPost = async () => {
    const { title, content } = this.state;
    const token = localStorage.getItem("token");
    const pro = await fetch(`http://127.0.0.1:3001/post/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        firstContent: content
      }),
    });
    const res = await pro.json();
    if(res.success) alert('Post Created')
    this.setState({
      back: true
    })
  };

  render() {
    const { back, title, now } = this.state;
    return (
      <>
        {back ? (
          <Navigate to="/" />
        ) : (
          <>
            <div className="main-panel">
              <Card>
                <Card.Header>
                  <Nav>
                    <Nav.Item>
                      <ButtonGroup size="sm" id="btn-back">
                        <CloseButton onClick={this.handleBack} />
                      </ButtonGroup>
                    </Nav.Item>
                    <Nav.Item className="ms-auto post-title">{title}</Nav.Item>
                    <Nav.Item className="ms-auto post-timestamp">
                      {"Now:\n"}
                      <br />
                      {now}
                    </Nav.Item>
                  </Nav>
                </Card.Header>
                <Card.Body>
                  <Form.Control
                    as="textarea"
                    name="content"
                    rows={15}
                    placeholder={`First chapter of your post\nIt can be a short description...`}
                    onChange={this.handleChange}
                  ></Form.Control>
                </Card.Body>
              </Card>
            </div>
            <div className="float-submit">
              <Button variant="outline-primary" size="sm" onClick={this.handleNewPost}>
                Submit
              </Button>
            </div>
          </>
        )}
      </>
    );
  }
}
