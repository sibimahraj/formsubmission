import React from "react";
import Homepage from "./homepage";
import Adduser from "./adduser";
import Table from "./table";
import Read from "./read";
import Updatepage from "./updatePage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/adduser" element={<Adduser />} />
          <Route path="/table" element={<Table />} />
          <Route path="/read/:id" element={<Read />} />
          <Route path="/update/:id" element={<Updatepage />} />
        </Routes>
      </Router>
    </>
  )
}
export default App