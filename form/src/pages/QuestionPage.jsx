import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";

function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiUrl } = useApi();
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null); // 선택한 데이터
  const [answers, setAnswers] = useState(() => JSON.parse(sessionStorage.getItem("answers")) || []); // 세션에서 초기화
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0); // 전체 질문 개수

  const userId = sessionStorage.getItem("userId"); // 세션에서 userId 가져오기

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
        // 총 질문 개수와 현재 질문을 API로 가져오기
        const [questionResponse, totalResponse] = await Promise.all([
          fetch(`${apiUrl}/questions/${id}`, {
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

        if (!questionResponse.ok || !totalResponse.ok) {
          throw new Error(`API 요청 실패: ${questionResponse.status}`);
        }

        const questionData = await questionResponse.json();
        const totalData = await totalResponse.json();

        setTotalQuestions(totalData.total); // 전체 질문 개수 저장

        setQuestion({
          title: questionData.title,
          image: questionData.image,
        });
        setChoices(
          questionData.choices
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
    setSelectedChoice(choice); // 선택한 데이터를 상태로 설정
  };

  const handleNext = () => {
    if (!selectedChoice) {
      alert("선택지를 선택해주세요.");
      return;
    }

    // 선택한 데이터를 세션에 저장
    const updatedAnswers = [
      ...answers,
      { userId, choiceId: selectedChoice.id },
    ];
    sessionStorage.setItem("answers", JSON.stringify(updatedAnswers));
    setAnswers(updatedAnswers);

    // 다음 질문으로 이동
    navigate(`/question/${parseInt(id) + 1}`);
  };

  const handleSubmit = async () => {
    if (!selectedChoice) {
      alert("선택지를 선택해주세요.");
      return;
    }

    // 마지막 선택 데이터를 저장
    const finalAnswers = [
      ...answers,
      { userId, choiceId: selectedChoice.id },
    ];

    try {
      const response = await fetch(`${apiUrl}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(finalAnswers),
      });

      if (!response.ok) {
        throw new Error(`제출 실패: ${response.status}`);
      }

      alert("제출이 완료되었습니다!");
      sessionStorage.removeItem("answers"); // 세션 데이터 초기화
      navigate("/thank-you"); // 완료 페이지로 이동
    } catch (error) {
      console.error("제출 중 오류 발생:", error);
      alert("제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  const isLastQuestion = parseInt(id) === totalQuestions; // 현재 질문이 마지막 질문인지 확인

  return (
    <div className="container">
      <h2>{question?.title}</h2>
      {question?.image && <img src={question.image} alt="질문 이미지" />}
      <div className="choices-container">
        {choices.map((choice) => (
          <div
            key={choice.id}
            onClick={() => handleChoiceSelect(choice)}
            style={{
              padding: "10px",
              margin: "5px",
              border: selectedChoice?.id === choice.id ? "2px solid blue" : "1px solid gray",
              cursor: "pointer",
            }}
          >
            {choice.content}
          </div>
        ))}
      </div>
      {/* 다음 또는 제출 버튼 */}
      {!isLastQuestion ? (
        <button onClick={handleNext} style={{ marginTop: "20px" }}>
          다음
        </button>
      ) : (
        <button onClick={handleSubmit} style={{ marginTop: "20px" }}>
          제출하기
        </button>
      )}
    </div>
  );
}

export default QuestionPage;
