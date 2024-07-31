import React from "react";
import { Button } from "semantic-ui-react";

const ShareButtons = props => {
  let { title, link, description } = props;
  return (
    <div>
      <Button
        circular
        color="facebook"
        icon="facebook"
        compact
        as="a"
        href={encodeURI(
          `https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${title}`
        )}
        title="Share on Facebook"
        target="_blank"
        rel="noopener noreferrer"
      />
      <Button
        circular
        color="twitter"
        icon="twitter"
        compact
        as="a"
        href={encodeURI(
          `https://twitter.com/intent/tweet?source=${link}&text=${title}: ${link}`
        )}
        target="_blank"
        title="Tweet"
        rel="noopener noreferrer"
      />
      <Button
        circular
        color="google plus"
        icon="google plus"
        compact
        as="a"
        href={encodeURI(`https://plus.google.com/share?url=${link}`)}
        target="_blank"
        title="Share on Google+"
        rel="noopener noreferrer"
      />
      <Button
        circular
        color="orange"
        style={{ backgroundColor: "#FF5700" }}
        icon="reddit alien"
        compact
        as="a"
        href={encodeURI(
          `http://www.reddit.com/submit?url=${link}&title=${title}`
        )}
        target="_blank"
        title="Submit to Reddit"
        rel="noopener noreferrer"
      />
      <Button
        circular
        icon="mail"
        compact
        as="a"
        href={encodeURI(
          `mailto:?subject=${title}&body=${description}: ${link}`
        )}
        target="_blank"
        title="Send email"
        rel="noopener noreferrer"
      />
    </div>
  );
};

export default ShareButtons;
