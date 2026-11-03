export default function Message({ message, answerRef }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row--user" : ""}`}>
      {!isUser && <div className="message-avatar" aria-hidden="true">RC</div>}
      <div ref={answerRef} className="message-bubble">
        {message.content}
      </div>
    </div>
  );
}
