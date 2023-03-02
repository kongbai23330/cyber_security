import React from "react";

export default class Segment extends React.Component {
  render() {
    const { storage } = this.props
    return (
      <>
        <div style={{ padding: 0 }} className="segment-body">
          {storage}
        </div>
        <div style={{ height: 15 }} />
      </>
    );
  }
}
