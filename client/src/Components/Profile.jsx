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
  Nav,
} from "react-bootstrap";

// profile page after login
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

  fetchProfileDateil = async () => {
    const token = localStorage.getItem("token");
    // Fetch user profile information from the backend
    const pro = await fetch("https://localhost:3001/profile/info", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const res = await pro.json();
    // Update component state with user profile data
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
        // If user has an avatar, fetch it from the backend
        if (this.state.avatarId) {
          const pro = await fetch(
            `https://localhost:3001/profile/getava/${this.state.avatarId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const res = await pro.json();
          // Update component state with user avatar data
          this.setState({
            avatar: res.avatar,
            loading: false,
          });
        }
      }
    );
  };

  componentDidMount = async () => {
    this.fetchProfileDateil();
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

  // get image from input
  handleAvatar = (e) => {
    this.setState({
      newAvatar: e.target.files[0],
    });
  };

  handleSave = async () => {
    // Destructure the 'username' and 'bio' values from the component's state object
    const { username, bio } = this.state;
    const token = localStorage.getItem("token");
    // Send a POST request to the server to update the user's profile data
    const pro = await fetch("https://localhost:3001/profile/update", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the 'Authorization' header
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        bio: bio,
      }),
    });
    const res = await pro.json();
    if (res.success) alert("Modification Saved");
    // Update the component's state to indicate that the user is no longer editing their profile
    this.setState({
      editing: false,
    });
  };

  handleUploadAvatar = async () => {
    const { newAvatar } = this.state;
    const token = localStorage.getItem("token");
    // Create a new FormData object and append the selected avatar file to it
    const fd = new FormData();
    fd.append("avatar", newAvatar);
    // Send a POST request to the server to upload the new avatar file
    const postAvatar = await fetch("https://localhost:3001/profile/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the 'Authorization' header
      },
      body: fd, // Use the FormData object as the request body
    });
    const resAvatar = await postAvatar.json();
    // If the server indicates success, display a success message to the user
    if (resAvatar.success) alert("New avatar uploaded");
    // Call the 'fetchProfileDateil' method to update the user's profile data with the new avatar
    this.fetchProfileDateil();
    // Call the 'endEdit' method to exit the edit mode for the avatar upload section
    this.endEdit();
  };

  render() {
    const { loading, userId, username, bio, avatar, editing } = this.state;
    let url;
    // load avatar buffer to blob
    if (!loading) {
      const blob = new Blob([new Uint8Array(avatar.buffer.data)], {
        type: avatar.mimeType,
      });
      url = URL.createObjectURL(blob);
    }
    const date = new Date(userId);
    return (
      <div className="main-panel">
        <Card>
          <Card.Header>
            <Nav>
              <Nav.Item>Profile</Nav.Item>
              <Nav.Item className="ms-auto post-title"></Nav.Item>
              <Nav.Item className="ms-auto post-timestamp">
                {"Register Date:\n"}
                <br />
                {/* transfer unix timestamp to readable form */}
                {`${date.getFullYear()}/${
                  date.getMonth() + 1
                }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`}
              </Nav.Item>
            </Nav>
          </Card.Header>
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
                      <Button
                        variant="success"
                        onClick={this.handleUploadAvatar}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          className="bi bi-send"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                        </svg>
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
                    variant="outline-success"
                    size="sm"
                    onClick={this.handleSave}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-save"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={this.endEdit}
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
                </>
              ) : (
                <>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={this.startEdit}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-pencil-square"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                      <path
                        fillRule="evenodd"
                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                      />
                    </svg>
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
