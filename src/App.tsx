import { useState } from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FileInput = styled.input`
  margin-bottom: 20px;
`;

const JsonContainer = styled.div`
  background: #1e1e1e; // VS Code editor background
  padding: 20px;
  border-radius: 8px;
  position: relative;
  font-family: "Consolas", "Monaco", monospace;
`;

const JsonLine = styled.div<{
  indent: number;
  hasComment: boolean;
  isAddingComment: boolean;
}>`
  padding: 4px 0;
  padding-left: ${(props) => props.indent * 20}px;
  position: relative;
  cursor: pointer;
  background-color: ${(props) =>
    props.hasComment || props.isAddingComment ? "#fff3cd" : "transparent"};

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
  position: fixed;
  top: 50%;
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

function App() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [comments, setComments] = useState<{ path: string; text: string }[]>(
    []
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setJsonData(json);
        } catch (_: any) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const renderJsonLine = ({
    children,
    path,
    level,
  }: {
    children: React.ReactNode;
    path: string;
    level: number;
  }) => {
    return (
      <JsonLine
        indent={level}
        hasComment={comments.some((c) => c.path === path)}
        onClick={() => handleLineClick(path)}
        isAddingComment={!!path && selectedPath === path}
      >
        {children}
        {renderComment(path)}
      </JsonLine>
    );
  };

  const renderJson = (
    obj: any,
    path: string = "",
    level: number = 0,
    isLastItem: boolean = false
  ) => {
    if (typeof obj !== "object" || obj === null) {
      return renderJsonLine({
        children: typeof obj === "string" ? `"${obj}"` : String(obj),
        path,
        level,
      });
    }

    const isArray = Array.isArray(obj);
    const keys = Object.keys(obj);

    return (
      <>
        {level === 0 &&
          renderJsonLine({
            children: (
              <JsonBracket>
                {isArray ? (
                  <JsonBracket>{"["}</JsonBracket>
                ) : (
                  <JsonBracket>{"{"}</JsonBracket>
                )}
              </JsonBracket>
            ),
            path,
            level,
          })}

        {keys.map((key, index) => {
          const value = obj[key];
          const currentPath = `${path}${isArray ? `[${index}]` : `.${key}`}`;

          const isLastItem = index === keys.length - 1;
          const isValueObject = typeof value === "object" && value !== null;
          const isValueArray = Array.isArray(value);
          const needsComma = !isValueObject && !isLastItem;

          let valueString;
          if (isValueArray) {
            valueString = <JsonBracket>{"["}</JsonBracket>;
          } else if (isValueObject) {
            valueString = <JsonBracket>{"{"}</JsonBracket>;
          } else if (typeof value === "string") {
            valueString = <JsonString>"{value}"</JsonString>;
          } else if (typeof value === "number") {
            valueString = <JsonNumber>{value}</JsonNumber>;
          } else if (typeof value === "boolean") {
            valueString = <JsonBoolean>{String(value)}</JsonBoolean>;
          } else if (value === null) {
            valueString = <JsonNull>null</JsonNull>;
          } else {
            valueString = <span>{String(value)}</span>;
          }

          return (
            <div key={currentPath}>
              {renderJsonLine({
                children: (
                  <>
                    {!isArray && (
                      <>
                        <JsonKey>"{key}"</JsonKey>
                        <JsonColon>: </JsonColon>
                      </>
                    )}
                    {valueString}
                    {needsComma && <JsonComma>,</JsonComma>}
                  </>
                ),
                path: currentPath,
                level,
              })}

              {isValueObject &&
                renderJson(value, currentPath, level + 1, isLastItem)}
            </div>
          );
        })}

        {renderJsonLine({
          children: (
            <>
              <JsonBracket>{isArray ? "]" : "}"}</JsonBracket>
              {level !== 0 && !isLastItem && <JsonComma>,</JsonComma>}
            </>
          ),
          path,
          level,
        })}
      </>
    );
  };

  const handleLineClick = (path: string) => {
    setSelectedPath(path);
  };

  const handleAddComment = () => {
    if (selectedPath && commentText.trim()) {
      setComments((prev) => [
        ...prev,
        { path: selectedPath, text: commentText },
      ]);
      setSelectedPath(null);
      setCommentText("");
    }
  };

  const renderComment = (path: string) => {
    const comment = comments.find((c) => c.path === path);
    if (comment) {
      return <CommentBubble>{comment.text}</CommentBubble>;
    }
    return null;
  };

  return (
    <Container>
      <h1>JSON Viewer</h1>
      <FileInput type="file" accept=".json" onChange={handleFileUpload} />

      {jsonData && <JsonContainer>{renderJson(jsonData)}</JsonContainer>}

      {selectedPath && (
        <CommentInput>
          <h3>Add Comment</h3>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment..."
          />
          <button onClick={handleAddComment}>Save</button>
          <button onClick={() => setSelectedPath(null)}>Cancel</button>
        </CommentInput>
      )}
    </Container>
  );
}

export default App;
