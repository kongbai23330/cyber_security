import React from "react";
import { Card, Button, Form, InputGroup, ButtonGroup } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Protrait from "./Portrait";

// index page of the app
export default class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      posts: [],
      jump: null,
      add: null,
      page: 1,
    };
  }

  // fetch for existing posts
  componentDidMount = async () => {
    const token = localStorage.getItem("token");
    const pro = await fetch("http://localhost:3001/post/last", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    // for each post only load postId for futher info fetching
    // return a list of postIds
    this.setState({
      posts: res.posts.map((post) => post.postId),
    });
  };

  searchOnChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  // handle searching
  searchOnClick = async () => {
    const { title } = this.state;
    const token = localStorage.getItem("token");
    // ensure not error if user only input whitespace
    let url,
      search = title.replace(/\s/g, "");
    // if input is empty or only have white space reload all posts
    if (!search) url = "http://localhost:3001/post/last";
    // otherwise fetch for matched posts
    else url = `http://localhost:3001/post/query/${search}`;
    const pro = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    this.setState({
      posts: res.posts.map((post) => post.postId),
      title: "",
    });
  };

  // handle page jump, some check login
  handleJump = (postId) => {
    this.setState({
      jump: postId,
    });
  };

  handleAdd = () => {
    if (!localStorage.getItem("token")) return alert("Login is required");
    const { title } = this.state;
    if (title)
      this.setState({
        add: true,
      });
    else alert("Title is required");
  };

  // calculate for page range, prevent user operation if page < 1 or > last page
  handlePageChange = (e) => {
    const { page, posts } = this.state;
    const { name } = e.target;
    if (name === "prev") {
      if (page === 1) return alert("You are already on the first page");
      this.setState({
        page: page - 1,
      });
    } else {
      if (page >= Math.ceil(posts.length / 10))
        return alert("You are already on the last page");
      this.setState({
        page: page + 1,
      });
    }
  };

  render() {
    const { posts, title, jump, add, page } = this.state;
    return (
      <>
        {/* redirecting to other pages */}
        {jump && <Navigate to={`/post/${jump}`} />}
        {add && <Navigate to={`/post/add/${title}`} />}
        <>
          <div className="main-panel">
            <Card>
              <Card.Header>
                <InputGroup size="sm">
                  <Form.Control
                    placeholder="Enter a post title..."
                    name="title"
                    value={title}
                    onChange={this.searchOnChange}
                    autoComplete="off"
                  ></Form.Control>
                  <Button
                    variant="outline-primary"
                    onClick={this.searchOnClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-search"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                  </Button>
                  <Button variant="outline-primary" onClick={this.handleAdd}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-file-earmark-plus"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z" />
                      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
                    </svg>
                  </Button>
                </InputGroup>
              </Card.Header>
              <Card.Body>
                {/* if no post exists */}
                {posts.length === 0 ? (
                  <p>No matched result</p>
                ) : (
                  posts.map((post, index) => {
                    // only render posts in the page area
                    if (index < (page - 1) * 10 || index > (page - 1) * 10 + 9)
                      return null;
                    return (
                      <Protrait
                        postId={post}
                        key={post}
                        jump={this.handleJump}
                      />
                    );
                  })
                )}
              </Card.Body>
              <Card.Footer className="text-center">
                {/* pager */}
                <ButtonGroup size="sm">
                  <Button
                    name="prev"
                    variant="outline-primary"
                    onClick={this.handlePageChange}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-caret-left"
                      viewBox="0 0 16 16"
                    >
                      <path d="M10 12.796V3.204L4.519 8 10 12.796zm-.659.753-5.48-4.796a1 1 0 0 1 0-1.506l5.48-4.796A1 1 0 0 1 11 3.204v9.592a1 1 0 0 1-1.659.753z" />
                    </svg>
                  </Button>
                  <Button variant="outline-primary" disabled>
                    {page}
                  </Button>
                  <Button
                    name="next"
                    variant="outline-primary"
                    onClick={this.handlePageChange}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-caret-right"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z" />
                    </svg>
                  </Button>
                </ButtonGroup>
              </Card.Footer>
            </Card>
          </div>
        </>
      </>
    );
  }
}
