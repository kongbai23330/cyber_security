/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Dropdown,
} from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import Protrait from "./Portrait";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      title: "",
      posts: [],
      jump: null,
      add: null,
    };
  }

  componentDidMount = async () => {
    const token = localStorage.getItem("token");
    this.setState({
      loading: true,
    });
    const pro = await fetch("http://localhost:3001/post/last", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    this.setState({
      posts: res.posts.map((post) => post.postId),
      loading: false,
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
    this.setState({
      loading: true,
    });
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
      loading: false,
      title: "",
    });
  };

  loadMore = async () => {
    this.setState({
      loading: true,
    });
  };

  handleJump = (postId) => {
    this.setState({
      jump: postId,
    });
  };

  handleAdd = () => {
    const { title } = this.state;
    if (title)
      this.setState({
        add: true,
      });
    else alert("Title is required");
  };

  render() {
    const { posts, title, jump, add } = this.state;
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
                  posts.map((post) => (
                    <Protrait postId={post} key={post} jump={this.handleJump} />
                  ))
                )}
              </Card.Body>
              <Card.Footer className="text-center">
                {this.state.loading ? (
                  <Spinner animation="border" variant="primary" size="sm" />
                ) : (
                  // <Button
                  //   size="sm"
                  //   variant="outline-primary"
                  //   onClick={this.loadMore}
                  // >
                  //   Load more
                  // </Button>
                  <></>
                )}
              </Card.Footer>
            </Card>
          </div>
        </>
      </>
    );
  }
}
