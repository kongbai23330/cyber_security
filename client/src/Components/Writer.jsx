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
      content: "",
      now: "",
    };
  }
  componentDidMount() {
    // Get the title from the URL
    const title = window.location.pathname.match(/\/add\/(.+)/i)[1];
    // Get the current date and time
    const date = new Date();
    const formattedDate = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    this.setState({
      title: title,
      now: formattedDate,
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
    // Check if the post has at least one chapter
    if (content.replace(/\s/g, "").length === 0)
      return alert("A post must have something as first chapter");
    const token = localStorage.getItem("token");
    // fetch to create new post
    const pro = await fetch(`http://127.0.0.1:3001/post/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        firstContent: content,
      }),
    });
    const res = await pro.json();
    if (res.success) alert("Post Created");
    // Set the state to go back to the previous page
    this.setState({
      back: true,
    });
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
                    <Nav.Item className="ms-auto post-title">{decodeURI(title)}</Nav.Item>
                    <Nav.Item className="ms-auto post-timestamp">
                      {"Now:\n"}
                      <br />
                      {now}
                    </Nav.Item>
                  </Nav>
                </Card.Header>
                <Card.Body>
                  <Form.Control
                    id="first"
                    as="textarea"
                    name="content"
                    rows={15}
                    placeholder={`First chapter of your post\nIt can be a short description...`}
                    style={{ fontSize: 16 }}
                    onChange={this.handleChange}
                  ></Form.Control>
                </Card.Body>
              </Card>
            </div>
            <div className="float-submit">
              <Button
                id="submit"
                variant="outline-success"
                size="sm"
                onClick={this.handleNewPost}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="bi bi-send"
                  viewBox="0 0 16 16"
                  style={{ pointerEvents: "none" }}
                >
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                </svg>
              </Button>
            </div>
          </>
        )}
      </>
    );
  }
}
