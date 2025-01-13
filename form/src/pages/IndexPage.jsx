import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS import

function IndexPage() {
  const { apiUrl, setApiUrl } = useApi(); // Get apiUrl and setApiUrl from context
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! URL을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
      alert("데이터를 가져오는 데 실패했습니다. 서버가 실행 중인지, URL이 올바른지 확인해주세요.");
    }
  };

  const goToSurvey = () => {
    navigate("/survey");
  };

  return (
    <div className="container-fluid bg-light py-5" style={{ minHeight: "100vh" }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4 fw-bold">API 연결</h1>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="API URL 입력"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)} // Update API URL in context
                  className="form-control"
                />
              </div>
              
              <div className="text-center">
                <button onClick={fetchData} className="btn btn-primary px-4 py-2 mb-3">
                  데이터 가져오기
                </button>
                <button onClick={goToSurvey} className="btn btn-secondary px-4 py-2">
                  다음
                </button>
              </div>

              {data && (
                <div className="mt-4">
                  <h5>응답 데이터</h5>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexPage;
