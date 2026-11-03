"use client";

export default function FAQOptions({ questions, onSelect, hasAskedQuestion }) {
  const nextQuestion = questions[0];

  if (!nextQuestion) {
    return null;
  }

  return (
    <div className="faq-options">
      <div className="faq-list">
        <button
          type="button"
          onClick={() => onSelect(nextQuestion)}
          className="faq-button"
        >
          <span>{nextQuestion.question}</span>
          <span className="faq-arrow" aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}
