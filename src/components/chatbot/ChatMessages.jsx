import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

export default function ChatMessages({
  messages,
  loading,
  typingRef,
  focusMessageId,
  focusMessageRef,
}) {
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          answerRef={message.id === focusMessageId ? focusMessageRef : undefined}
        />
      ))}

      {loading && <TypingIndicator indicatorRef={typingRef} />}
    </div>
  );
}
