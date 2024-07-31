import React from "react";
import { Header, Icon, Grid, Container } from "semantic-ui-react";
import { Helmet } from "react-helmet";
import { formatTitle } from "../util";

const WorkInProgress = () => {
  return (
    <Container className="main-content">
      <Helmet>
        <title>{formatTitle("404")}</title>
      </Helmet>
      <Grid>
        <Grid.Column textAlign="center" style={{ paddingTop: "20vh" }}>
          <Header icon size="huge">
            <Icon name="coffee" />
            Work In Progress
            <Header.Subheader>
              Something is supposed to be here. We are working on it.
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default WorkInProgress;
