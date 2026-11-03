export default function TypingIndicator({ indicatorRef }) {
  return (
    <div
      ref={indicatorRef}
      className="typing-indicator"
      role="status"
      aria-label="RC Labs is typing"
    >
      <div className="message-avatar" aria-hidden="true">RC</div>
      <div className="typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
