import React from "react";
import { Modal, Button, Label, Form, Responsive } from "semantic-ui-react";
import { num2color } from "./CourseEntry";
import { setGroupCourse } from "../../actions";
import { connect } from "react-redux";

class GroupSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selected: props.currentGroup,
      inputValue: "",
      inputError: false
    };
  }

  open = e => {
    e.stopPropagation();
    this.setState({
      open: true,
      selected: this.props.currentGroup,
      inputValue: "",
      inputError: false
    });
  };

  close = () => {
    this.setState({ open: false });
  };

  cancel = () => {
    this.close();
  };

  submit = () => {
    this.props.setGroupCourse({
      node_id: this.props.node_id,
      group: this.state.selected
    });
    this.close();
  };

  handleSelect = (e, { group }) => {
    this.setState({ selected: group, inputValue: "", inputError: false });
  };

  handleInputChange = (e, { value }) => {
    if (value === "") {
      this.setState({
        selected: this.props.currentGroup,
        inputError: false,
        inputValue: value
      });
    } else {
      let num = Number(value);
      if (isNaN(num)) {
        this.setState({
          selected: this.props.currentGroup,
          inputError: true,
          inputValue: value
        });
      } else {
        this.setState({ selected: num, inputError: false, inputValue: value });
      }
    }
  };

  render() {
    let { options } = this.props;
    if (!options) {
      options = [];
    }
    let buttonsWidth = Math.min(options.length * 2, 12);
    let inputWidth = 16 - buttonsWidth;
    return (
      <Modal
        trigger={
          <Label.Detail as="a" onClick={this.open}>
            <Responsive
              as="span"
              content="Exempt"
              onClick={this.togglePenaltyHandler}
              minWidth={400}
            >
              group
            </Responsive>
            <Responsive
              as="span"
              content="Exempt"
              onClick={this.togglePenaltyHandler}
              maxWidth={399}
            >
              #
            </Responsive>
            {this.props.currentGroup}
          </Label.Detail>
        }
        open={this.state.open}
        onClose={this.close}
        size="tiny"
        onClick={e => e.stopPropagation()}
      >
        <Modal.Header>
          Select a Group for {this.props.node_id.toUpperCase()}
        </Modal.Header>

        <Modal.Content>
          <Form onSubmit={this.submit}>
            <Form.Group inline>
              {buttonsWidth > 0 && (
                <Form.Field width={buttonsWidth}>
                  <Button.Group fluid>
                    {options.map(group => (
                      <Button
                        key={group}
                        color={num2color(group)}
                        group={group}
                        onClick={this.handleSelect}
                        type="button"
                      >
                        {group === this.state.selected && "[ "}
                        {group}
                        {group === this.state.selected && " ]"}
                      </Button>
                    ))}
                  </Button.Group>
                </Form.Field>
              )}
              <Form.Input
                placeholder="new group"
                width={inputWidth}
                onChange={this.handleInputChange}
                error={this.state.inputError}
                value={this.state.inputValue}
              />
            </Form.Group>
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button color="black" onClick={this.cancel}>
            Cancel
          </Button>
          <Button
            positive
            icon="checkmark"
            labelPosition="left"
            content={`Set to #${this.state.selected}`}
            onClick={this.submit}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect(null, { setGroupCourse })(GroupSelect);
