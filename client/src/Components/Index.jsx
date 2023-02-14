/* eslint-disable no-unused-vars */
import React from "react";
import { Card, Button, Form, InputGroup, Row, Col, Dropdown } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';
import Protrait from "./Portrait";

export default  class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  loadMore = () => {
    this.setState({
      loading: true
    })
  }

  render() {
    return (
      <div className="main-panel">
        <Card>
          <Card.Header>
            <InputGroup>
              <Form.Control size="sm" placeholder="Search for a post..."></Form.Control>
              <Button size="sm" variant="outline-primary">Query</Button>
            </InputGroup>
          </Card.Header>
          <Card.Body>
            <Protrait />
            <Protrait />
            <Protrait />
          </Card.Body>
          <Card.Footer className="text-center">
            {this.state.loading ? (
              <Spinner animation="border" variant="primary" size="sm" />
            ) : (
              <Button size="sm" variant="outline-primary" onClick={this.loadMore}>Load more</Button>
            )}
          </Card.Footer>
        </Card>
      </div>
    )
  }
}
