import React from "react";
import { Segment, Header, Image, Container } from "semantic-ui-react";
import coursebinPNG from "./img/coursebin.png";
import csci356PNG from "./img/csci356.png";
import resultPagePNG from "./img/result_page.png";
import schedulesPNG from "./img/schedules.png";

const Guide = () => {
  return (
    <Container text className="main-content">
      <Segment padded="very" className="dynamic larger-text">
        <Header as="h1">Getting Started</Header>
        <p>
          Trojan Scheduler is a web app that helps USC students make class
          schedules.
        </p>
        <p>
          This tutorial covers the usage of Trojan Scheduler. The first part
          covers the basics and shows you how to make your first schedule. The
          second part talks about more advanced topics and scheduling behavior
          customization.
        </p>
        <Header as="h2">The Basics</Header>
        <p>
          First, go to the{" "}
          <a href="/app/coursebin/" target="_blank">
            coursebin page
          </a>{" "}
          of the scheduler app. It is similar to USC WebReg's coursebin: you
          begin by placing courses you want to make schedules with in the bin.
          If you haven't used the app in the past, it should be empty at this
          point.{" "}
        </p>
        <Image src={coursebinPNG} size="big" />
        <p>
          Now go ahead and select the term you want to schedule for from the
          dropdown menu under "Add Course". Then put the name of the course
          (usually in the form of abcd-123) in the "Course" input box and click
          "Add". Now you should see the course you just added appear in your
          coursebin.
        </p>
        <Image src={csci356PNG} size="big" />
        <p>
          You can click the name of the course to expand it and see its details.
          There are also a few buttons and checkboxes you can play with, and we
          will talk about that in the next part. Repeat the steps above to add a
          few more courses. After adding all courses you want to make schedule
          with, navigate to the results page of the app. It should show a list
          of courses you have selected.
        </p>
        <Image src={resultPagePNG} size="big" />
        <p>
          Click the "New Task" button to generate schedules. Optionally, name
          the task using the input box next to the button. After the task is
          completed, you can go and check out the shiny schedules by clicking
          the "Results" button.
        </p>
        <Image src={schedulesPNG} size="big" />
        <Header as="h2">Advanced Topics</Header>
        <p>Work in progress...</p>
      </Segment>
    </Container>
  );
};

export default Guide;
