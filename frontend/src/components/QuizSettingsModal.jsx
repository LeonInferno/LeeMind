import { useState } from "react";

const COUNTS = [5, 10, 15, 20];

export default function QuizSettingsModal({ onConfirm, onClose }) {
  const [count, setCount] = useState(10);
  const [questionType, setQuestionType] = useState("multiple-choice");

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modalBackdrop" onClick={handleBackdrop}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">📝 Quiz Settings</div>
          <button className="modalClose" onClick={onClose} type="button">✕</button>
        </div>

        <div className="modalBody">
          <div className="quizSettingGroup">
            <div className="quizSettingLabel">Number of questions</div>
            <div className="quizCountGrid">
              {COUNTS.map(n => (
                <button
                  key={n}
                  className={`quizCountBtn ${count === n ? "active" : ""}`}
                  onClick={() => setCount(n)}
                  type="button"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="quizSettingGroup">
            <div className="quizSettingLabel">Question type</div>
            <div className="quizTypeRow">
              <button
                className={`quizTypeBtn ${questionType === "multiple-choice" ? "active" : ""}`}
                onClick={() => setQuestionType("multiple-choice")}
                type="button"
              >
                <span className="quizTypeBtnIcon">🔘</span>
                Multiple Choice
              </button>
              <button
                className={`quizTypeBtn ${questionType === "short-answer" ? "active" : ""}`}
                onClick={() => setQuestionType("short-answer")}
                type="button"
              >
                <span className="quizTypeBtnIcon">✏️</span>
                Short Answer
              </button>
            </div>
          </div>
        </div>

        <div className="modalFooter">
          <button className="btnGhost" onClick={onClose} type="button">Cancel</button>
          <button
            className="btnPrimary"
            onClick={() => onConfirm({ count, questionType })}
            type="button"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
