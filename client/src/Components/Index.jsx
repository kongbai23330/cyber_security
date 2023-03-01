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
      search: "",
      posts: [],
      jump: null,
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
    const { search } = this.state;
    const token = localStorage.getItem("token");
    this.setState({
      loading: true,
    });
    let url,
      title = search.replace(/\s/g, "");
    if (!title) url = "http://localhost:3001/post/last";
    else url = "http://localhost:3001/post/query/" + search;
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

  render() {
    const { posts, search, jump } = this.state;
    return (
      <>
        {jump ? (
          <Navigate to={`/post/${jump}`} />
        ) : (
          <>
            <div className="main-panel">
              <Card>
                <Card.Header>
                  <InputGroup>
                    <Form.Control
                      size="sm"
                      placeholder="Search for a post..."
                      name="search"
                      value={search}
                      onChange={this.searchOnChange}
                      autoComplete="off"
                    ></Form.Control>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={this.searchOnClick}
                    >
                      Search
                    </Button>
                  </InputGroup>
                </Card.Header>
                <Card.Body>
                  {posts.length === 0 ? (
                    <p>No matched result</p>
                  ) : (
                    posts.map((post) => (
                      <Protrait
                        postId={post}
                        key={post}
                        jump={this.handleJump}
                      />
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
        )}
      </>
    );
  }
}
