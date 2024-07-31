import React from "react";
import {
  Accordion,
  Segment,
  Header,
  Icon,
  Message,
  Transition
} from "semantic-ui-react";
import CourseEntry from "./CourseEntry";
import {
  addCourse,
  setIncludeCourse,
  setGroupCourse,
  loadCoursebin,
  loadPreferences,
  editSetting,
  loadSetting
} from "../../actions";
import { connect } from "react-redux";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  matchStatusCode,
  excludeStatusCode,
  formatTitle
} from "../../util";
import { toast } from "react-semantic-toasts";
import moment from "moment";
import { coursebinCourseLifetime, fetchCourseTimeout } from "../../settings";
import AddCourseForm from "./AddCourseForm";
import ToolForm from "./ToolForm";
import { Helmet } from "react-helmet";

const errorFormatter = errorFormatterCreator(
  error => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.blame_usc
    ) {
      return `usc.edu did not respond (${error.response.data.fetch_status}). Try again later.`;
    }
    return null;
  },
  matchStatusCode("Your session has expired. Please log in to continue.", [
    401
  ]),
  excludeStatusCode(responseDataFormatter, [404]),
  statusCodeFormatter
);

class CoursebinPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCourses: [],
      toolsOpen: false,
      loading: []
    };
    this.cancelSource = axios.CancelToken.source();
  }

  addLoading = course => {
    if (!this.state.loadingCourses.includes(course)) {
      this.setState(state => ({
        ...state,
        loadingCourses: state.loadingCourses.concat(course)
      }));
    }
  };

  removeLoading = course => {
    this.setState(state => ({
      loadingCourses: state.loadingCourses.filter(item => item !== course)
    }));
  };

  fetchCourse = (course, term) => {
    this.addLoading(course);
    return axios
      .put(
        `/api/courses/${term}/${course}/`,
        {},
        { cancelToken: this.cancelSource.token, timeout: fetchCourseTimeout }
      )
      .then(response => {
        this.removeLoading(course);
        this.props.addCourse(response.data);
      })
      .catch(error => {
        this.removeLoading(course);
        toast({
          type: "error",
          icon: "times",
          title: `Cannot Load ${course.toUpperCase()}`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
      });
  };

  handleRefreshAll = () => {
    this.setState(state => ({
      loading: state.loading.concat("refresh")
    }));
    Promise.allSettled(
      this.props.courses
        .filter(this.needRefresh)
        .map(course => this.fetchCourse(course.course, course.term))
    ).then(() => {
      this.setState(state => ({
        loading: state.loading.filter(item => item !== "refresh")
      }));
    });
  };

  needRefresh = course =>
    moment().diff(moment(course.updated)) >
    coursebinCourseLifetime.asMilliseconds();

  handleSaveCoursebin = () => {
    let { profile } = this.props;
    if (!profile || !profile.saved_task_data) {
      console.log("No account.");
      return;
    }
    this.setState(state => ({
      loading: state.loading.concat("save")
    }));
    axios
      .patch(
        `/api/task-data/${profile.saved_task_data}/`,
        {
          coursebin: this.props.coursebin,
          preference: this.props.preference,
          setting: this.props.setting
        },
        { cancelToken: this.cancelSource.token }
      )
      .then(response => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "save")
        }));
        toast({
          type: "success",
          icon: "cloud upload",
          title: "Settings Saved",
          description: "Successfully saved your settings.",
          time: 10000
        });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Save Settings`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "save")
        }));
      });
  };

  handleLoadCoursebin = () => {
    let { profile } = this.props;
    if (!profile || !profile.saved_task_data) {
      console.log("No account.");
      return;
    }
    this.setState(state => ({
      loading: state.loading.concat("load")
    }));
    axios
      .get(`/api/task-data/${profile.saved_task_data}/`, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "load")
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
          loading: state.loading.filter(item => item !== "load")
        }));
      });
  };

  handleChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  handleSettingChange = (e, { name, value }) => {
    this.props.editSetting({ name, value });
  };

  setGroupHandlerCreator = group => {
    return (e, { node_id }) => {
      this.props.setGroupCourse({ node_id, group });
    };
  };

  componentWillUnmount() {
    this.cancelSource.cancel("axios requests cancelled on coursebin unmount");
  }

  render() {
    let { toolsOpen } = this.props.setting;

    let groupOptions = [...new Set(this.props.courses.map(node => node.group))];
    let courseEntries = this.props.courses.map(course => (
      <CourseEntry
        assignGroup={this.state.assignGroup}
        assignGroupHandler={this.setGroupHandlerCreator(this.state.newGroupId)}
        groupOptions={groupOptions}
        {...course}
      />
    ));

    let loadingCourseMessage = this.state.loadingCourses.length ? (
      <Message
        info
        content={`Loading courses: ${this.state.loadingCourses
          .map(str => str.toUpperCase())
          .join(", ")}`}
      />
    ) : null;

    let isEmpty = this.props.courses.length === 0;

    return (
      <>
        <Helmet>
          <title>{formatTitle("Coursebin")}</title>
        </Helmet>
        <Segment.Group>
          <Segment>
            <Header>Add Course</Header>
            <AddCourseForm onSubmit={this.fetchCourse} />
          </Segment>

          <Segment>
            <Accordion>
              <Accordion.Title
                as={Header}
                active={toolsOpen}
                onClick={this.handleSettingChange}
                value={!toolsOpen}
                name="toolsOpen"
                style={{ marginBottom: "0" }}
              >
                <Icon name="dropdown" />
                Tools
              </Accordion.Title>
              <Accordion.Content
                active={toolsOpen}
                style={{ marginTop: "14px" }}
              >
                <ToolForm
                  onLoad={this.handleLoadCoursebin}
                  onSave={this.handleSaveCoursebin}
                  onRefresh={this.handleRefreshAll}
                  loading={this.state.loading}
                />
              </Accordion.Content>
            </Accordion>
          </Segment>

          <Segment>
            <Header>Coursebin</Header>
            <Transition.Group animation="fade down" duration={200}>
              {loadingCourseMessage}
            </Transition.Group>
            {isEmpty && (
              <Header icon textAlign="center">
                <Icon name="ellipsis horizontal" />
                Your Coursebin is Empty
                <Header.Subheader>
                  Add some courses to make schedules.
                </Header.Subheader>
              </Header>
            )}
            {!isEmpty && (
              <Accordion styled fluid exclusive={false}>
                {courseEntries}
              </Accordion>
            )}
          </Segment>
        </Segment.Group>
      </>
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
    coursebin: state.course,
    preference: state.preference,
    profile: state.user.profile,
    setting: state.setting
  }),
  {
    addCourse,
    setIncludeCourse,
    setGroupCourse,
    loadCoursebin,
    loadPreferences,
    editSetting,
    loadSetting
  }
)(CoursebinPage);
