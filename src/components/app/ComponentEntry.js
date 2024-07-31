import React from "react";
import { Accordion, Icon, Table, Checkbox } from "semantic-ui-react";
import { connect } from "react-redux";
import { toggleCourseInclude, toggleCoursePenalize } from "../../actions";

class ComponentEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: props.active };
  }

  toggle() {
    this.setState(prev => ({ active: !prev.active, empty: false }));
  }

  isEmpty = sections =>
    sections.filter(section => !section.exclude).length === 0;

  componentDidMount() {
    if (this.isEmpty(this.props.sections)) {
      this.props.setEmptyWarning();
      this.setState({ empty: true });
    }
  }

  componentDidUpdate(prevProps) {
    let prevEmpty = this.isEmpty(prevProps.sections);
    let empty = this.isEmpty(this.props.sections);
    if (prevEmpty !== empty) {
      this.props.setEmptyWarning(empty);
      this.setState({ empty: empty });
    }
  }

  render() {
    let section_rows = [];
    for (let section of this.props.sections) {
      let time;
      if (section.start && section.end) {
        time =
          section.start.substring(0, 5) + "-" + section.end.substring(0, 5);
      } else {
        time = "TBD";
      }
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      let days = [];
      for (let i in section.days) {
        days.push(weekDays[section.days[i]]);
      }
      let disabled = section.exclude || this.props.forceExclude;
      section_rows.push(
        <Table.Row key={section.key}>
          <Table.Cell disabled={disabled}>
            {section.section_id + (section.need_clearance ? "D" : "R")}
          </Table.Cell>
          <Table.Cell disabled={disabled}>{days.join(", ")}</Table.Cell>
          <Table.Cell disabled={disabled}>{time}</Table.Cell>
          <Table.Cell disabled={disabled}>
            {section.registered}
            {section.closed && (
              <Icon
                name="minus circle"
                color="red"
                style={{ marginLeft: "0.5em" }}
                disabled={disabled}
              />
            )}
          </Table.Cell>
          <Table.Cell disabled={disabled}>{section.instructor}</Table.Cell>
          <Table.Cell disabled={disabled}>{section.location}</Table.Cell>
          <Table.Cell disabled={this.props.forceExclude}>
            <Checkbox
              key="include"
              label="include"
              disabled={this.props.forceExclude}
              checked={!section.exclude}
              node_id={section.node_id}
              onClick={(e, props) => {
                e.stopPropagation();
                this.props.dispatch(toggleCourseInclude(props.node_id));
              }}
            />
          </Table.Cell>
          <Table.Cell disabled={disabled}>
            <Checkbox
              key="penalize"
              label="penalize"
              disabled={disabled}
              checked={!section.exempt}
              node_id={section.node_id}
              onClick={(e, props) => {
                e.stopPropagation();
                this.props.dispatch(toggleCoursePenalize(props.node_id));
              }}
            />
          </Table.Cell>
        </Table.Row>
      );
    }
    let titleStyle = this.state.empty ? { textDecoration: "line-through" } : {};
    return (
      <>
        <Accordion.Title
          active={this.state.active}
          onClick={() => this.toggle()}
          style={titleStyle}
        >
          <Icon name="dropdown" />
          {this.props.component} ({this.props.numActive}/
          {this.props.sections.length})
        </Accordion.Title>
        <Accordion.Content active={this.state.active}>
          <Table celled fixed selectable>
            <Table.Body>{section_rows}</Table.Body>
          </Table>
        </Accordion.Content>
      </>
    );
  }
}

export default connect((state, ownProps) => ({
  sections: state.course.filter(node => node.parent === ownProps.node_id),
  numActive: state.course.filter(
    node => node.parent === ownProps.node_id && !node.exclude
  ).length
}))(ComponentEntry);
