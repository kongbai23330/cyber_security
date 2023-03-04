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

export default class Commenter extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      comments: []
    }
  }

  componentDidMount = async() => {
    const token = localStorage.getItem("token");
    const { postId } = this.props
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
      const pro = await fetch(
        `http://localhost:3001/comment/get/${i}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const res = await pro.json();
      bucket.push(res.comment);
    }
    this.setState({
      comments: bucket
    })
  }

  render() {
    const { comments } = this.state
    return(
      <>
      {comments.map((comment, index) => <p key={index}>{comment.content}</p>)}
      </>
    )
  }
}
