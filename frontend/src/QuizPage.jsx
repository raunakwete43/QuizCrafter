import React, { useState } from 'react';

const QuizPage = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (answer, correct) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return; // prevent re-selection

    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer,
    });

    if (correct) setScore(score + 1);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!submitted ? (
        <>
          <div className="bg-white p-6 rounded shadow-md w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>

            <div className="grid gap-4">
              {currentQuestion.answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerClick(answer.text, answer.correct)}
                  className={`px-4 py-2 rounded border ${selectedAnswers[currentQuestionIndex] === answer.text
                    ? answer.correct
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-200'
                    }`}
                  disabled={selectedAnswers[currentQuestionIndex] !== undefined} // disable if already answered
                >
                  {answer.text}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={goToPreviousQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                disabled={currentQuestionIndex === 0}
              >
                Back
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-lg">Your final score is: {score} / {questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default QuizPage;

