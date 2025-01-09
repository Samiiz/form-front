import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용

function QuestionPage() {
  const { id } = useParams(); // 현재 질문 ID 가져오기
  const navigate = useNavigate();
  const { apiUrl } = useApi(); // apiUrl 가져오기

  const handleNext = () => {
    navigate(`/question/${parseInt(id) + 1}`); // 다음 질문으로 이동
  };

  const handleSubmit = async () => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      navigate("/"); // 메인 페이지로 리다이렉트
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: 1, answers: [] }), // 예시 데이터
      });

      if (response.ok) {
        alert("답변이 제출되었습니다.");
        navigate("/"); // 메인 페이지로 이동
      } else {
        const errorData = await response.json();
        alert(`오류 발생: ${errorData.error}`);
      }
    } catch (error) {
      console.error("제출 실패:", error);
      alert("제출 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="container">
      <h2>질문 {id}</h2>
      <div className="choice-block" onClick={() => alert("선택!")}>
        선택 1
      </div>
      <div className="choice-block" onClick={() => alert("선택!")}>
        선택 2
      </div>
      {parseInt(id) < 4 ? (
        <button className="btn btn-primary" onClick={handleNext}>
          다음
        </button>
      ) : (
        <button className="btn btn-success" onClick={handleSubmit}>
          제출하기
        </button>
      )}
    </div>
  );
}

export default QuestionPage;
