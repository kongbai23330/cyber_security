/* eslint-disable no-unused-vars */
import React from "react";
import { Card, Button, Form, InputGroup, Row, Col } from "react-bootstrap";

export default class Protrait extends React.Component {
  render() {
    return (
      <div className="portrait-panel">
        <Card>
          <Card.Header
            className="portrait-header"
            style={{
              paddingTop: 7.5,
              paddingRight: 20,
              paddingBottom: 5,
              paddingLeft: 15,
            }}
          >
            B+ tree in java
          </Card.Header>
          <Card.Body
            className="portrait-body"
            style={{
              paddingTop: 5,
              paddingRight: 10,
              paddingBottom: 5,
              paddingLeft: 10,
            }}
          >
            In computer science, a red-black tree is a kind of self-balancing
            binary search tree. In addition to the user data (search key and
            other data) and the pointers of the binary search tree (BST), each
            node stores an extra bit representing "red" and "black" (called
            "color") which helps to keep the tree balanced during insertions and
            deletions.
          </Card.Body>
        </Card>
      </div>
    );
  }
}
