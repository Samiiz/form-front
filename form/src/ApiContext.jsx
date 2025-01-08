import React, { createContext, useState, useContext } from "react";

// Context 생성
const ApiContext = createContext();

// Context Provider 컴포넌트
export const ApiProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState("");

  return (
    <ApiContext.Provider value={{ apiUrl, setApiUrl }}>
      {children}
    </ApiContext.Provider>
  );
};

// Context를 쉽게 사용하기 위한 커스텀 훅
export const useApi = () => useContext(ApiContext);
