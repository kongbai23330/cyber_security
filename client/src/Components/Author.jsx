import React from "react";
import { Figure } from "react-bootstrap";

// rendering author bar at post component
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
    // Make a GET request to fetch the basic profile information of the author using authorId passed as props
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
    // Set the state of the component with the author's username obtained from the response
    this.setState({
      author: res.username,
    });
    // If the author has an avatar, make another GET request to fetch the avatar image
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
      // Set the state of the component with the avatar image obtained from the response
      // Also set the loading state to false
      this.setState({
        avatar: jsonAva.avatar,
        loading: false,
      });
    }
  };

  render() {
    let url;
    // If the avatar image is loaded, create a URL object from its data and MIME type
    if (!this.state.loading) {
      const blob = new Blob([new Uint8Array(this.state.avatar.buffer.data)], {
        type: this.state.avatar.mimeType,
      });
      url = URL.createObjectURL(blob);
    }
    // Return the JSX for rendering the component
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Render the avatar image if it is loaded */}
        {!this.state.loading && (
          <Figure.Image
            src={url}
            height={80}
            width={80}
            style={{ marginRight: "10px" }}
          />
        )}
        {/* Render the author's username */}
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
