import React from "react";
import {
  Item,
  Button,
  Grid,
  Icon,
  Modal,
  Form,
  Confirm,
  Popup
} from "semantic-ui-react";
import moment from "moment";
import axios from "axios";
import { loadCoursebin, loadPreferences, loadSetting } from "../../actions";
import { connect } from "react-redux";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  getTaskName
} from "../../util";
import { toast } from "react-semantic-toasts";
import { scheduleExpireAfter } from "../../settings";
import ProfileCard from "../account/ProfileCard";

const errorFormatter = errorFormatterCreator(
  responseDataFormatter,
  statusCodeFormatter
);

class TaskDetailWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: [],
      openModal: null,
      editTitle: "",
      editDescription: ""
    };
    this.cancelSource = axios.CancelToken.source();
  }

  handleUpdate = (e, { name, values }) => {
    this.setState(state => ({ loading: state.loading.concat(name) }));
    axios
      .patch(`/api/tasks/${this.props.task.id}/`, values, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.props.onUpdate(response.data);
        this.setState(state => ({
          loading: state.loading.filter(item => item !== name),
          openModal: null
        }));
      })
      .catch(error => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== name),
          openModal: null
        }));
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Update This Task`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
      });
  };

  handleDelete = (e, { name }) => {
    this.setState(state => ({ loading: state.loading.concat(name) }));
    axios
      .delete(`/api/tasks/${this.props.task.id}/`, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.props.onDelete();
        this.setState(state => ({
          loading: state.loading.filter(item => item !== name),
          openModal: null
        }));
      })
      .catch(error => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== name),
          openModal: null
        }));
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Update This Task`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
      });
  };

  handleLoadCoursebin = (e, { name }) => {
    let { task } = this.props;
    this.setState(state => ({
      loading: state.loading.concat(name)
    }));
    axios
      .get(`/api/task-data/${task.request_data}/`, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== name)
        }));
        this.props.loadCoursebin(response.data.coursebin);
        this.props.loadPreferences(response.data.preference);
        this.props.loadSetting(response.data.setting);
        toast({
          type: "success",
          icon: "cloud download",
          title: "Settings Loaded",
          description: "Successfully loaded your settings.",
          time: 10000
        });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Load Settings`,
          description: errorFormatter(error),
          time: 10000
        });
        this.setState(state => ({
          loading: state.loading.filter(item => item !== name)
        }));
      });
  };

  openEditModal = (e, { title, description }) => {
    this.setState({
      openModal: "edit",
      editTitle: title,
      editDescription: description
    });
  };

  openConfirmModal = () => {
    this.setState({
      openModal: "delete-confirm"
    });
  };

  closeModals = () => {
    this.setState({ openModal: null });
  };

  handleEditChange = (e, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  };

  componentWillUnmount() {
    this.cancelSource.cancel(
      `axios requests cancelled on ${this.props.type} detail widget unmount`
    );
  }

  render() {
    let { user, task, canEdit } = this.props;

    let editButtonGroup = null;
    if (canEdit) {
      let charactersLeft = 200 - this.state.editDescription.length;
      let tooMany = charactersLeft < 0;
      editButtonGroup = (
        <>
          <Modal
            trigger={
              <Button icon className="task-button">
                <Icon name="pencil" /> edit
              </Button>
            }
            size="tiny"
            title={getTaskName(task)}
            description={task.description}
            onOpen={this.openEditModal}
            onClose={this.closeModals}
            open={this.state.openModal === "edit"}
          >
            <Modal.Header>Edit Task</Modal.Header>
            <Modal.Content>
              <Form>
                <Form.Input
                  label="Title"
                  name="editTitle"
                  value={this.state.editTitle}
                  onChange={this.handleEditChange}
                />
                <Form.TextArea
                  label={`Description (${charactersLeft} characters left)`}
                  name="editDescription"
                  value={this.state.editDescription}
                  onChange={this.handleEditChange}
                  error={tooMany}
                />
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button negative content="cancel" onClick={this.closeModals} />
              <Button
                positive
                content="save"
                values={{
                  name: this.state.editTitle,
                  description: this.state.editDescription
                }}
                loading={this.state.loading.includes("edit")}
                disabled={this.state.loading.includes("edit") || tooMany}
                name="edit"
                onClick={this.handleUpdate}
              />
            </Modal.Actions>
          </Modal>
          <Button
            className="task-button"
            color="red"
            content="delete"
            onClick={this.openConfirmModal}
          />
          <Confirm
            open={this.state.openModal === "delete-confirm"}
            onCancel={this.closeModals}
            onConfirm={this.handleDelete}
            content="Are you sure you want to delete this task and all its schedules? You cannot undo this action."
            confirmButton={
              <Button
                primary={false}
                color="red"
                content="Delete"
                name="delete"
                onClick={this.openConfirmModal}
                loading={this.state.loading.includes("delete")}
                disabled={this.state.loading.includes("delete")}
              />
            }
          />
          <Button
            content="use settings"
            color="black"
            className="task-button"
            name="load"
            onClick={this.handleLoadCoursebin}
            loading={this.state.loading.includes("load")}
            disabled={this.state.loading.includes("load")}
          />
        </>
      );
    }

    let expireAtMoment = moment(task.created).add(scheduleExpireAfter, "d");
    let expireAt =
      moment().diff(expireAtMoment) < 0
        ? expireAtMoment.fromNow()
        : "anytime soon";

    return (
      <Grid stackable verticalAlign="middle" style={{ marginBottom: 0 }}>
        <Grid.Column width={10}>
          <Item.Group>
            <Item>
              {user && (
                <Popup
                  as={ProfileCard}
                  {...user}
                  basic
                  on="click"
                  trigger={
                    <Item.Image
                      as="a"
                      size="tiny"
                      src={user.avatar}
                      rounded
                      className="schedule-user-avatar"
                    />
                  }
                />
              )}

              <Item.Content verticalAlign="middle">
                <Item.Description>
                  Created {moment(task.created).fromNow()}
                  {user && `, by ${user.display_name}`}.
                </Item.Description>

                <Item.Meta>
                  {task.count} valid schedules found, expire {expireAt}
                </Item.Meta>

                <Item.Extra>{task.description}</Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>
        </Grid.Column>
        <Grid.Column width={6} textAlign="right">
          {editButtonGroup}
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(null, { loadCoursebin, loadPreferences, loadSetting })(
  TaskDetailWidget
);
