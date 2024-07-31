import React from "react";
import { Form } from "semantic-ui-react";
import {
  editSetting,
  loadSetting,
  filterSelection,
  filterPenalize
} from "../../actions";
import { connect } from "react-redux";
import moment from "moment";
import { coursebinCourseLifetime } from "../../settings";
import LazyInput from "./LazyInput";

class ToolForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  needRefresh = course =>
    moment().diff(moment(course.updated)) >
    coursebinCourseLifetime.asMilliseconds();

  handleFilterSelection = () => {
    let { clearedSections, clearedOnly, excludeClosed } = this.props.setting;
    this.props.filterSelection({ clearedOnly, clearedSections, excludeClosed });
  };

  handleFilterPenalize = () => {
    let { exemptedSections } = this.props.setting;
    this.props.filterPenalize(exemptedSections);
  };

  render() {
    let { clearedOnly, excludeClosed } = this.props.setting;
    let canRefresh = this.props.courses.filter(this.needRefresh).length > 0;

    return (
      <Form>
        <Form.Group>
          <Form.Button
            content="Save"
            fluid
            onClick={this.props.onSave}
            loading={this.props.loading.includes("save")}
            disabled={
              this.props.loading.includes("save") || !this.props.profile
            }
            width={3}
          />
          <Form.Button
            content="Load"
            fluid
            onClick={this.props.onLoad}
            loading={this.props.loading.includes("load")}
            disabled={
              this.props.loading.includes("load") || !this.props.profile
            }
            width={3}
          />
          <Form.Button
            content="Refresh All"
            fluid
            loading={this.props.loading.includes("refresh")}
            disabled={this.props.loading.includes("refresh") || !canRefresh}
            onClick={this.props.onRefresh}
            width={3}
          />
        </Form.Group>
        <Form.Field style={{ margin: 0 }}>
          <label>Cleared sections</label>
        </Form.Field>
        <Form.Group inline>
          <Form.Field
            control={LazyInput}
            placeholder="csci-201, csci-201:lab, 29979, etc."
            fluid
            width={10}
            value={this.props.setting.clearedSections}
            onChange={value =>
              this.props.editSetting({ name: "clearedSections", value })
            }
          />
          <Form.Checkbox
            label="Exclude Closed"
            width={2}
            checked={excludeClosed}
            onChange={() =>
              this.props.editSetting({
                name: "excludeClosed",
                value: !excludeClosed
              })
            }
          />
          <Form.Checkbox
            label="Cleared Only"
            width={2}
            checked={clearedOnly}
            onChange={() =>
              this.props.editSetting({
                name: "clearedOnly",
                value: !clearedOnly
              })
            }
          />
          <Form.Button
            content="Filter"
            fluid
            onClick={this.handleFilterSelection}
            width={2}
          />
        </Form.Group>
        <Form.Field style={{ margin: 0 }}>
          <label>Exempted courses, components, or sections</label>
        </Form.Field>
        <Form.Group inline>
          <Form.Field
            control={LazyInput}
            placeholder="math-407, quiz, 29979, etc."
            fluid
            width={14}
            value={this.props.setting.exemptedSections}
            onChange={value =>
              this.props.editSetting({ name: "exemptedSections", value })
            }
          />
          <Form.Button
            content="Exempt"
            fluid
            onClick={this.handleFilterPenalize}
            width={2}
          />
        </Form.Group>
      </Form>
    );
  }
}

export default connect(
  state => ({
    courses: state.course
      .filter(node => node.type === "course")
      .sort((a, b) =>
        a.group !== b.group
          ? a.group - b.group
          : a.node_id.localeCompare(b.node_id)
      ),
    profile: state.user.profile,
    setting: state.setting
  }),
  {
    editSetting,
    loadSetting,
    filterSelection,
    filterPenalize
  }
)(ToolForm);
