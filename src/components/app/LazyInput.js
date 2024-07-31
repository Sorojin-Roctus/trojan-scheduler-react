import React, { useState, useEffect } from "react";
import { Input } from "semantic-ui-react";

const LazyInput = props => {
  let [value, setValue] = useState(props.value);
  let [focus, setFocus] = useState(false);
  useEffect(() => {
    if (!focus && props.value !== value) {
      setValue(props.value);
    }
  }, [props.value, value, focus]);
  return (
    <Input
      {...props}
      onChange={(e, { value }) => {
        setFocus(true);
        setValue(value);
      }}
      value={value}
      onBlur={() => {
        setFocus(false);
        props.onChange(value);
      }}
    />
  );
};

export default LazyInput;
