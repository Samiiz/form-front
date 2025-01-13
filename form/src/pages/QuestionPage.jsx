import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";
import "./QuestionPage.css"; // CSS 파일 추가

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
    <div className="question-page">
      <div className="content-container">
        <h2 className="question-title">{question?.title}</h2>
        {question?.image && <img className="question-image" src={question.image} alt="질문 이미지" />}
        <div className="choices-container">
          {choices.map((choice) => (
            <div
              key={choice.id}
              className={`choice-item ${selectedChoice?.id === choice.id ? "selected" : ""}`}
              onClick={() => handleChoiceSelect(choice)}
            >
              {choice.content}
            </div>
          ))}
        </div>
        {!isLastQuestion ? (
          <button className="next-button" onClick={handleNext}>
            다음
          </button>
        ) : (
          <button className="submit-button" onClick={handleSubmit}>
            제출하기
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionPage;
