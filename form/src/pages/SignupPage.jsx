import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext"; // Context 사용

function SignupPage() {
  const { apiUrl } = useApi(); // apiUrl 가져오기
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    age: "teen",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(result.message);
        navigate("/question/1");
      } else {
        alert("오류 발생: " + result.error);
      }
    } catch (error) {
      console.error("요청 실패:", error);
      alert("요청 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="container">
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit}>
        <label>
          이름:
          <input type="text" name="name" onChange={handleChange} required />
        </label>
        <label>
          이메일:
          <input type="email" name="email" onChange={handleChange} required />
        </label>
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
        <label>
          나이:
          <select name="age" value={formData.age} onChange={handleChange} required>
            <option value="teen">10대</option>
            <option value="twenty">20대</option>
            <option value="thirty">30대</option>
            <option value="fourty">40대</option>
            <option value="fifty">50대</option>
          </select>
        </label>
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default SignupPage;
