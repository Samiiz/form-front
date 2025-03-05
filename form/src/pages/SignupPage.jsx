import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS import

function SignupPage() {
  const { apiUrl } = useApi(); // API URL 가져오기
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    age: "teen",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    } else if (formData.name.length > 10) {
      newErrors.name = "이름은 10자 미만입니다."
    }
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 폼 검증
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!apiUrl) {
      alert("API URL이 설정되지 않았습니다!");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        sessionStorage.setItem("userId", result.user_id); // userId 저장
        alert(result.message);
        navigate("/question/1"); // 첫 번째 질문으로 이동
      } else if (!response.ok){
        alert(`회원가입 실패: ${result.message}`);
      }
    } catch (error) {
      console.error("요청 실패:", error);
      alert("요청 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="container-fluid bg-light py-5" style={{ minHeight: "100vh" }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 fw-bold">회원가입</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">이름</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                  {errors.name && <p className="text-danger">{errors.name}</p>}
                </div>
                <div className="mb-3">
                  <label className="form-label">이메일</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                  {errors.email && <p className="text-danger">{errors.email}</p>}
                </div>
                <div className="mb-3">
                  <label className="form-label">성별</label>
                  <div>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleChange}
                    />
                    남성
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleChange}
                    />
                    여성
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">나이</label>
                  <select
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="teen">10대</option>
                    <option value="twenty">20대</option>
                    <option value="thirty">30대</option>
                    <option value="fourty">40대</option>
                    <option value="fifty">50대 이상</option>
                  </select>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary px-4 py-2">
                    회원가입
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
