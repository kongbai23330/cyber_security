/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card,
  Button,
  Nav,
  CloseButton,
  Row,
  Col,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import Snippet from "./Snippet";
import Segment from "./Segment";

export default class Post extends React.Component {
  render() {
    return (
      <div className="main-panel">
        <Card>
          <Card.Header>
            <Nav>
              <Nav.Item>
                <ButtonGroup size="sm" id="btn-back">
                  <CloseButton />
                </ButtonGroup>
              </Nav.Item>
              <Nav.Item className="ms-auto post-title">
                Post-Title
              </Nav.Item>
              <Nav.Item className="ms-auto post-timestamp">
                {"Last Modified:\n"}
                <br />
                {"2023/02/14 16:23"}
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Segment />
            <Snippet />
            <Segment />
          </Card.Body>
          <Card.Footer>
            <ButtonGroup>
              <Button size="sm" variant="outline-primary">1</Button>
              <Button size="sm" variant="outline-primary">0</Button>
            </ButtonGroup>
          </Card.Footer>
        </Card>
      </div>
    );
  }
}
