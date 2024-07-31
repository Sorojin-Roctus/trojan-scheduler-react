import React from "react";
import {
  Placeholder,
  Segment,
  Accordion,
  Message,
  Icon,
  Header,
  Container
} from "semantic-ui-react";
import ScheduleWidget from "./ScheduleWidget";
import RedirectButton from "../RedirectButton";
import { connect } from "react-redux";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  noPermissionFormatter,
  str2para,
  getTaskName,
  getScheduleName,
  formatTitle
} from "../../util";
import TaskDetailWidget from "./TaskDetailWidget";
import moment from "moment";
import ScheduleStatus from "./ScheduleStatus";
import { Helmet } from "react-helmet";

const errorFormatter = errorFormatterCreator(
  noPermissionFormatter(
    "You cannot view this task because you are not its owner."
  ),
  responseDataFormatter,
  statusCodeFormatter
);

class TaskPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (props.taskData) {
      this.state.taskData = props.taskData;
    } else if (
      props.location &&
      props.location.state &&
      props.location.state.taskData
    ) {
      this.state.taskData = props.location.state.taskData;
    } else if (!props.task_id) {
      this.state.error = "no task id in props";
    }
    this.state.taskUser = null;
    this.state.cache = [];
    this.cancelSource = axios.CancelToken.source();
  }

  weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  handleSelect(id) {
    this.setState(state => {
      if (state.selected === id) {
        return { selected: null };
      } else {
        return { selected: id };
      }
    });
  }

  loadTaskData = () => {
    if (this.props.task_id) {
      axios
        .get(`/api/tasks/${this.props.task_id}/`, {
          cancelToken: this.cancelSource.token
        })
        .then(response => {
          this.setState({ taskData: response.data });
          this.loadProfileData(response.data.user);
        })
        .catch(error => {
          this.setState({ error: errorFormatter(error) });
        });
    }
  };

  loadProfileData = user => {
    if (user) {
      axios
        .get(`/api/users/${user}/`, {
          cancelToken: this.cancelSource.token
        })
        .then(response => this.setState({ taskUser: response.data }));
    } else {
      this.setState({
        taskUser: {
          avatar: "https://avatars.dicebear.com/v2/bottts/Empty.svg",
          display_name: "Anonymous"
        }
      });
    }
  };

  componentDidMount() {
    if (!this.state.taskData) {
      this.loadTaskData();
    } else {
      this.loadProfileData(this.state.taskData.user);
    }
  }

  componentDidUpdate(prevProps) {
    if (Boolean(prevProps.profile) !== Boolean(this.props.profile)) {
      this.setState({ taskData: null, error: null });
      this.loadTaskData();
    }
  }

  setCache = course => {
    this.setState(state => {
      let exists = false;
      let newCache = state.cache.map(prev => {
        if (prev.name === course.name && prev.term === course.term) {
          exists = true;
          if (moment(course.updated).diff(moment(prev.diff) > 0)) {
            return course;
          }
        }
        return prev;
      });
      if (!exists) {
        newCache.push(course);
      }
      return { ...state, cache: newCache };
    });
  };

  render() {
    let { taskData, taskUser, error, selected } = this.state;
    let taskName = getTaskName(taskData, this.props.task_id);
    let message = null;
    if (error) {
      message = <Message error>{str2para(error)}</Message>;
    } else if (taskData) {
      switch (taskData.status) {
        case "PD":
          message = <Message>Pending...</Message>;
          break;
        case "PS":
          message = <Message>Processing...</Message>;
          break;
        case "WN":
          message = <Message warning>{taskData.message}</Message>;
          break;
        case "FL":
          message = <Message error>{taskData.message}</Message>;
          break;
        case "EX":
          message = (
            <Message error>
              Sorry, we encountered an issue generating schedules for you, send
              us a message with this error code: {taskData.message}.
            </Message>
          );
          break;
        default:
          break;
      }
    }
    let content = null;
    let details = null;
    if (taskData) {
      let canEdit =
        this.props.profile &&
        this.props.profile.id &&
        this.props.profile.id === taskData.user;
      if (taskData.schedules.length !== 0) {
        content = (
          <>
            <Accordion styled fluid style={{ marginTop: "1rem" }}>
              {[...taskData.schedules]
                .sort((a, b) => a.id - b.id)
                .map(schedule => (
                  <React.Fragment key={schedule.id}>
                    <Accordion.Title
                      active={this.state.selected === schedule.id}
                      onClick={() => this.handleSelect(schedule.id)}
                    >
                      <Icon name="dropdown" />
                      {getScheduleName(schedule)}
                      <ScheduleStatus schedule={schedule} inline size="mini" />
                    </Accordion.Title>
                    {selected === schedule.id && (
                      <Accordion.Content active>
                        <ScheduleWidget
                          scheduleData={schedule}
                          cache={this.state.cache}
                          setCache={this.setCache}
                          topRightWidget={
                            <RedirectButton
                              button={{
                                content: "more details",
                                size: "tiny",
                                compact: true,
                                fluid: true
                              }}
                              redirect={{ to: `/schedule/${schedule.id}/` }}
                            />
                          }
                        />
                      </Accordion.Content>
                    )}
                  </React.Fragment>
                ))}
            </Accordion>
          </>
        );
      }
      details = (
        <TaskDetailWidget
          task={taskData}
          user={taskUser}
          canEdit={canEdit}
          onUpdate={data => this.setState({ taskData: data })}
          onDelete={() =>
            this.setState({
              error: "This task is deleted.",
              taskData: null
            })
          }
        />
      );
    } else if (!error) {
      content = (
        <Placeholder>
          <Placeholder.Header />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Header />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder>
      );
    }

    return (
      <Container className="main-content">
        <Helmet>
          <title>{formatTitle(taskName)}</title>
        </Helmet>
        <Segment>
          <Header>{taskName}</Header>
          {details}
          {message}
          {content}
        </Segment>
      </Container>
    );
  }
}

export default connect(state => ({
  profile: state.user.profile
}))(TaskPage);
