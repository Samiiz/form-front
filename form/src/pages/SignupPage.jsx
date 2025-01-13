import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용

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
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
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
        sessionStorage.setItem("userId", result.user.id); // userId 저장
        alert(result.massage);
        navigate("/question/1"); // 첫 번째 질문으로 이동
      } else {
        alert(`회원가입 실패: ${result.error}`);
      }
    } catch (error) {
      console.error("요청 실패:", error);
      alert("요청 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="container">
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            이름:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>
        <div>
          <label>
            이메일:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>
        <div>
          <label>
            성별:
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
          </label>
        </div>
        <div>
          <label>
            나이:
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            >
              <option value="teen">10대</option>
              <option value="twenty">20대</option>
              <option value="thirty">30대</option>
              <option value="fourty">40대</option>
              <option value="fifty">50대 이상</option>
            </select>
          </label>
        </div>
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default SignupPage;
