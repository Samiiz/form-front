import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";
import "bootstrap/dist/css/bootstrap.min.css"; // 부트스트랩 CSS 추가
import "./QuestionPage.css"; // 추가적인 커스텀 스타일

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
          fetch(`${apiUrl}/question/${id}`, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }),
          fetch(`${apiUrl}/choice/${id}`, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }),
          fetch(`${apiUrl}/questions/count`, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }),
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
          image: questionData.question.image,
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
    return <div className="loading">로딩 중...</div>;
  }

  const isLastQuestion = parseInt(id) === totalQuestions;

  return (
    <div className="container question-page mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="text-center mb-4">{question?.title}</h2>
              {question?.image && (
                <div className="text-center mb-4">
                  <img
                    className="img-fluid rounded"
                    src={question.image}
                    alt="질문 이미지"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              )}
              <div className="choices-container mb-4">
                {choices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`choice-item mb-2 p-3 rounded ${
                      selectedChoice?.id === choice.id ? "bg-primary text-white" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleChoiceSelect(choice)}
                  >
                    {choice.content}
                  </div>
                ))}
              </div>
              {!isLastQuestion ? (
                <button className="btn btn-primary w-100" onClick={handleNext}>
                  다음
                </button>
              ) : (
                <button className="btn btn-success w-100" onClick={handleSubmit}>
                  제출하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionPage;
