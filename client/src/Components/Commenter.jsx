import React from "react";
import { Card, Button, Figure, Form, InputGroup } from "react-bootstrap";

// render comment area for post page
export default class Commenter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      writing: false,
      writer: "",
      comments: [],
    };
  }

  // loading and reload the page
  fetchCommentsDetail = async () => {
    const token = localStorage.getItem("token");
    const { postId } = this.props;
    // firstly get post related info
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
      // no further operation if no comments exists in case of error
      if (!res.comment) return false;
      // fetch for comment poster's username...
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
      if (info.avatar) {
        // fetch comment poster's avatar
        const fetchAva = await fetch(
          `http://localhost:3001/profile/getava/${avatar}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const jsonAva = await fetchAva.json();
        res.comment.avatar = jsonAva.avatar;
      }
      bucket.push(res.comment);
    }
    // set state and reload page
    this.setState({
      comments: bucket,
      loading: false,
    });
  };

  componentDidMount = async () => {
    this.fetchCommentsDetail();
  };

  // start writing comment, render input
  handleStartWriting = () => {
    if (!localStorage.getItem("token")) return alert("You must login first");
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

  // submit written comment
  handleSubmitComment = async () => {
    const token = localStorage.getItem("token");
    const pro = await fetch(`http://localhost:3001/comment/write`, {
      method: "POST",
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
    if (res.success) alert("Comment attached");
    this.fetchCommentsDetail();
    this.setState({
      writing: false,
      writer: "",
    });
  };

  render() {
    const { loading, comments, writing, writer } = this.state;
    return (
      <>
        {loading ? (
          <>Loading...</>
        ) : (
          <>
            {/* render fetched comments on by one */}
            {comments.map((comment, index) => {
              // loading unix millis to readable format
              const date = new Date(comment.lastEdit);
              const lastEdit = `${date.getFullYear()}/${
                date.getMonth() + 1
              }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
              let url;
              // loading avatar buffer to blob
              if (comment.avatar) {
                const blob = new Blob(
                  [new Uint8Array(comment.avatar.buffer.data)],
                  {
                    type: comment.avatar.mimeType,
                  }
                );
                url = URL.createObjectURL(blob);
              }
              return (
                <Card
                  key={index}
                  style={{ padding: "0 10px", marginBottom: 15 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: 1,
                      marginTop: 10,
                    }}
                  >
                    {/* only render if avatar exists in case of error */}
                    {comment.avatar && (
                      <Figure.Image
                        src={url}
                        height={80}
                        width={80}
                        style={{ marginRight: "10px", objectFit: "cover" }}
                      />
                    )}
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
                        <p style={{ marginRight: "auto" }}>
                          {comment.username}
                        </p>
                        <p
                          style={{
                            marginLeft: "auto",
                            fontSize: 12,
                            color: "rgba(0, 0, 0, 0.5)",
                          }}
                        >
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
                        <p style={{ flex: 1, fontSize: 16 }}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {/* if write commented unclicked render button, or render input */}
            {writing ? (
              <>
                <InputGroup size="sm">
                  <Form.Control
                    as="textarea"
                    rows={1}
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
                    padding: "5px 10px",
                  }}
                  onClick={this.handleStartWriting}
                >
                  Write Comment
                </Button>
              </>
            )}
          </>
        )}
      </>
    );
  }
}
