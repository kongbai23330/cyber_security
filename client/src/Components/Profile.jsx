/* eslint-disable no-unused-vars */
import React from "react";
import { Card, Button, Row, Col, Figure, ButtonGroup } from "react-bootstrap";
import Sample from '../Public/sample.jpg';

export default class Profile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      avatar: null,
      username: 'NOT SIGNED IN',
      userintro: 'The autumn leaves danced in the breeze, their vibrant colors painting the landscape with hues of red, orange, and yellow. The crisp air filled the senses, carrying the scent of woodsmoke and fallen leaves.',
      editing: false
    }
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

  render() {
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
              <h2>{this.state.username}</h2>
              <p>{this.state.userintro}</p>
            </Col>
          </Row>

        </Card.Body>
        <Card.Footer className="text-center">
          <ButtonGroup>
            {this.state.editing ? (
              <>
              <Button variant='outline-primary' size='sm'>Save</Button>
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
