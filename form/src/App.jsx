import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ApiProvider } from "./ApiContext"; // ApiContext import
import IndexPage from "./pages/IndexPage";
import SignupPage from "./pages/SignupPage";
import SurveyPage from "./pages/SurveyPage";
import QuestionPage from "./pages/QuestionPage";
import StatsPage from "./pages/ResultPage"; // ResultPage에서 StatsPage로 수정
import './App.css';

function App() {
  return (
    <ApiProvider>
      <Router>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/question/:id" element={<QuestionPage />} />
          <Route path="/result" element={<StatsPage />} /> {/* ResultPage -> StatsPage로 변경 */}
        </Routes>
      </Router>
    </ApiProvider>
  );
}

export default App;
