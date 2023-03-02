/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Nav,
  CloseButton,
  Form,
  ButtonGroup,
} from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Snippet from "./Snippet";
import Segment from "./Segment";

export default class Post extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      postId: null,
      vote: null,
      back: false,
      newRow: null,
      language: "raw",
      newContent: "",

      title: "Title",
      lastEdit: "2023/02/14 16:23",
      ups: 0,
      downs: 0,
      contents: [],
    };
  }

  componentDidMount = async () => {
    this.setState(
      () => {
        return {
          postId: window.location.pathname.match(/\/post\/(\d+)/)[1],
        };
      },
      async () => {
        const { postId } = this.state;
        const token = localStorage.getItem("token");
        const pro = await fetch(`http://127.0.0.1:3001/post/get/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const res = await pro.json();
        const { title, lastEdit, ups, downs } = res.post;
        const date = new Date(lastEdit);
        this.setState(
          () => {
            return {
              title: title,
              lastEdit: `${date.getFullYear()}/${
                date.getMonth() + 1
              }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
              ups: ups.length,
              downs: downs.length,
              vote: res.vote,
            };
          },
          async () => {
            const bucket = [];
            for (let i of res.post.contents) {
              const token = localStorage.getItem("token");
              const pro = await fetch(
                `http://127.0.0.1:3001/content/get/${i}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              const res = await pro.json();
              bucket.push(res.content);
            }
            this.setState({
              contents: bucket,
            });
          }
        );
      }
    );
  };

  handleBack = () => {
    this.setState({
      back: true,
    });
  };

  handleVote = async (e) => {
    const { name } = e.target;
    let vote;
    if (name === "up") vote = true;
    else vote = false;
    const { postId, ups, downs } = this.state;
    const token = localStorage.getItem("token");
    const pro = await fetch(`http://localhost:3001/post/vote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: postId,
        vote: true,
      }),
    });
    const res = await pro.json();
    if (!res.success) {
      return alert("Something went wrong");
    }
    if (vote)
      this.setState({
        ups: ups + 1,
        vote: vote,
      });
    else
      this.setState({
        downs: downs + 1,
        vote: vote,
      });
  };

  handleNewRow = (e) => {
    const { name } = e.target;
    if (name === "new-segment")
      this.setState({
        newRow: false,
        language: "raw",
      });
    else
      this.setState({
        newRow: true,
      });
  };

  handleCancle = () => {
    this.setState({
      newRow: null,
      newContent: "",
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmitNewContent = async () => {
    const { postId, newContent, language } = this.state;
    const token = localStorage.getItem("token");
    const pro = await fetch(`http://127.0.0.1:3001/post/push`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: postId,
        storage: newContent,
        language: language,
      }),
    });
    const res = await pro.json();
    if (res.success) {
      alert("Post content updated");
      this.setState({
        langauge: "raw",
        newContent: "",
      });
    }
  };

  render() {
    const {
      back,
      title,
      lastEdit,
      ups,
      downs,
      vote,
      contents,
      newRow,
      language,
      newContent,
    } = this.state;
    console.log("render", contents);
    return (
      <>
        {back ? (
          <Navigate to="/" />
        ) : (
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
                    {"Last Modified:\n"}
                    <br />
                    {lastEdit}
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <div className="post-rows">
                  {contents.map((content) => {
                    if (content.language === "raw")
                      return (
                        <Segment
                          storage={content.storage}
                          key={content.contentId}
                        />
                      );
                    else
                      return (
                        <Snippet
                          language={content.language}
                          storage={content.storage}
                          key={content.contentId}
                        />
                      );
                  })}
                </div>
                <div className="post-newrow">
                  {newRow === null && (
                    <ButtonGroup size="sm">
                      <Button
                        variant="link"
                        name="new-segment"
                        onClick={this.handleNewRow}
                        style={{ fontSize: 14 }}
                      >
                        New Segment
                      </Button>
                      <Button
                        variant="link"
                        name="new-snippet"
                        onClick={this.handleNewRow}
                        style={{ fontSize: 14 }}
                      >
                        New Snippet
                      </Button>
                    </ButtonGroup>
                  )}
                  {newRow === false && (
                    <div>
                      <Form.Control
                        name="newContent"
                        value={newContent}
                        as="textarea"
                        placeholder="Text here..."
                        onChange={this.handleChange}
                        style={{ fontSize: 15 }}
                      />
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          onClick={this.handleSubmitNewContent}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline-primary"
                          onClick={this.handleCancle}
                        >
                          Cancel
                        </Button>
                      </ButtonGroup>
                    </div>
                  )}
                  {newRow === true && (
                    <div>
                      <Form.Control
                        name="language"
                        value={language}
                        size="sm"
                        placeholder="language"
                        style={{ width: "110px", fontSize: 15 }}
                        onChange={this.handleChange}
                      />
                      <Form.Control
                        name="newContent"
                        value={newContent}
                        as="textarea"
                        placeholder="Type code here..."
                        style={{ fontSize: 15 }}
                        onChange={this.handleChange}
                      />
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          onClick={this.handleSubmitNewContent}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline-primary"
                          onClick={this.handleCancle}
                        >
                          Cancel
                        </Button>
                      </ButtonGroup>
                    </div>
                  )}
                </div>
              </Card.Body>
              <Card.Footer>
                <ButtonGroup>
                  {vote === null && (
                    <>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        name="up"
                        onClick={this.handleVote}
                      >
                        {ups}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        name="down"
                        onClick={this.handleVote}
                      >
                        {downs}
                      </Button>
                    </>
                  )}
                  {vote === true && (
                    <>
                      <Button size="sm" name="up">
                        {ups}
                      </Button>
                      <Button size="sm" variant="outline-primary" name="down">
                        {downs}
                      </Button>
                    </>
                  )}
                  {vote === false && (
                    <>
                      <Button size="sm" variant="outline-primary" name="up">
                        {ups}
                      </Button>
                      <Button size="sm" name="down">
                        {downs}
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </Card.Footer>
            </Card>
          </div>
        )}
      </>
    );
  }
}
