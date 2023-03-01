/* eslint-disable no-unused-vars */
import React from "react";
import { Badge } from "react-bootstrap";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";

hljs.configure({
  ignoreUnescapedHTML: true,
});

export default class Snippet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: "Python",
    };
  }

  componentDidMount() {
    this.highlightCallBack();
  }

  componentDidUpdate() {
    this.highlightCallBack();
  }

  highlightCallBack = () => {
    document.querySelectorAll("pre").forEach((element) => {
      try {
        hljs.highlightElement(element);
      } catch (e) {
        console.log(e);
      }
    });
  };

  render() {
    const { language } = this.state
    return (
      <div className="snippet-panel">
        <div style={{ height: 10 }} />
        <div className="snippet-header">
          <Badge bg="secondary">{language}</Badge>
        </div>
        <div className="snippet-code">
          <pre className={language} style={{ margin: 0 }}>
            <code>
              {/* import React, {"\u007b"} Component {"\u007d"} from 'react' {"\n"}
              import hljs from 'highlight.js';{"\n"}
              import 'highlight.js/styles/default.css'; */}
              if __name__ == '__main__':{"\n"}
              {"\t"}print('hello')
            </code>
          </pre>
        </div>
        <div style={{ height: 15 }} />
      </div>
    );
  }
}
