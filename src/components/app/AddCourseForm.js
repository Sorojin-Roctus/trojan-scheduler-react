import React from "react";
import { Form, Popup, Button } from "semantic-ui-react";
import { loadSetting, editSetting, loadCoursebin } from "../../actions";
import { connect } from "react-redux";
import { termOptions } from "../../settings";

class AddCourseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      course: props.setting.course,
      editing: null
    };
  }

  componentDidUpdate = () => {
    if (
      !this.state.editing &&
      this.props.setting.course !== this.state.course
    ) {
      this.setState({ course: this.props.setting.course });
    }
  };

  handleTermChange = (e, { value }) => {
    if (value !== this.props.setting.term) {
      this.props.editSetting({ name: "term", value });
      this.props.loadCoursebin([]);
    }
  };

  render() {
    let { course } = this.state;
    let { term } = this.props.setting;

    let courseSuggestion = null;
    let correctCourseFormat = false;
    if (course.length !== 0) {
      let match = course.match(/([a-zA-Z]{2,4})([\W_]*)(\d{1,3}[a-zA-Z]{0,1})/);
      if (match) {
        if (match[2] !== "-") {
          courseSuggestion = match[1] + "-" + match[3];
        } else {
          correctCourseFormat = true;
        }
      }
    } else {
      correctCourseFormat = true;
    }

    return (
      <Form onSubmit={() => this.props.onSubmit(course, term)}>
        <Form.Group inline>
          <Form.Select
            value={term}
            options={termOptions}
            onChange={this.handleTermChange}
            width={6}
            selection
            style={{ width: "100%" }}
          />
          <Popup
            open={Boolean(courseSuggestion)}
            position="top center"
            trigger={
              <Form.Input
                placeholder="Course (e.g. csci-356)"
                value={course}
                onChange={(e, { value }) =>
                  this.setState({ course: value, editing: true })
                }
                width={6}
                error={!correctCourseFormat}
                onBlur={() => {
                  this.setState({ editing: false });
                  this.props.editSetting({ name: "course", value: course });
                }}
              />
            }
          >
            Do you mean{" "}
            <Button
              style={{
                backgroundColor: "#0000",
                padding: "0 0.5em",
                textDecoration: "underline"
              }}
              onClick={e => {
                this.setState({ course: courseSuggestion });
                this.props.editSetting({
                  name: "course",
                  value: courseSuggestion
                });
              }}
            >
              {courseSuggestion}
            </Button>
            ?
          </Popup>
          <Form.Button
            content="Add"
            type="submit"
            width={4}
            fluid
            disabled={!course}
          />
        </Form.Group>
      </Form>
    );
  }
}

export default connect(
  state => ({
    setting: state.setting
  }),
  {
    loadSetting,
    editSetting,
    loadCoursebin
  }
)(AddCourseForm);
