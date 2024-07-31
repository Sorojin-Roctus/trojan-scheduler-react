import React from "react";
import {
  Placeholder,
  Segment,
  Message,
  Item,
  Pagination,
  Icon,
  Popup,
  Header,
  Button,
  Responsive,
  Container
} from "semantic-ui-react";
import moment from "moment";
import { connect } from "react-redux";
import { editSetting } from "../../actions";
import { Link } from "react-router-dom";
import axios from "axios";
import ScheduleStatus from "./ScheduleStatus";
import {
  errorFormatterCreator,
  statusCodeFormatter,
  formatTitle
} from "../../util";
import { Helmet } from "react-helmet";

const errorFormatter = errorFormatterCreator(statusCodeFormatter);

const str2bool = str => ["", "True", "TRUE", "true"].includes(str);

class ScheduleListPage extends React.Component {
  constructor(props) {
    super(props);
    let page = 1,
      savedOnly = props.setting.savedOnly,
      publicOnly = props.setting.publicOnly;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      if (params.has("page")) page = Number(params.get("page"));
      if (params.has("saved")) savedOnly = str2bool(params.get("saved"));
      if (params.has("public")) publicOnly = str2bool(params.get("public"));
    }
    this.state = {
      schedule_list: null,
      error: null,
      loading: false,
      page,
      savedOnly,
      publicOnly
    };
    this.cancelSource = axios.CancelToken.source();
  }

  loadScheduleData = () => {
    let { page, savedOnly, publicOnly } = this.state;
    let query = new URLSearchParams();
    query.set("page", page);
    if (savedOnly) query.set("saved", savedOnly);
    if (publicOnly) query.set("public", publicOnly);
    this.setState({ loading: true });
    axios
      .get(`/api/schedules/?${query.toString()}`, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.setState({ schedule_list: response.data, loading: false });
      })
      .catch(error =>
        this.setState({ error: errorFormatter(error), loading: false })
      );
  };

  componentDidMount() {
    if (!this.state.schedule_list) {
      this.loadScheduleData();
    }
  }

  componentDidUpdate(prevProps) {
    let page = 1,
      savedOnly = true,
      publicOnly = false;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      if (params.has("page")) page = Number(params.get("page"));
      if (params.has("saved")) savedOnly = str2bool(params.get("saved"));
      if (params.has("public")) publicOnly = str2bool(params.get("public"));
      if (
        this.state.page !== page ||
        this.state.savedOnly !== savedOnly ||
        this.state.publicOnly !== publicOnly
      ) {
        this.setState({ page, publicOnly, savedOnly }, this.loadScheduleData);
      }
    } else if (
      this.props.setting.savedOnly !== this.state.savedOnly ||
      this.props.setting.publicOnly !== this.state.publicOnly
    ) {
      this.setState(
        {
          savedOnly: this.props.setting.savedOnly,
          publicOnly: this.props.setting.publicOnly
        },
        this.loadScheduleData
      );
    }
    if (Boolean(prevProps.tokens) !== Boolean(this.props.tokens)) {
      this.loadScheduleData();
    }
  }

  handlePaginationChange = (e, { activePage }) => {
    let query = new URLSearchParams();
    let { savedOnly, publicOnly } = this.state;
    query.set("page", activePage);
    query.set("saved", savedOnly);
    query.set("public", publicOnly);
    this.props.history.push(
      this.props.location.pathname + "?" + query.toString()
    );
  };

  handleSavedPublicChange = (e, { name }) => {
    let { savedOnly, publicOnly } = this.state;
    if (name === "saved") {
      savedOnly = !savedOnly;
      this.props.editSetting({ name: "savedOnly", value: savedOnly });
    }
    if (name === "public") {
      publicOnly = !publicOnly;
      this.props.editSetting({ name: "publicOnly", value: publicOnly });
    }
    let query = new URLSearchParams();
    query.set("saved", savedOnly);
    query.set("public", publicOnly);
    this.props.history.push(
      this.props.location.pathname + "?" + query.toString()
    );
  };

  expireWarning = schedule => {
    let created = moment(schedule.created);
    let expireAt = created.add(30, "d");
    let timeToExpire = expireAt.diff(moment());
    let timeStr = timeToExpire > 0 ? expireAt.fromNow() : "anytime soon";
    if (timeToExpire < moment.duration(30, "m").asMilliseconds()) {
      return (
        <Popup
          trigger={<Icon name="trash alternate" color="yellow" size="large" />}
          content={`Will be removed ${timeStr}.`}
        />
      );
    } else if (timeToExpire < moment.duration(5, "d").asMilliseconds()) {
      return (
        <Popup
          trigger={<Icon name="clock" color="yellow" size="large" />}
          content={`Expire ${timeStr}.`}
        />
      );
    }
    return null;
  };

  componentWillUnmount() {
    this.cancelSource.cancel(
      "axios requests cancelled on schedule list page unmount"
    );
  }

  render() {
    let { schedule_list, error, loading } = this.state;
    let message = null;
    if (error) {
      message = <Message error>{error}</Message>;
    } else if (schedule_list && schedule_list.detail) {
      message = <Message error>{schedule_list.detail}</Message>;
    }

    let content = null;
    let pagination = null;
    if (!loading && schedule_list && schedule_list.results) {
      if (schedule_list.results.length === 0) {
        content = (
          <Header icon textAlign="center">
            <Icon name="ellipsis horizontal" />
            No Schedule Found
            <Header.Subheader>
              Use the scheduler to create schedules.
            </Header.Subheader>
          </Header>
        );
      } else {
        content = (
          <Item.Group divided>
            {schedule_list.results.map(schedule => (
              <Item key={schedule.id}>
                <Item.Content>
                  <Item.Header as={Link} to={schedule.id + "/"}>
                    {schedule.name ? schedule.name : `Schedule ${schedule.id}`}
                  </Item.Header>
                  <Item.Meta>
                    Total cost {schedule.total_score}, created{" "}
                    {moment(schedule.created).fromNow()}
                  </Item.Meta>
                  {schedule.description && (
                    <Item.Extra>{schedule.description}</Item.Extra>
                  )}
                  <ScheduleStatus schedule={schedule} />
                </Item.Content>
              </Item>
            ))}
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
              totalPages={schedule_list.total_pages}
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
              totalPages={schedule_list.total_pages}
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

    let { savedOnly, publicOnly } = this.state;

    return (
      <Container className="main-content">
        <Helmet>
          <title>{formatTitle("Schedules")}</title>
        </Helmet>
        <Segment.Group>
          <Segment padded className="dynamic">
            <Header as="h1" style={{ display: "inline-block" }}>
              Schedules
            </Header>
            <Button.Group floated="right">
              <Button
                color={savedOnly ? "green" : null}
                name="saved"
                onClick={this.handleSavedPublicChange}
              >
                <Responsive as="span" minWidth={419}>
                  saved
                </Responsive>
                <Responsive as={Icon} name="save" fitted maxWidth={420} />
              </Button>
              <Button
                color={publicOnly ? "blue" : null}
                name="public"
                onClick={this.handleSavedPublicChange}
              >
                <Responsive as="span" minWidth={419}>
                  public
                </Responsive>
                <Responsive as={Icon} name="child" fitted maxWidth={420} />
              </Button>
            </Button.Group>
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

export default connect(
  state => ({
    tokens: state.user.tokens,
    setting: state.setting
  }),
  { editSetting }
)(ScheduleListPage);
