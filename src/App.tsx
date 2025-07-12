import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Overview } from './pages/Overview';
import { Screen1 } from './pages/Screen1';
import { Screen2 } from './pages/Screen2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/screen1" element={<Screen1 />} />
        <Route path="/screen2" element={<Screen2 />} />
      </Routes>
    </Router>
  );
}

export default App;