import React from "react";
import { Step, Icon, Responsive } from "semantic-ui-react";
import { NavLink } from "react-router-dom";

const StepNav = props => {
  let { path, icon, title, content } = props;
  return (
    <Step as={NavLink} to={path}>
      {icon && <Responsive as={Icon} minWidth={768} name={icon} />}
      <Step.Content>
        {title && <Step.Title>{title}</Step.Title>}
        {content && <Step.Description>{content}</Step.Description>}
      </Step.Content>
    </Step>
  );
};

export default StepNav;
