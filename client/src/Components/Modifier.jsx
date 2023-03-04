/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Nav,
  CloseButton,
  Form,
  ButtonGroup,
  InputGroup,
} from "react-bootstrap";
import { Navigate } from "react-router-dom";

export default class Modify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      back: false,
      now: "",
      title: "",
      postId: null,
      contents: [],
    };
  }

  fetchPostDetail = async () => {
    this.setState(
      () => {
        return {
          postId: window.location.pathname.match(/\/modify\/(\d+)/)[1],
        };
      },
      async () => {
        const { postId } = this.state;
        const token = localStorage.getItem("token");
        const pro = await fetch(`http://127.0.0.1:3001/post/get/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const res = await pro.json();
        const { title } = res.post;
        this.setState(
          () => {
            return {
              title: title,
            };
          },
          async () => {
            const bucket = [];
            for (let i of res.post.contents) {
              const token = localStorage.getItem("token");
              const pro = await fetch(
                `http://127.0.0.1:3001/content/get/${i}`,
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
            this.setState({
              contents: bucket,
            });
          }
        );
      }
    );
  };

  componentDidMount() {
    const date = new Date();
    this.setState({
      now: `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
    });
    this.fetchPostDetail();
  }

  handleBack = () => {
    this.setState({
      back: true,
    });
  };

  contentScheduler = (index, updated) => {
    const contents = [...this.state.contents];
    contents[index].storage = updated;
    this.setState({
      contents: contents,
    });
  };

  languageScheduler = (index, updated) => {
    const contents = [...this.state.contents];
    contents[index].language = updated;
    this.setState({
      contents: contents,
    });
  }

  contentRemover = (index) => {
    const contents = [...this.state.contents];
    contents.splice(index, 1);
    this.setState({
      contents: contents,
    });
  };

  handlePostUpdate = async() => {
    const { contents, postId } = this.state;
    const token = localStorage.getItem('token')
    const contentId = contents.map(content => content.contentId)
    console.log(contentId, contents);
    const pro = await fetch('http://localhost:3001/post/update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        contents,
        contentId
      })
    })
    const res = await pro.json()
    if(res.success) alert('Successfully updated')
    else alert(res.errno)
  }

  render() {
    const { back, postId, now, title, contents } = this.state;
    return (
      <>
        {back && <Navigate to={`/post/${postId}`} />}
        <div className="main-panel">
          <Card>
            <Card.Header>
              <Nav>
                <Nav.Item>
                  <ButtonGroup size="sm" id="btn-back">
                    <CloseButton name="back" onClick={this.handleBack} />
                  </ButtonGroup>
                </Nav.Item>
                <Nav.Item className="ms-auto post-title">{title}</Nav.Item>
                <Nav.Item className="ms-auto post-timestamp">
                  {"Now:"}
                  <br />
                  {now}
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {contents.map((content, index) => {
                if (content.language === "raw")
                  return (
                    <div key={index}>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => this.contentRemover(index)}
                      >
                        Discard
                      </Button>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        className="modifier-textarea"
                        value={content.storage}
                        style={{fontSize: 16}}
                        onChange={(event) =>
                          this.contentScheduler(index, event.target.value)
                        }
                      />
                    </div>
                  );
                else
                  return (
                    <div key={index}>
                      <InputGroup size="sm">
                        <Button
                          variant="outline-danger"
                          onClick={() => this.contentRemover(index)}
                        >
                          Discard
                        </Button>
                        <Form.Control
                          value={content.language}
                          onChange={(event) =>
                            this.languageScheduler(index, event.target.value)
                          }
                        ></Form.Control>
                      </InputGroup>
                      <Form.Control
                        as="textarea"
                        rows={10}
                        className="modifier-textarea"
                        value={content.storage}
                        style={{fontSize: 16}}
                        onChange={(event) =>
                          this.contentScheduler(index, event.target.value)
                        }
                      />
                    </div>
                  );
              })}
            </Card.Body>
            <Card.Footer></Card.Footer>
          </Card>
        </div>
        <div className="float-submit">
          <Button variant="outline-primary" size="sm" onClick={this.handlePostUpdate}>
            Submit
          </Button>
        </div>
      </>
    );
  }
}
