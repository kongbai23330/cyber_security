import React from "react";
import { Card } from "react-bootstrap";

// component render posts portrait at index page
export default class Protrait extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: null,
      firstContent: null,
    };
  }

  componentDidMount = async () => {
    // Destructure postId from props
    const { postId } = this.props;
    const token = localStorage.getItem("token");
    // Send a GET request to the server to get the post with the given ID
    const pro = await fetch(`https://localhost:3001/post/get/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    // Update the component state with the post title and first content
    this.setState({
      title: res.post.title,
      firstContent: res.firstContent,
    });
  };

  handleJump = () => {
    this.props.jump(this.props.postId);
  };

  render() {
    const { title, firstContent } = this.state;
    const { postId } = this.props;
    return (
      <div className="portrait-panel" id={postId} onClick={this.handleJump}>
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
            {decodeURI(title)}
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
            {decodeURI(firstContent)}
          </Card.Body>
        </Card>
      </div>
    );
  }
}
