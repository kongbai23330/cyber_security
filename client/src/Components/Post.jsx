/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Nav,
  CloseButton,
  Row,
  Col,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Snippet from "./Snippet";
import Segment from "./Segment";

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      postId: null,
      vote: null,
      back: false,
      title: "Title",
      lastEdit: "2023/02/14 16:23",
      ups: 0,
      downs: 0,
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
        const token = localStorage.getItem("token")
        const pro = await fetch(`http://127.0.0.1:3001/post/get/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        })
        const res = await pro.json()
        const { title, lastEdit, ups, downs } = res.post;
        const date = new Date(lastEdit);
        this.setState({
          title: title,
          lastEdit: `${date.getFullYear()}/${
            date.getMonth() + 1
          }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
          ups: ups.length,
          downs: downs.length,
          vote: res.vote,
        });
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

  render() {
    const { back, title, lastEdit, ups, downs, vote } = this.state;
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
                <Segment />
                <Snippet />
                <Segment />
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
                      <Button
                        size="sm"
                        variant="outline-primary"
                        name="down"
                      >
                        {downs}
                      </Button>
                    </>
                  )}
                  {vote === false && (
                    <>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        name="up"
                      >
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
