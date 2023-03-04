/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Figure,
  CloseButton,
  Form,
  ButtonGroup,
  InputGroup,
} from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Sample from "../Public/sample.jpg";

export default class Commenter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      writing: false,
      writer: "",
      comments: [],
    };
  }

  fetchCommentsDetail = async() => {
    const token = localStorage.getItem("token");
    const { postId } = this.props;
    const pro = await fetch(`http://localhost:3001/post/get/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    const bucket = [];
    for (let i of res.post.comments) {
      const token = localStorage.getItem("token");
      const pro = await fetch(`http://localhost:3001/comment/get/${i}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await pro.json();
      if(!res.comment) return false
      const data = await fetch(
        `http://localhost:3001/profile/basic/${res.comment.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const info = await data.json();
      const { username, avatar } = info;
      res.comment.username = username;
      res.comment.avatar = avatar;
      bucket.push(res.comment);
    }
    this.setState({
      comments: bucket,
    });
  }

  componentDidMount = async () => {
    this.fetchCommentsDetail()
  };

  handleStartWriting = () => {
    this.setState({
      writing: true,
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmitComment = async () => {
    const token = localStorage.getItem("token");
    const pro = await fetch(`http://localhost:3001/comment/write`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: this.props.postId,
        content: this.state.writer,
      }),
    });
    const res = await pro.json();
    if(res.success) alert('Comment attached')
    this.fetchCommentsDetail()
    this.setState({
      writing: false,
      writer: ''
    })
  };

  render() {
    const { comments, writing, writer } = this.state;
    return (
      <>
        {comments.map((comment, index) => {
          const date = new Date(comment.lastEdit);
          const lastEdit = `${date.getFullYear()}/${
            date.getMonth() + 1
          }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
          return (
            <Card key={index} style={{ padding: "0 10px", marginBottom: 15 }}>
              <div style={{ display: "flex", alignItems: "center", flex: 1, marginTop: 10 }}>
                <Figure.Image
                  src={Sample}
                  height={80}
                  width={80}
                  style={{ marginRight: "10px", objectFit: "cover" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <p style={{ marginRight: "auto" }}>{comment.username}</p>
                    <p style={{ marginLeft: "auto", fontSize: 12, color: 'rgba(0, 0, 0, 0.5)' }}>
                      {lastEdit}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ flex: 1, fontSize: 16 }}>{comment.content}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {writing ? (
          <>
            <InputGroup size="sm">
              <Form.Control
                as='textarea' rows={1}
                name="writer"
                value={writer}
                placeholder="Type your comment here..."
                onChange={this.handleChange}
              />
              <Button onClick={this.handleSubmitComment}>Comment</Button>
            </InputGroup>
          </>
        ) : (
          <>
            <Button
              variant="link"
              style={{
                textAlign: "left",
                fontSize: 14,
                padding: '5px 10px',
              }}
              onClick={this.handleStartWriting}
            >
              Write Comment
            </Button>
          </>
        )}
      </>
    );
  }
}
