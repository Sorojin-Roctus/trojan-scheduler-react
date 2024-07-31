import React from "react";
import {
  Placeholder,
  Segment,
  Message,
  Item,
  Pagination,
  Label,
  Header,
  Responsive,
  Icon,
  Container
} from "semantic-ui-react";
import moment from "moment";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  errorFormatterCreator,
  statusCodeFormatter,
  formatTitle
} from "../../util";
import { Helmet } from "react-helmet";

const errorFormatter = errorFormatterCreator(statusCodeFormatter);

class TaskListPage extends React.Component {
  constructor(props) {
    super(props);
    let page = 1;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      page = params.get("page");
    }
    this.state = { task_list: null, error: null, loading: false, page };
    this.cancelSource = axios.CancelToken.source();
  }

  loadTaskData = () => {
    this.setState({ loading: true });
    axios
      .get(`/api/tasks/?page=${this.state.page}`, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.setState({ task_list: response.data, loading: false });
      })
      .catch(error => {
        this.setState({ error: errorFormatter(error), loading: false });
      });
  };

  componentDidMount() {
    if (!this.state.task_list) {
      this.loadTaskData();
    }
  }

  componentDidUpdate(prevProps) {
    let page = 1;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      page = params.get("page");
    }
    if (this.state.page !== page) {
      this.setState({ page }, this.loadTaskData);
    }
    if (Boolean(prevProps.tokens) !== Boolean(this.props.tokens)) {
      this.loadTaskData();
    }
  }

  taskStatusLabel = ({ status, message }) => {
    if (status === "PD") {
      return <Label color="blue">pending</Label>;
    } else if (status === "PS") {
      return <Label color="teal">processing</Label>;
    } else if (status === "DN") {
      return <Label color="green">done</Label>;
    } else if (status === "WN") {
      return <Label color="yellow">warning</Label>;
    } else if (status === "ER") {
      return <Label color="red">error</Label>;
    } else if (status === "EX") {
      return <Label color="red">{`exception ${message}`}</Label>;
    } else {
      return null;
    }
  };

  taskErrorMessage = ({ status, message }) => {
    if (status === "WN") {
      return <p>{`Warning: ${message}`}</p>;
    } else if (status === "ER") {
      return <p>{`Error: ${message}`}</p>;
    } else if (status === "EX") {
      return <p>{`Task failed with exception ${message}`}</p>;
    }
  };

  handlePaginationChange = (e, { activePage }) => {
    let query = new URLSearchParams();
    query.set("page", activePage);
    this.props.history.push(
      this.props.location.pathname + "?" + query.toString()
    );
  };

  componentWillUnmount() {
    this.cancelSource.cancel(
      "axios requests cancelled on task list page unmount"
    );
  }

  render() {
    let { task_list, error, loading } = this.state;
    let message = null;
    if (error) {
      message = <Message error>{error}</Message>;
    } else if (task_list && task_list.detail) {
      message = <Message error>{task_list.detail}</Message>;
    }

    let content = null;
    let pagination = null;
    if (!loading && task_list && task_list.results) {
      if (task_list.results.length === 0) {
        content = (
          <Header icon textAlign="center">
            <Icon name="ellipsis horizontal" />
            No Task Found
            <Header.Subheader>
              Use the scheduler to create tasks.
            </Header.Subheader>
          </Header>
        );
      } else {
        content = (
          <Item.Group divided>
            {task_list.results.map(task => {
              let errorMessage = this.taskErrorMessage(task);
              return (
                <Item key={task.id}>
                  <Item.Content>
                    <Item.Header as={Link} to={task.id + "/"}>
                      {task.name ? task.name : `Task ${task.id}`}
                    </Item.Header>
                    <Item.Meta>
                      {task.count} schedules, created{" "}
                      {moment(task.created).fromNow()}
                    </Item.Meta>
                    {(errorMessage || task.description) && (
                      <Item.Extra style={{ marginBottom: 7 }}>
                        {task.description && <p>{task.description}</p>}
                        {errorMessage}
                      </Item.Extra>
                    )}
                    {this.taskStatusLabel(task)}
                  </Item.Content>
                </Item>
              );
            })}
          </Item.Group>
        );
        pagination = (
          <>
            <Responsive
              as={Pagination}
              minWidth={500}
              nextItem={null}
              prevItem={null}
              siblingRange={2}
              activePage={this.state.page}
              onPageChange={this.handlePaginationChange}
              totalPages={task_list.total_pages}
            />
            <Responsive
              as={Pagination}
              maxWidth={499}
              boundaryRange={0}
              ellipsisItem={null}
              nextItem={null}
              prevItem={null}
              siblingRange={2}
              activePage={this.state.page}
              onPageChange={this.handlePaginationChange}
              totalPages={task_list.total_pages}
            />
          </>
        );
      }
    }

    let placeholder = null;
    if (loading) {
      placeholder = (
        <Placeholder>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
        </Placeholder>
      );
    }

    return (
      <Container className="main-content">
        <Helmet>
          <title>{formatTitle("Tasks")}</title>
        </Helmet>
        <Segment.Group>
          <Segment padded className="dynamic">
            <Header as="h1">Tasks</Header>
          </Segment>
          <Segment padded className="dynamic">
            {message}
            {placeholder}
            {content}
          </Segment>
        </Segment.Group>
        {pagination}
      </Container>
    );
  }
}

export default connect(state => ({
  tokens: state.user.tokens
}))(TaskListPage);
