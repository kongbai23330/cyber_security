/* eslint-disable no-unused-vars */
import React from "react";
import { Card, Button, Row, Col, Figure, ButtonGroup, Form } from "react-bootstrap";
import Sample from '../Public/sample.jpg';

export default class Profile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      avatar: null,
      username: 'NOT SIGNED IN',
      bio: 'NOT SIGNED IN',
      userId: null,
      editing: false
    }
  }

  componentDidMount = async() => {
    const token = localStorage.getItem("token")
    const pro = await fetch('http://localhost:3001/profile/info', {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    const res = await pro.json()
    this.setState({
      avatar: res.avatar,
      username: res.username,
      bio: res.bio,
      userId: res.userId
    })
  }

  startEdit = () => {
    this.setState({
      editing: true
    })
  }
  endEdit = () => {
    this.setState({
      editing: false
    })
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSave = async() => {
    const { userId, username, bio } = this.state
    const token = localStorage.getItem("token")
    const pro = await fetch('http://localhost:3001/profile/update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        username: username,
        bio: bio
      })
    })
    const res = await pro.json()
    if(res.success) alert('Modification Saved')
    this.setState({
      editing: false
    })
  }

  render() {
    const { userId, username, bio, avatar, editing } = this.state
    return (
      <div className="main-panel">
      <Card>
        <Card.Header>Profile</Card.Header>
        <Card.Body>
          <Row>
            <Col xs={3}>
              <Figure>
                <Figure.Image src={Sample} height={200} width={200} />
              </Figure>
            </Col>
            <Col>
            {editing ? (
              <>
              <Form.Control name='username' value={username} onChange={this.handleChange} />
              <br />
              <Form.Control as='textarea' name='bio' value={bio} onChange={this.handleChange} />
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
              <Button variant='outline-primary' size='sm' onClick={this.handleSave}>Save</Button>
              <Button variant='outline-primary' size='sm' onClick={this.endEdit}>Close</Button>
              </>
            ) : (
              <>
              <Button variant='outline-primary' size='sm' onClick={this.startEdit}>Edit</Button>
              </>
            )}
          </ButtonGroup>
        </Card.Footer>
      </Card>
      </div>
    );
  }
}
