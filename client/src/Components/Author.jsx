import { Figure } from "react-bootstrap";
import Sample from "../Public/sample.jpg";

export const Author = (props) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Figure.Image
        src={Sample}
        height={80}
        width={80}
        style={{ marginRight: "10px" }}
      />
      <div>
        <span style={{ display: "block", fontSize: 16 }}>Author:</span>
        <span style={{ display: "block", fontWeight: "bold" }}>{props.author}</span>
      </div>
    </div>
  );
};
