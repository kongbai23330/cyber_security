/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Figure,
  ButtonGroup,
  Form,
  InputGroup,
} from "react-bootstrap";

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      avatarId: null,
      avatar: null,
      newAvatar: null,
      username: "NOT SIGNED IN",
      bio: "NOT SIGNED IN",
      userId: null,
      editing: false,
    };
  }

  fetchProfileDateil = async() => {
    const token = localStorage.getItem("token");
    const pro = await fetch("http://localhost:3001/profile/info", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    this.setState(
      () => {
        return {
          avatarId: res.avatar,
          username: res.username,
          bio: res.bio,
          userId: res.userId,
        };
      },
      async () => {
        if(this.state.avatarId) {
          const pro = await fetch(
            `http://localhost:3001/profile/getava/${this.state.avatarId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const res = await pro.json();
          this.setState({
            avatar: res.avatar,
            loading: false,
          });
        }
      }
    );
  }

  componentDidMount = async () => {
    this.fetchProfileDateil()
  };

  startEdit = () => {
    this.setState({
      editing: true,
    });
  };
  endEdit = () => {
    this.setState({
      editing: false,
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleAvatar = (e) => {
    this.setState({
      newAvatar: e.target.files[0],
    });
  };

  handleSave = async () => {
    const { username, bio } = this.state;
    const token = localStorage.getItem("token");
    const pro = await fetch("http://localhost:3001/profile/update", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        bio: bio,
      }),
    });
    const res = await pro.json();
    if (res.success) alert("Modification Saved");
    this.setState({
      editing: false,
    });
  };

  handleUploadAvatar = async() => {
    const { newAvatar } = this.state;
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("avatar", newAvatar);
    const postAvatar = await fetch("http://localhost:3001/profile/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });
    const resAvatar = await postAvatar.json();
    if(resAvatar.success) alert('New avatar uploaded')
    this.fetchProfileDateil()
    this.endEdit()
  };

  render() {
    const { loading, userId, username, bio, avatar, editing } = this.state;
    let url;
    if (!loading) {
      const blob = new Blob([new Uint8Array(avatar.buffer.data)], {
        type: avatar.mimeType,
      });
      url = URL.createObjectURL(blob);
    }
    return (
      <div className="main-panel">
        <Card>
          <Card.Header>Profile</Card.Header>
          <Card.Body>
            <Row>
              <Col xs={3}>
                <Figure>
                  {!loading && (
                    <Figure.Image src={url} height={200} width={200} />
                  )}
                </Figure>
              </Col>
              <Col>
                {editing ? (
                  <>
                    <Form.Control
                      name="username"
                      value={username}
                      onChange={this.handleChange}
                    />
                    <br />
                    <Form.Control
                      as="textarea"
                      name="bio"
                      value={bio}
                      onChange={this.handleChange}
                    />
                    <br />
                    <InputGroup size="sm">
                      <Form.Control type="file" onChange={this.handleAvatar} />
                      <Button onClick={this.handleUploadAvatar}>
                        Save Avatar
                      </Button>
                    </InputGroup>
                  </>
                ) : (
                  <>
                    <h2>{username}</h2>
                    <p className="profile-id">ID: {userId}</p>
                    <p>{bio}</p>
                  </>
                )}
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer className="text-center">
            <ButtonGroup>
              {editing ? (
                <>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={this.handleSave}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={this.endEdit}
                  >
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={this.startEdit}
                  >
                    Edit
                  </Button>
                </>
              )}
            </ButtonGroup>
          </Card.Footer>
        </Card>
      </div>
    );
  }
}
