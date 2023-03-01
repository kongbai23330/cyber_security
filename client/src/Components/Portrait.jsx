/* eslint-disable no-unused-vars */
import React from "react";
import { Card, Button, Form, InputGroup, Row, Col } from "react-bootstrap";

export default class Protrait extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: null,
      firstContent: null
    }
  }

  componentDidMount = async() => {
    const { postId } = this.props
    const token = localStorage.getItem("token")
    const pro = await fetch(`http://127.0.0.1:3001/post/get/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
    const res = await pro.json()
    this.setState({
      title: res.post.title,
      firstContent: res.firstContent
    })
  }

  handleJump = () => {
    this.props.jump(this.props.postId)
  }

  render() {
    const { title, firstContent } = this.state
    const { postId } = this.props
    return (
      <div className="portrait-panel" id={postId} onClick={this.handleJump} >
        <Card>
          <Card.Header
            className="portrait-header"
            style={{
              paddingTop: 7.5,
              paddingRight: 20,
              paddingBottom: 5,
              paddingLeft: 15,
            }}
          >
            {title}
          </Card.Header>
          <Card.Body
            className="portrait-body"
            style={{
              paddingTop: 5,
              paddingRight: 10,
              paddingBottom: 5,
              paddingLeft: 10,
            }}
          >
            {firstContent}
          </Card.Body>
        </Card>
      </div>
    );
  }
}
