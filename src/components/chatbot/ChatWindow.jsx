"use client";

import { useState, useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import FAQOptions from "./FAQOptions";

export default function ChatWindow() {
  const [faqData, setFaqData] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! 👋 Welcome to RC Labs Cambodia. How can I help you today?",
    },
  ]);

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);

  const selectedAnswerRef = useRef(null);
  const hasAskedQuestion = messages.some((message) => message.role === "user");

  // Load all questions and answers from Excel API
  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const response = await fetch("/api/faqs");

        if (!response.ok) {
          throw new Error("Failed to load FAQ data.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Unable to load FAQ data.");
        }

        setFaqData(result.data || []);
      } catch (err) {
        console.error("API error:", err);
        setError(err.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchFAQ();
  }, []);

  // Bring the selected answer into view, even when more questions remain below.
  useEffect(() => {
    selectedAnswerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [selectedAnswerId]);

  // When user clicks a question
  const selectQuestion = (item) => {
    setFaqData((previous) =>
      previous.filter((question) => question.id !== item.id),
    );

    // Add selected question to conversation
    const userMessage = {
      id: `question-${item.id}-${Date.now()}`,
      role: "user",
      content: item.question,
    };

    // Get answer from Excel API data
    let answer = item.answerEnglish || "";

    if (item.answerKhmer) {
      answer += answer ? "\n\n" + item.answerKhmer : item.answerKhmer;
    }

    if (!answer) {
      answer =
        "Sorry, an answer to this question isn’t available yet. Please contact RC Labs Cambodia for help.";
    }

    // Add chatbot answer
    const botMessage = {
      id: `answer-${item.id}-${Date.now()}`,
      role: "assistant",
      content: answer,
    };

    setSelectedAnswerId(botMessage.id);
    setMessages((previous) => [...previous, userMessage, botMessage]);
  };

  return (
    <main className="support-page">
      <div className="support-layout">
        <aside className="intro-panel">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              RC
            </div>
            <div>
              <div className="brand-name">RC Labs Cambodia</div>
              <div className="brand-caption">Customer care</div>
            </div>
          </div>

          <div className="intro-copy">
            <div className="intro-eyebrow">Here to help</div>
            <h1>Good support starts with a conversation.</h1>
            <p>
              Choose a question to get clear, helpful information from RC Labs
              Cambodia.
            </p>
          </div>

          <div className="intro-bottom">
            <span className="language-icon" aria-hidden="true">
              文
            </span>
            <span>Support available in English and Khmer</span>
          </div>
        </aside>

        <section className="chat-panel" aria-label="RC Labs support chat">
          <ChatHeader />

          <div className="chat-conversation" aria-live="polite">
            <ChatMessages
              messages={messages}
              loading={false}
              focusMessageId={selectedAnswerId}
              focusMessageRef={selectedAnswerRef}
            />

            {dataLoading && (
              <p className="loading-note" role="status">
                Loading helpful questions…
              </p>
            )}

            {error && (
              <p className="error-note" role="alert">
                We couldn’t load the questions just now. Please refresh to try
                again.
              </p>
            )}

            {!dataLoading && !error && faqData.length > 0 && (
              <FAQOptions
                questions={faqData}
                onSelect={selectQuestion}
                hasAskedQuestion={hasAskedQuestion}
              />
            )}

            {!dataLoading && !error && faqData.length === 0 && (
              <p className="empty-note">
                {hasAskedQuestion
                  ? "You’ve explored all the quick questions. Scroll up to revisit an answer."
                  : "There are no quick questions available right now."}
              </p>
            )}
          </div>

          <footer className="chat-footer">
            <span className="footer-lock" aria-hidden="true">
              ●
            </span>
            <span>Tap a question above to get a quick answer</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
