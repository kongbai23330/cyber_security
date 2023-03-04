import React from "react";
import { Figure } from "react-bootstrap";

export default class Author extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      author: "",
      loading: true,
      avatar: null,
    };
  }

  componentDidMount = async () => {
    const token = localStorage.getItem("token");
    const pro = await fetch(
      `http://localhost:3001/profile/basic/${this.props.authorId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const res = await pro.json();
    this.setState({
      author: res.username,
    });
    if (res.avatar) {
      const fetchAva = await fetch(
        `http://localhost:3001/profile/getava/${res.avatar}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const jsonAva = await fetchAva.json();
      this.setState({
        avatar: jsonAva.avatar,
        loading: false,
      });
    }
  };

  render() {
    let url;
    if (!this.state.loading) {
      const blob = new Blob([new Uint8Array(this.state.avatar.buffer.data)], {
        type: this.state.avatar.mimeType,
      });
      url = URL.createObjectURL(blob);
    }
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {!this.state.loading && (
          <Figure.Image
            src={url}
            height={80}
            width={80}
            style={{ marginRight: "10px" }}
          />
        )}
        <div>
          <span style={{ display: "block", fontSize: 16 }}>Author:</span>
          <span style={{ display: "block", fontWeight: "bold" }}>
            {this.state.author}
          </span>
        </div>
      </div>
    );
  }
}
