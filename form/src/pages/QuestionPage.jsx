import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용

function QuestionPage() {
  const { id } = useParams(); // 현재 질문 ID 가져오기
  const navigate = useNavigate();
  const { apiUrl } = useApi(); // apiUrl 가져오기

  const [question, setQuestion] = useState(null); // 질문 데이터 저장
  const [choices, setChoices] = useState([]); // 선택지 데이터 저장
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 데이터 가져오기
  useEffect(() => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      navigate("/"); // 메인 페이지로 리다이렉트
      return;
    }

    const fetchQuestionData = async () => {
      try {
        const response = await fetch(`${apiUrl}/questions/1`);
        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }
        const data = await response.json();

        // question과 choices 데이터를 저장
        setQuestion({
          title: data.title,
          image: data.image.url,
        });
        setChoices(
          data.choices
            .filter((choice) => choice.is_active) // 활성화된 선택지만
            .sort((a, b) => b.sqe - a.sqe) // sqe 기준 내림차순 정렬
        );
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
        alert("질문 데이터를 가져오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchQuestionData();
  }, [apiUrl, id, navigate]);

  // 다음 질문 이동
  const handleNext = () => {
    navigate(`/question/${parseInt(id) + 1}`);
  };

  // 제출 처리
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

  // 로딩 중 화면
  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="container">
      <h2>{question?.title}</h2>
      {question?.image && <img src={question.image} alt="질문 이미지" className="question-image" />}
      <div className="choices-container">
        {choices.map((choice) => (
          <div key={choice.id} className="choice-block" onClick={() => alert(`선택: ${choice.content}`)}>
            {choice.content}
          </div>
        ))}
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
