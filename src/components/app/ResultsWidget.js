import React from "react";
import {
  Form,
  Segment,
  Message,
  List,
  Header
} from "semantic-ui-react";
import { connect } from "react-redux";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { saveTaskResult } from "../../actions";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  matchStatusCode,
  formatTitle,
  getTaskName
} from "../../util";
import { toast } from "react-semantic-toasts";
import { Helmet } from "react-helmet";
import RedirectButton from "../RedirectButton";

const errorFormatter = errorFormatterCreator(
  matchStatusCode("Your session has expired. Please log in to continue.", [
    401
  ]),
  responseDataFormatter,
  statusCodeFormatter
);

class ResultsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, taskName: "" };
    this.cancelSource = axios.CancelToken.source();
  }

  getDescription = coursebin =>
    coursebin
      .filter(node => node.type === "course" && !node.exclude)
      .map(node => node.course.toUpperCase())
      .join(", ");

  handleSend = () => {
    this.props.saveTaskResult(null);
    this.setState({ error: null, loading: true });
    axios
      .post(
        "/api/tasks/",
        {
          coursebin: this.props.coursebin,
          preference: this.props.preference,
          name: this.state.taskName,
          description: this.getDescription(this.props.coursebin)
        },
        { cancelToken: this.cancelSource.token }
      )
      .then(response => {
        let { data } = response;
        this.props.saveTaskResult(data);
        if (data.status === "PD" || data.status === "PS") {
          this.pollTask(data.id, 10, 500);
        }
      })
      .catch(error => {
        this.setState({
          loading: false
        });
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Create Schedules`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
      });
  };

  handleTaskNameChange = (e, { value }) => {
    this.setState({ taskName: value });
  };

  pollTask = (id, ttl, delay) => {
    axios
      .get(`/api/tasks/${id}/`, { cancelToken: this.cancelSource.token })
      .then(response => {
        let { data } = response;
        this.props.saveTaskResult(data);
        if (data.status === "PD" || data.status === "PS") {
          if (ttl !== null && ttl <= 0) {
            this.setState({
              error:
                "It's taking a bit longer than expected... Go to the Task page for updates."
            });
          } else {
            setTimeout(
              this.pollTask,
              delay,
              id,
              ttl === null ? null : ttl - 1,
              Math.min(delay * 2, 60000)
            );
          }
        } else {
          this.setState({ loading: false });
        }
      })
      .catch(error => {
        this.setState({ loading: false });
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Create Schedules`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
      });
  };

  componentDidMount = () => {
    if (this.props.result && ["PD", "PS"].includes(this.props.result.status)) {
      this.setState({ loading: true });
      this.pollTask(this.props.result.id, 5, 1000);
    }
  };

  componentWillUnmount() {
    this.cancelSource.cancel("axios requests cancelled on result page unmount");
  }

  render() {
    let { error, loading } = this.state;
    let { result } = this.props;
    let content = null;
    let button = null;
    if (error) {
      content = (
        <Segment>
          <Message error>{error}</Message>
        </Segment>
      );
    } else if (result) {
      let message = null;
      switch (result.status) {
        case "PD":
          message = <Message>Pending...</Message>;
          break;
        case "PS":
          message = <Message>Processing...</Message>;
          break;
        case "DN":
          message = (
            <Message success>
              Done! We found {result.count} valid schedules and we picked the
              top {result.schedules.length} for you.
            </Message>
          );
          break;
        case "WN":
          message = <Message warning>{result.message}</Message>;
          break;
        case "FL":
          message = <Message error>{result.message}</Message>;
          break;
        case "EX":
          message = (
            <Message error>
              Sorry, we encountered an issue generating schedules for you, send
              us a message with this error code: {result.message}.
            </Message>
          );
          break;
        default:
          break;
      }

      if (result.status === "DN" || result.status === "WN") {
        button = (
          <RedirectButton
            button={{ type: "submit", content: "Go to Result Page" }}
            redirect={{ to: `/task/${result.id}/`, push: true }}
          />
        );
      }

      content = (
        <Segment>
          <Header>{getTaskName(result)}</Header>
          {message}
          {button}
        </Segment>
      );
    }

    let coursebinSummary = null;
    if (this.props.coursebin.length === 0) {
      coursebinSummary = <Message info>Your coursebin is empty.</Message>;
    } else {
      let numCourses = this.props.coursebin.filter(
        node => node.type === "course" && !node.exclude
      ).length;
      let excludedCount = this.props.coursebin.filter(
        node => node.type === "course" && node.exclude
      ).length;
      coursebinSummary = (
        <Message info>
          <p>
            You have selected {numCourses} course(s) ({excludedCount} excluded).
          </p>
          <List bulleted>
            {this.props.coursebin
              .filter(node => node.type === "course" && !node.exclude)
              .map(node => (
                <List.Item key={node.key}>
                  {node.course.toUpperCase()}
                </List.Item>
              ))}
          </List>
        </Message>
      );
    }
    return (
      <>
        <Helmet>
          <title>{formatTitle("Results")}</title>
        </Helmet>
        <Segment.Group>
          <Segment>
            <Header>Make New Schedules</Header>
            {coursebinSummary}
            <Form>
              <Form.Group>
                <Form.Input
                  placeholder="Name your task"
                  value={this.state.taskName}
                  onChange={this.handleTaskNameChange}
                  width={13}
                />
                <Form.Button
                  onClick={this.handleSend}
                  loading={loading}
                  disabled={loading || this.props.coursebin.length === 0}
                  width={3}
                  fluid
                >
                  New Task
                </Form.Button>
              </Form.Group>
            </Form>
          </Segment>
          {content}
        </Segment.Group>
      </>
    );
  }
}

export default connect(
  state => ({
    coursebin: state.course,
    preference: state.preference,
    result: state.task_result,
    tokens: state.user.tokens
  }),
  { saveTaskResult }
)(ResultsWidget);
