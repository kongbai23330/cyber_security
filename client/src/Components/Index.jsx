/* eslint-disable no-unused-vars */
import React from "react";
import { Card, Button, Form, InputGroup, ButtonGroup } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Protrait from "./Portrait";

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

  componentDidMount = async () => {
    const token = localStorage.getItem("token");
    const pro = await fetch("http://localhost:3001/post/last", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
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

  searchOnClick = async () => {
    const { title } = this.state;
    const token = localStorage.getItem("token");
    let url,
      search = title.replace(/\s/g, "");
    if (!search) url = "http://localhost:3001/post/last";
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
                    Search
                  </Button>
                  <Button variant="outline-primary" onClick={this.handleAdd}>
                    Add
                  </Button>
                </InputGroup>
              </Card.Header>
              <Card.Body>
                {posts.length === 0 ? (
                  <p>No matched result</p>
                ) : (
                  posts.map((post, index) => {
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
                <ButtonGroup size="sm">
                  <Button
                    name="prev"
                    variant="outline-primary"
                    onClick={this.handlePageChange}
                  >
                    Prev
                  </Button>
                  <Button>{page}</Button>
                  <Button
                    name="next"
                    variant="outline-primary"
                    onClick={this.handlePageChange}
                  >
                    Next
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
