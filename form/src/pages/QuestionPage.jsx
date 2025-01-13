import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";
import { Loader2 } from "lucide-react";

function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiUrl } = useApi();
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [answers, setAnswers] = useState(() => JSON.parse(sessionStorage.getItem("answers")) || []);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const userId = sessionStorage.getItem("userId");

  // ... (keep all the existing useEffect and handler functions the same)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isLastQuestion = parseInt(id) === totalQuestions;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {question?.title}
        </h2>
        
        {question?.image && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img 
              src={question.image} 
              alt="질문 이미지" 
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          {choices.map((choice) => (
            <div
              key={choice.id}
              onClick={() => handleChoiceSelect(choice)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${
                  selectedChoice?.id === choice.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                }
              `}
            >
              <p className="text-lg">{choice.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold
                hover:bg-blue-600 transition-colors duration-200
                disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!selectedChoice}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold
                hover:bg-green-600 transition-colors duration-200
                disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!selectedChoice}
            >
              제출하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPage;