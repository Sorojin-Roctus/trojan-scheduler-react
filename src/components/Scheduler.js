import React from "react";
import {
  Container,
  Menu,
  Dropdown,
  List,
  Segment,
  Responsive
} from "semantic-ui-react";
import { Route, Switch, NavLink, Link } from "react-router-dom";
import LandingPage from "./LandingPage";
import LoginButton from "./account/LoginButton";
import SignupButton from "./account/SignupButton";

import { SemanticToastContainer } from "react-semantic-toasts";
import "react-semantic-toasts/styles/react-semantic-alert.css";
import TokenHandler from "./TokenHandler";
import AccountPage from "./account/AccountPage";
import TaskListPage from "./schedule/TaskListPage";
import SchedulePage from "./schedule/SchedulePage";
import TaskPage from "./schedule/TaskPage";
import NotFound from "./NotFound";
import WorkInProgress from "./WorkInProgress";
import AppPage from "./app/AppPage";
import ScheduleListPage from "./schedule/ScheduleListPage";
import EmailVerificationPage from "./account/EmailVerificationPage";
import PasswordResetPage from "./account/PasswordResetPage";
import PasswordForgetPage from "./account/PasswordForgetPage";
import About from "./staticPages/About";
import Guide from "./staticPages/Guide";

const PageContent = () => (
  <>
    <Menu fixed="top" inverted>
      <Responsive
        as={Dropdown}
        maxWidth={719}
        item
        icon="content"
        className="menu-more"
        value={null}
      >
        <Dropdown.Menu className="large-dropdown">
          <Dropdown.Item as={NavLink} to="/" exact>
            Home
          </Dropdown.Item>
          <Responsive as={React.Fragment} maxWidth={499}>
            <Dropdown.Item as={NavLink} to="/app/">
              App
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/task/">
              Tasks
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/schedule/">
              Schedules
            </Dropdown.Item>
          </Responsive>
          <Menu.Item as={NavLink} to="/guide/" exact>
            Guide
          </Menu.Item>
          <Dropdown.Item as={NavLink} to="/about/" exact>
            About
          </Dropdown.Item>
        </Dropdown.Menu>
      </Responsive>

      <Container>
        <Responsive as={React.Fragment} minWidth={500}>
          <Responsive as={React.Fragment} minWidth={720}>
            <Menu.Item as={Link} header to="/">
              Trojan Scheduler
            </Menu.Item>
          </Responsive>
          <Menu.Item as={NavLink} to="/app/">
            App
          </Menu.Item>
          <Menu.Item as={NavLink} to="/task/">
            Tasks
          </Menu.Item>
          <Menu.Item as={NavLink} to="/schedule/">
            Schedules
          </Menu.Item>
          <Responsive as={React.Fragment} minWidth={720}>
            <Menu.Item as={NavLink} to="/guide/" exact>
              Guide
            </Menu.Item>
            <Menu.Item as={NavLink} to="/about/" exact>
              About
            </Menu.Item>
          </Responsive>
        </Responsive>

        <Menu.Menu position="right">
          <Menu.Item>
            <LoginButton />
            <SignupButton />
          </Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>

    <Switch>
      <Route path="/" exact component={LandingPage} />=
      <Route path="/app" component={AppPage} />
      <Route
        path="/task/:id"
        exact
        render={routeProps => (
          <TaskPage task_id={routeProps.match.params.id} {...routeProps} />
        )}
      />
      <Route
        path="/schedule/:id"
        exact
        render={routeProps => (
          <SchedulePage
            schedule_id={routeProps.match.params.id}
            {...routeProps}
          />
        )}
      />
      <Route path="/task/" exact component={TaskListPage} />
      <Route path="/schedule/" exact component={ScheduleListPage} />
      <Route path="/account/" exact component={AccountPage} />
      <Route path="/email/verify/" exact component={EmailVerificationPage} />
      <Route path="/password/reset/" exact component={PasswordResetPage} />
      <Route path="/password/forget/" exact component={PasswordForgetPage} />
      <Route path="/about/" exact component={About} />
      <Route path="/guide/" exact component={Guide} />
      <Route path="/faq/" exact component={WorkInProgress} />
      <Route path="/change-log/" exact component={WorkInProgress} />
      <Route path="/contact/" exact component={WorkInProgress} />
      <Route component={NotFound} />
    </Switch>

    <Segment inverted vertical className="footer">
      <Container textAlign="center">
        <List horizontal inverted divided link size="small">
          <List.Item as={Link} to="/">
            Home
          </List.Item>
          <List.Item as={Link} to="/about/">
            About
          </List.Item>
          <List.Item as={Link} to="/about/#contact">
            Contact
          </List.Item>
        </List>
      </Container>
    </Segment>
    <SemanticToastContainer position="bottom-right" />
  </>
);

class Scheduler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Switch>
        <Route
          path="/password/token/"
          exact
          render={routeProps => (
            <TokenHandler to="/password/reset/" {...routeProps} />
          )}
        />
        <Route
          path="/email/token/"
          exact
          render={routeProps => (
            <TokenHandler to="/email/verify/" {...routeProps} />
          )}
        />
        <Route component={PageContent} />
      </Switch>
    );
  }
}

export default Scheduler;
