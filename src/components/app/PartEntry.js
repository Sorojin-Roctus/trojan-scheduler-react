import React from "react";
import { Accordion } from "semantic-ui-react";
import ComponentEntry from "./ComponentEntry";
import { connect } from "react-redux";

class PartEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let elements = [];
    for (let component of this.props.children) {
      elements.push(
        <ComponentEntry
          {...component}
          forceExclude={this.props.forceExclude}
          setEmptyWarning={this.props.setEmptyWarning}
        ></ComponentEntry>
      );
    }
    return <Accordion styled>{elements}</Accordion>;
  }
}

export default connect((state, ownProps) => ({
  children: state.course.filter(node => node.parent === ownProps.node_id)
}))(PartEntry);
