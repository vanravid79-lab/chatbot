"use client";

import { useState } from "react";
import { formatFaqQuestion } from "@/lib/formatFaqQuestion";

export default function FAQOptions({ questions, onSelect }) {
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  if (questions.length === 0) {
    return null;
  }

  const visibleQuestions = showAllQuestions ? questions : questions.slice(0, 3);
  const remainingCount = questions.length - visibleQuestions.length;

  return (
    <section className="faq-options" aria-label="All questions">
      <h2 className="faq-prompt">Questions</h2>
      <div className="faq-list" id="faq-question-list">
        {visibleQuestions.map((question) => (
          <button
            key={question.id}
            type="button"
            onClick={() => onSelect(question)}
            className="faq-button"
          >
            <span>{formatFaqQuestion(question)}</span>
            <span className="faq-arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {questions.length > 3 && (
        <button
          type="button"
          className="faq-more"
          aria-expanded={showAllQuestions}
          aria-controls="faq-question-list"
          onClick={() => setShowAllQuestions((showing) => !showing)}
        >
          {showAllQuestions
            ? "Show fewer questions"
            : `See ${remainingCount} more questions`}
        </button>
      )}
    </section>
  );
}
