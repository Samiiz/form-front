import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";

function QuestionPage() {
  const { id } = useParams();  // URL 파라미터에서 id를 가져옴
  const navigate = useNavigate();
  const { apiUrl } = useApi();
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      navigate("/"); 
      return;
    }

    const fetchQuestionData = async () => {
      try {
        const response = await fetch(`${apiUrl}/questions/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }
        const data = await response.json();
        setQuestion({
          title: data.title,
          image: data.image.url,
        });
        setChoices(
          data.choices
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
  }, [apiUrl, id, navigate]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="container">
      <h2>{question?.title}</h2>
      {question?.image && <img src={question.image} alt="질문 이미지" />}
      <div className="choices-container">
        {choices.map((choice) => (
          <div key={choice.id} onClick={() => alert(`선택: ${choice.content}`)}>
            {choice.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionPage;
