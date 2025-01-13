import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";

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
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">로딩 중...</span>
        </div>
      </div>
    );
  }

  const isLastQuestion = parseInt(id) === totalQuestions;

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="card-title text-center mb-4">{question?.title}</h2>
                {question?.image && (
                  <div className="text-center mb-4">
                    <img
                      src={question.image}
                      alt="질문 이미지"
                      className="img-fluid rounded"
                      style={{ maxHeight: "300px", objectFit: "contain" }}
                    />
                  </div>
                )}
                <div className="choices-container">
                  {choices.map((choice) => (
                    <div
                      key={choice.id}
                      onClick={() => handleChoiceSelect(choice)}
                      className={`choice-item p-3 mb-3 rounded cursor-pointer ${
                        selectedChoice?.id === choice.id
                          ? "border border-primary bg-light"
                          : "border"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div
                            className={`rounded-circle border ${
                              selectedChoice?.id === choice.id
                                ? "border-primary"
                                : "border-secondary"
                            }`}
                            style={{
                              width: "20px",
                              height: "20px",
                              backgroundColor:
                                selectedChoice?.id === choice.id
                                  ? "#0d6efd"
                                  : "transparent",
                            }}
                          ></div>
                        </div>
                        <div>{choice.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  {!isLastQuestion ? (
                    <button
                      onClick={handleNext}
                      className="btn btn-primary px-4 py-2"
                      disabled={!selectedChoice}
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="btn btn-success px-4 py-2"
                      disabled={!selectedChoice}
                    >
                      제출하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionPage;