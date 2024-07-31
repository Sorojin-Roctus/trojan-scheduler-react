import React from "react";
import { Button } from "semantic-ui-react";

const toggleButton = props => {
  let {
    posColor,
    negColor,
    posContent,
    negContent,
    values,
    name,
    onClick,
    positive,
    loading
  } = props;
  return (
    <Button
      className="schedule-button"
      color={positive ? posColor : negColor}
      loading={loading}
      disabled={loading}
      onClick={onClick}
      name={name}
      values={values}
      content={positive ? posContent : negContent}
    />
  );
};

export default toggleButton;
