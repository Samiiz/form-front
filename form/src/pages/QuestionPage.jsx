import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const QuestionPage = () => {
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

  useEffect(() => {
    if (!userId) {
      alert("회원가입 정보가 없습니다. 메인 페이지로 이동합니다.");
      navigate("/");
      return;
    }

    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      navigate("/");
      return;
    }

    const fetchQuestionData = async () => {
      try {
        const [questionResponse, choiceResponse, totalResponse] = await Promise.all([
          fetch(`${apiUrl}/question/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${apiUrl}/choice/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${apiUrl}/questions/count`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
        ]);

        if (!questionResponse.ok || !choiceResponse.ok || !totalResponse.ok) {
          throw new Error(`API 요청 실패`);
        }

        const questionData = await questionResponse.json();
        const choiceData = await choiceResponse.json();
        const totalData = await totalResponse.json();

        setTotalQuestions(totalData.total);
        setQuestion({
          title: questionData.question.title,
          image: questionData.question.image.url,
        });
        setChoices(
          (choiceData.choices || [])
            .filter((choice) => choice.is_active)
            .sort((a, b) => b.sqe - a.sqe)
        );
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
        alert("질문 데이터를 가져오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [apiUrl, id, navigate, userId]);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  const handleNext = () => {
    if (!selectedChoice) {
      alert("선택지를 선택해주세요.");
      return;
    }

    const updatedAnswers = [...answers, { userId, choiceId: selectedChoice.id }];
    sessionStorage.setItem("answers", JSON.stringify(updatedAnswers));
    setAnswers(updatedAnswers);
    navigate(`/question/${parseInt(id) + 1}`);
  };

  const handleSubmit = async () => {
    if (!selectedChoice) {
      alert("선택지를 선택해주세요.");
      return;
    }

    const finalAnswers = [...answers, { userId, choiceId: selectedChoice.id }];

    try {
      const response = await fetch(`${apiUrl}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(finalAnswers),
      });

      if (!response.ok) {
        throw new Error(`제출 실패: ${response.status}`);
      }

      alert("제출이 완료되었습니다!");
      sessionStorage.removeItem("answers");
      navigate("/thank-you");
    } catch (error) {
      console.error("제출 중 오류 발생:", error);
      alert("제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isLastQuestion = parseInt(id) === totalQuestions;
  const progress = (parseInt(id) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="mx-auto max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-white px-6 py-4">
            <CardTitle className="text-center text-xl font-bold text-gray-800">
              Question {id} of {totalQuestions}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">{question?.title}</h2>
            
            {question?.image && (
              <div className="mb-6 overflow-hidden rounded-lg">
                <img 
                  src={question.image} 
                  alt="질문 이미지" 
                  className="w-full object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
            )}

            <div className="space-y-4">
              {choices.map((choice) => (
                <div
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:bg-blue-50
                    ${
                      selectedChoice?.id === choice.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                >
                  <p className="text-lg text-gray-700">{choice.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              {!isLastQuestion ? (
                <Button
                  onClick={handleNext}
                  className="w-full max-w-xs bg-blue-500 py-6 text-lg font-semibold hover:bg-blue-600"
                >
                  다음 질문
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="w-full max-w-xs bg-green-500 py-6 text-lg font-semibold hover:bg-green-600"
                >
                  제출하기
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionPage;