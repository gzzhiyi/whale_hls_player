import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Player from './pages/index'

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Player />} />
    </Routes>
  </HashRouter>
);

export default App;
