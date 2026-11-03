export default function ChatHeader() {
  return (
    <header className="chat-header">
      <div className="chat-avatar" aria-hidden="true">RC</div>
      <div className="chat-heading">
        <h2>RC Labs Cambodia</h2>
        <p>Automated support · Active now</p>
      </div>
      <div className="online-status">
        <span className="online-dot" aria-hidden="true" />
        Active
      </div>
    </header>
  );
}
