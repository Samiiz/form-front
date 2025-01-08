import React from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용

function SurveyPage() {
  const navigate = useNavigate();
  const { apiUrl } = useApi(); // apiUrl 가져오기

  const handleStart = () => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      navigate("/"); // 메인 페이지로 리다이렉트
      return;
    }
    navigate("/signup"); // 회원가입 페이지로 이동
  };

  return (
    <div className="container text-center">
      <header>
        <h1 className="display-4 mb-4">설문조사에 참여해주세요!</h1>
      </header>
      <section>
        <img
          src="https://via.placeholder.com/600x300"
          alt="Survey Main"
          className="img-fluid mb-4"
        />
        <button className="btn btn-primary btn-lg" onClick={handleStart}>
          회원가입 시작하기
        </button>
      </section>
    </div>
  );
}

export default SurveyPage;
