import styled from "@emotion/styled";
import { useState } from "react";

interface JsonViewerProps {
  json: any;
  path?: string;
  level?: number;
  isLastItem?: boolean;
  handleLineClick?: (path: string) => void;
  comments?: { path: string; text: string }[];
  selectedPath?: string;
  handleSaveComment?: (path: string, text: string) => void;
}

const JsonViewer = ({
  json,
  path = "",
  level = 0,
  isLastItem = false,
  handleLineClick,
  comments = [],
  selectedPath,
  handleSaveComment,
}: JsonViewerProps) => {
  const [commentText, setCommentText] = useState("");

  const currentKey = path.split(".").pop();

  const renderJsonLine = (children: React.ReactNode) => {
    return (
      <JsonLine
        indent={level}
        hasComment={comments.some((c) => c.path === path)}
        onClick={() => handleLineClick?.(path)}
      >
        {children}

        {renderComment(path)}
        {renderCommentInput()}
      </JsonLine>
    );
  };

  const renderComment = (path: string) => {
    const comment = comments.find((c) => c.path === path);
    if (comment) {
      return <CommentBubble>{comment.text}</CommentBubble>;
    }
    return null;
  };

  const renderCommentInput = () => {
    if (path && selectedPath === path) {
      return (
        <CommentInput>
          <h3>Add Comment</h3>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button onClick={() => handleSaveComment?.(path, commentText)}>
            Save
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLineClick?.("");
              setCommentText("");
            }}
          >
            Cancel
          </button>
        </CommentInput>
      );
    }
    return null;
  };

  const renderComma = () => {
    return <JsonComma>,</JsonComma>;
  };

  const renderKey = () => {
    return currentKey ? (
      <JsonKey>
        <JsonString>"{currentKey}"</JsonString>
        <JsonColon>: </JsonColon>
      </JsonKey>
    ) : (
      ""
    );
  };

  const renderOpenBracket = () => {
    if (typeof json !== "object" || json === null) {
      return "";
    }

    return <JsonBracket>{Array.isArray(json) ? "[" : "{"}</JsonBracket>;
  };

  const renderCloseBracket = () => {
    if (typeof json !== "object" || json === null) {
      return "";
    }

    const bracket = Array.isArray(json) ? "]" : "}";

    return (
      <JsonBracket>
        {bracket}
        {isLastItem ? "" : renderComma()}
      </JsonBracket>
    );
  };

  const renderObject = () => {
    const keys = Object.keys(json);
    return (
      <>
        {renderJsonLine(
          <>
            {renderKey()}
            {renderOpenBracket()}
          </>
        )}

        {keys.map((key, index) => (
          <JsonViewer
            json={json[key]}
            path={`${path}.${key}`}
            key={key}
            level={level + 1}
            isLastItem={index === keys.length - 1}
            handleLineClick={handleLineClick}
            comments={comments}
            selectedPath={selectedPath}
            handleSaveComment={handleSaveComment}
          />
        ))}

        {renderJsonLine(renderCloseBracket())}
      </>
    );
  };

  const renderArray = () => {
    return (
      <>
        {renderJsonLine(
          <>
            {renderKey()}
            {renderOpenBracket()}
          </>
        )}

        {json.map((item: any, index: number) => (
          <JsonViewer
            json={item}
            path={`${path}[${index}]`}
            key={index}
            level={level + 1}
            isLastItem={index === json.length - 1}
            handleLineClick={handleLineClick}
            comments={comments}
            selectedPath={selectedPath}
            handleSaveComment={handleSaveComment}
          />
        ))}

        {renderJsonLine(renderCloseBracket())}
      </>
    );
  };

  const renderPrimitive = () => {
    if (typeof json === "string") {
      return <JsonString>"{json}"</JsonString>;
    }
    if (typeof json === "number") {
      return <JsonNumber>{json}</JsonNumber>;
    }
    if (typeof json === "boolean") {
      return <JsonBoolean>{String(json)}</JsonBoolean>;
    }
    if (json === null) {
      return <JsonNull>{String(json)}</JsonNull>;
    }
  };

  const renderJSON = () => {
    if (typeof json !== "object" || json === null) {
      return renderJsonLine(
        <>
          {renderKey()}
          {renderPrimitive()}
          {isLastItem ? "" : renderComma()}
        </>
      );
    }

    if (Array.isArray(json)) {
      return renderArray();
    }

    return renderObject();
  };

  return <>{renderJSON()}</>;
};
export default JsonViewer;

const JsonKey = styled.span`
  color: #9cdcfe; // VS Code JSON property color
`;

const JsonString = styled.span`
  color: #ce9178; // VS Code string color
`;

const JsonNumber = styled.span`
  color: #b5cea8; // VS Code number color
`;

const JsonBoolean = styled.span`
  color: #569cd6; // VS Code keyword color
`;

const JsonNull = styled.span`
  color: #569cd6; // VS Code keyword color
`;

const JsonBracket = styled.span`
  color: #d4d4d4; // VS Code punctuation color
`;

const JsonColon = styled.span`
  color: #d4d4d4; // VS Code punctuation color
`;

const JsonComma = styled.span`
  color: #d4d4d4; // VS Code punctuation color
`;

const JsonLine = styled.div<{ indent: number; hasComment: boolean }>`
  padding: 4px 0;
  padding-left: ${(props) => props.indent * 20}px;
  position: relative;
  background-color: ${(props) =>
    props.hasComment ? "#fff3cd" : "transparent"};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.hasComment ? "#ffe69c" : "#e9ecef")};
  }
`;

const CommentBubble = styled.div`
  position: absolute;
  right: -220px;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 200px;
  z-index: 1;
`;

const CommentInput = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;

  textarea {
    width: 100%;
    min-height: 100px;
    margin-bottom: 10px;
  }

  button {
    margin-right: 10px;
  }
`;
