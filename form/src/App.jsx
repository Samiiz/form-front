import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ApiProvider } from "./ApiContext"; // ApiContext import
import IndexPage from "./pages/IndexPage";
import SignupPage from "./pages/SignupPage";
import SurveyPage from "./pages/SurveyPage";
import QuestionPage from "./pages/QuestionPage";

function App() {
  return (
    <ApiProvider>
      <Router>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/question/:id" element={<QuestionPage />} />
        </Routes>
      </Router>
    </ApiProvider>
  );
}

export default App;
