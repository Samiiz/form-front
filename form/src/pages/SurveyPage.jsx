import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용

function SurveyPage() {
  const navigate = useNavigate();
  const { apiUrl } = useApi(); // apiUrl 가져오기
  const [image, setImage] = useState(null); // 이미지 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      navigate("/"); // 메인 페이지로 리다이렉트
      return;
    }

    // 이미지 데이터를 가져오는 함수
    const fetchImage = async () => {
      try {
        const response = await fetch(`${apiUrl}/image/main`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`이미지 데이터 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        setImage(data.image); // 이미지 URL 설정
      } catch (error) {
        console.error("이미지 데이터를 가져오는 중 문제가 발생했습니다:", error);
        alert("이미지를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 상태 업데이트
      }
    };

    fetchImage();
  }, [apiUrl, navigate]);

  const handleStart = () => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      navigate("/"); // 메인 페이지로 리다이렉트
      return;
    }
    navigate("/signup"); // 회원가입 페이지로 이동
  };

  if (loading) {
    return <div className="text-center">로딩 중...</div>; // 로딩 화면
  }

  return (
    <div className="container text-center">
      <header>
        <h1 className="display-4 mb-4">설문조사에 참여해주세요!</h1>
      </header>
      <section>
        {image ? (
          <img src={image} alt="Survey Main" className="img-fluid mb-4" />
        ) : (
          <p>이미지를 로드할 수 없습니다.</p> // 이미지 로드 실패 시 메시지
        )}
        <button className="btn btn-primary btn-lg" onClick={handleStart}>
          회원가입 시작하기
        </button>
      </section>
    </div>
  );
}

export default SurveyPage;
