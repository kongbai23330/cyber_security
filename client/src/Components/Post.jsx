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
import Commenter from "./Commenter";
import Author from "./Author";
import { Divider } from "./Divider";
import "./Post.css"
// overall post page rather complex :(
export default class Post extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      postId: null,
      userId: null,
      vote: null,
      back: false,
      modify: false,
      remove: false,
      newRow: null,
      language: "raw",
      newContent: "",

      poster: null,
      avatar: null,

      title: "Title",
      lastEdit: "2023/02/14 16:23",
      ups: 0,
      downs: 0,
      contents: [],
    };
  }

  componentDidMount = async () => {
    const token = localStorage.getItem("token");
    // If the token exists, fetch the user's profile information
    if (token) {
      const pro = await fetch("https://localhost:3001/profile/info", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const res = await pro.json();
      // Set the component's state with the user's ID
      this.setState({
        userId: res.userId,
      });
    }
    // Fetch the post details
    this.fetchPostDetail();
  };

  // fetch all necessary info when load and reload
  fetchPostDetail = async () => {
    // Set the postId state to the postId parsed from the URL
    this.setState(
      () => {
        return {
          postId: window.location.pathname.match(/\/post\/(\d+)/)[1],
        };
      },
      // callback after postId set
      async () => {
        const { postId } = this.state;
        let url;
        if (this.state.userId)
          url = `https://localhost:3001/post/get/${postId}/${this.state.userId}`;
        else url = `https://localhost:3001/post/get/${postId}/1`;
        const pro = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await pro.json();
        // extract required post details from response
        const { title, userId, lastEdit, ups, downs } = res.post;
        const date = new Date(lastEdit);
        this.setState(
          () => {
            return {
              title: title,
              poster: userId,
              lastEdit: `${date.getFullYear()}/${
                date.getMonth() + 1
              }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
              ups: ups.length,
              downs: downs.length,
              vote: res.vote,
            };
          },
          async () => {
            // load at callback after state set
            // using a bucket storing all posts detail in case of error
            const bucket = [];
            for (let i of res.post.contents) {
              const token = localStorage.getItem("token");
              const pro = await fetch(
                `https://localhost:3001/content/get/${i}`,
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
            // set the contents and loading state
            this.setState({
              contents: bucket,
              loading: false,
            });
          }
        );
      }
    );
  };

  handleClick = async (e) => {
    const { postId, userId, poster } = this.state; // Get relevant state variables
    const { name } = e.target; // Get the name of the clicked button
    const token = localStorage.getItem("token");
    // Check if the user has permission to perform the action
    if (userId !== poster && userId !== 0 && name !== "back") {
      return alert("You have no permission to do so");
    }
    // If the "remove" button is clicked, send a DELETE request to the server
    if (name === "remove") {
      const pro = await fetch(`https://localhost:3001/post/delete/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await pro.json();
      if (res.success) alert("Post deleted");
      else return alert(res.errno);
    }
    // Set the state variable with the name of the clicked button to true
    this.setState({
      [name]: true,
    });
  };

  handleVote = async (e) => {
    // If the user is not logged in, show an alert message and return
    if (!localStorage.getItem("token")) return alert("You must login first");
    const { name } = e.target;
    // Set the value of the vote (true for upvote, false for downvote)
    let vote;
    if (name === "up") vote = true;
    else vote = false;
    // Get the post ID, number of upvotes, and number of downvotes from the state
    const { postId, ups, downs } = this.state;
    const token = localStorage.getItem("token");
    // Send a POST request to the server to submit the vote
    const pro = await fetch("https://localhost:3001/post/vote", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: postId,
        vote: vote,
      }),
    });
    const res = await pro.json();
    if (!res.success) return alert("Something went wrong");
    // If the vote was an upvote, update the state to reflect the new number of upvotes and the fact that the user has upvoted
    if (vote)
      this.setState({
        ups: ups + 1,
        vote: vote,
      });
    // If the vote was a downvote, update the state to reflect the new number of downvotes and the fact that the user has downvoted
    else
      this.setState({
        downs: downs + 1,
        vote: vote,
      });
  };

  handleNewRow = (e) => {
    const { name } = e.target;
    // check if user is logged in
    if (!localStorage.getItem("token")) return alert("You must login first");
    // if name is 'new-segment', set state to add new row with language set to 'raw'
    if (name === "new-segment")
      this.setState({
        newRow: false,
        language: "raw",
      });
    // else set state to add new row with language set to current state value
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
    // Send a POST request to the server to add the new content
    const pro = await fetch(`https://localhost:3001/post/push`, {
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
    // If the content was successfully added, update the state and fetch the post details again
    if (res.success) {
      alert("Post content updated");
      this.setState({
        langauge: "raw",
        newContent: "",
        newRow: null,
      });
      this.fetchPostDetail();
    } else {
      // If there was an error, display an error message
      alert("Something went wrong");
    }
  };

  render() {
    const {
      back,
      loading,
      modify,
      remove,
      poster,
      postId,
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
    return (
      <>
        {/* redirect to other pages */}
        {back && <Navigate to="/" />}
        {modify && <Navigate to={`/post/modify/${postId}`} />}
        {remove && <Navigate to="/" />}
        <>
          <div className="main-panel">
            <Card>
              <Card.Header>
                <Nav>
                  <Nav.Item>
                    <ButtonGroup
                      size="sm"
                      id="btn-back"
                      style={{ backgroundColor: "#deeff5" }}
                    >
                      <CloseButton
                        name="back"
                        onClick={this.handleClick}
                        style={{ backgroundColor: "#deeff5" }}
                      />
                    </ButtonGroup>
                  </Nav.Item>
                  {/* decode from uri form, from %20 to whitespace */}
                  <Nav.Item className="ms-auto post-title">
                    {decodeURI(title)}
                  </Nav.Item>
                  <Nav.Item className="ms-auto post-timestamp">
                    {"Last Modified:\n"}
                    <br />
                    {lastEdit}
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body style={{ backgroundColor: "#deeff5" }}>
                {/* render author bar after done loading */}
                {!loading && <Author authorId={poster} />}
                <Divider />
                <div className="post-rows">
                  {contents.map((content) => {
                    // render segment/snippet respectively for languages
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
                  {/* render different input respectively when click different button */}
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
                          variant="outline-success"
                          onClick={this.handleSubmitNewContent}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-send"
                            viewBox="0 0 16 16"
                          >
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                          </svg>
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={this.handleCancle}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-x-circle"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                          </svg>
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
                        rows={5}
                        value={newContent}
                        as="textarea"
                        placeholder="Type code here..."
                        style={{ fontSize: 15 }}
                        onChange={this.handleChange}
                      />
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-success"
                          onClick={this.handleSubmitNewContent}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-send"
                            viewBox="0 0 16 16"
                          >
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                          </svg>
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={this.handleCancle}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-x-circle"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                          </svg>
                        </Button>
                      </ButtonGroup>
                    </div>
                  )}
                  <Divider />
                  {/* render comment area after loaded */}
                  {!loading && <Commenter postId={postId} />}
                </div>
              </Card.Body>
              <Card.Footer></Card.Footer>
            </Card>
          </div>
          {/* float bar for votes, modify and delete */}
          <div className="float-post">
            <ButtonGroup>
              {vote === null && (
                <>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    name="up"
                    onClick={this.handleVote}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-hand-thumbs-up-fill"
                      viewBox="0 0 16 16"
                      style={{ pointerEvents: "none" }}
                    >
                      <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
                    </svg>{" "}
                    {ups}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    name="down"
                    onClick={this.handleVote}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-hand-thumbs-down-fill"
                      viewBox="0 0 16 16"
                      style={{ pointerEvents: "none" }}
                    >
                      <path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.378 1.378 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.896 1.896 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2.094 2.094 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.823 4.823 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591z" />
                    </svg>{" "}
                    {downs}
                  </Button>
                </>
              )}
              {vote === true && (
                <>
                  <Button size="sm" name="up">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-hand-thumbs-up"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                    </svg>{" "}
                    {ups}
                  </Button>
                  <Button size="sm" variant="outline-primary" name="down">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-hand-thumbs-down-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.378 1.378 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.896 1.896 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2.094 2.094 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.823 4.823 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591z" />
                    </svg>{" "}
                    {downs}
                  </Button>
                </>
              )}
              {vote === false && (
                <>
                  <Button size="sm" variant="outline-primary" name="up">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-hand-thumbs-up-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
                    </svg>{" "}
                    {ups}
                  </Button>
                  <Button size="sm" name="down">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-hand-thumbs-down"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a8.912 8.912 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.224 2.224 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.866.866 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1z" />
                    </svg>{" "}
                    {downs}
                  </Button>
                </>
              )}
            </ButtonGroup>{" "}
            <ButtonGroup size="sm">
              <Button
                id="modify"
                variant="outline-warning"
                name="modify"
                onClick={this.handleClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-pencil-square"
                  viewBox="0 0 16 16"
                  style={{ pointerEvents: "none" }}
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path
                    fillRule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                  />
                </svg>
              </Button>
              <Button
                id="remove"
                variant="outline-danger"
                name="remove"
                onClick={this.handleClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-trash"
                  viewBox="0 0 16 16"
                  style={{ pointerEvents: "none" }}
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                  <path
                    fillRule="evenodd"
                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                  />
                </svg>
              </Button>
            </ButtonGroup>
          </div>
        </>
      </>
    );
  }
}
