import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용

function IndexPage() {
  const { apiUrl, setApiUrl } = useApi(); // apiUrl 가져오기
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!apiUrl) {
      alert("Please enter your API URL!");
      return;
    }

    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Ensure your server is running and the URL is correct.");
    }
  };

  const goToSurvey = () => {
    navigate("/survey");
  };

  return (
    <div className="container text-center">
      <h1>API 연결</h1>
      <input
        type="text"
        placeholder="API URL 입력"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)} // Context의 setApiUrl 사용
        className="form-control my-3"
      />
      <button onClick={fetchData} className="btn btn-primary mb-3">Fetch Data</button>
      <button onClick={goToSurvey} className="btn btn-secondary">다음</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default IndexPage;
