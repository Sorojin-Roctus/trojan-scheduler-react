import React from "react";
import { siteName } from "./settings";

const createCourse = courseData => ({
  type: "course",
  course: courseData.name,
  term: courseData.term,
  updated: courseData.updated,
  key: courseData.name,
  node_id: courseData.name
});

const createPart = (course, partNum) => ({
  type: "part",
  course: course.course,
  part: partNum,
  key: course.key + "." + partNum,
  node_id: course.node_id + "." + partNum,
  parent: course.node_id
});

const createComponent = (part, componentName) => ({
  type: "component",
  course: part.course,
  part: part.part,
  component: componentName,
  key: part.key + "." + componentName,
  node_id: part.node_id + "." + componentName,
  parent: part.node_id
});

const createSection = (component, sectionData) => ({
  type: "section",
  course: component.course,
  part: component.part,
  component: component.component,
  key: component.key + "." + sectionData.section_id,
  node_id: component.node_id + "." + sectionData.section_id,
  parent: component.node_id,
  ...sectionData
});

export const transformCourse = course => {
  let result = [];

  // course node
  let currCourse = createCourse(course);
  result.push(currCourse);

  let componentsVisited = new Set();
  let currPart = null;
  let currComponent = null;
  let partCount = 0;
  let prevType = null;

  for (let section of course.sections) {
    if (prevType !== section.section_type) {
      if (componentsVisited.has(section.section_type) || partCount === 0) {
        // new part node
        currPart = createPart(currCourse, partCount);
        partCount++;

        result.push(currPart);

        componentsVisited.clear();
      }

      // new component node
      currComponent = createComponent(currPart, section.section_type);

      result.push(currComponent);
      componentsVisited.add(currComponent.component);

      prevType = section.section_type;
    }

    result.push(createSection(currComponent, section));
  }

  return result;
};

export const join = (base, path) => {
  return base.charAt(base.length - 1) === "/" ? base + path : base + "/" + path;
};

export const addTrailingSlash = url => {
  return url.charAt(url.length - 1) === "/" ? url : url + "/";
};

export const getScheduleName = (schedule, altId) => {
  if (schedule && schedule.name) return schedule.name;
  if (schedule && schedule.id) return `Schedule ${schedule.id}`;
  if (altId) return `Schedule ${altId}`;
  return "Schedule ?";
};

export const getTaskName = (task, altId) => {
  if (task && task.name) return task.name;
  if (task && task.id) return `Task ${task.id}`;
  if (altId) return `Task ${altId}`;
  return "Task ?";
};

export const errorFormatterCreator = (...formatters) => error => {
  let message = null;
  for (let formatter of formatters) {
    if ((message = formatter(error))) return message;
  }
  return String(error);
};

export const matchStatusCode = (formatter, statusList) => error => {
  if (
    error.response &&
    error.response.status &&
    statusList.includes(error.response.status)
  ) {
    if (typeof formatter === "function") return formatter(error);
    return String(formatter);
  }
  return null;
};

export const excludeStatusCode = (formatter, statusList) => error => {
  if (
    error.response &&
    error.response.status &&
    !statusList.includes(error.response.status)
  ) {
    if (typeof formatter === "function") return formatter(error);
    return String(formatter);
  }
  return null;
};

export const noPermissionFormatter = (message, status = [401, 403]) =>
  matchStatusCode(message, status);

export const statusCodeFormatter = error => {
  if (error.response && error.response.status && error.response.statusText) {
    return error.response.status + " " + error.response.statusText;
  }
  return null;
};

const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatKey = key => {
  if (key === null || key === "detail" || key === "description") return "";
  return capitalizeFirstLetter(key.replace(/_+/, " ")) + ": ";
};

const flattenErrorData = (data, parentKey = null) => {
  if (typeof data != "object") {
    return String(data);
  }
  let messages = [];
  for (let key in data) {
    let keyName = Array.isArray(data) ? parentKey : key;
    if (Array.isArray(data[key])) {
      messages.push(...flattenErrorData(data[key], key));
    } else if (typeof data[key] == "object") {
      messages.push(...flattenErrorData(data[key], key));
    } else {
      messages.push(`${formatKey(keyName)}${data[key]}`);
    }
  }
  return messages;
};

export const responseDataFormatter = error => {
  if (
    error.response &&
    error.response.data &&
    typeof error.response.data == "object"
  ) {
    return flattenErrorData(error.response.data).join("\n");
  }
  return null;
};

export const str2para = str =>
  str.split("\n").map((line, index) => <p key={index}>{line}</p>);

export const formatTitle = title => title + " | " + siteName;
