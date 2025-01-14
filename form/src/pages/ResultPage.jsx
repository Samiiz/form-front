import React, { useEffect, useState } from "react";
import { useApi } from "../ApiContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Plot from "react-plotly.js";

function ResultPage() {
  const { apiUrl } = useApi();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다! 메인 페이지에서 API URL을 입력하세요.");
      return;
    }

    const fetchChartData = async () => {
      try {
        const endpoints = [
          `${apiUrl}/stats/answer_rate_by_choice`,
          `${apiUrl}/stats/answer_count_by_question`,
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(endpoint, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            })
          )
        );

        const data = await Promise.all(
          responses.map((res) => res.json())
        );

        setChartData(data);
      } catch (error) {
        console.error("차트 데이터 가져오기 실패:", error);
        alert("차트 데이터를 가져오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light py-5" style={{ minHeight: "100vh" }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 fw-bold">통계 차트</h2>

              {chartData.length > 0 ? (
                chartData.map((data, index) => (
                  <div key={index} className="text-center mb-4">
                    <h5>{`차트 ${index + 1}`}</h5>
                    <Plot
                      data={[
                        {
                          x: data.map(item => item.choice_id),
                          y: data.map(item => item.answer_count),
                          type: 'bar',
                          name: '선택 횟수',
                        },
                        {
                          x: data.map(item => item.choice_id),
                          y: data.map(item => item.percentage),
                          type: 'line',
                          name: '비율 (%)',
                        },
                      ]}
                      layout={{ title: '선택지별 통계' }}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center">차트 데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
