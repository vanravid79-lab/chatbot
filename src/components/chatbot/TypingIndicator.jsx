export default function TypingIndicator({ indicatorRef }) {
  return (
    <div
      ref={indicatorRef}
      className="typing-indicator"
      role="status"
      aria-label="Assistant is typing"
    >
      <div className="typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
