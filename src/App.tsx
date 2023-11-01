import React from 'react';
import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";
import RefereeBoard from "./pages/RefereeBoard";
import Teams from "./pages/Teams";
import GroupStage from "./pages/GroupStage";


function App() {
    return (
        <div className="relative">
            <NavBar/>
            <Routes>
                <Route path={"/"} element={<HomePage/>} />
                <Route path={"/score-board"} element={<RefereeBoard/>}/>
                <Route path={"/teams"} element={<Teams/>}/>
                <Route path={"/group-stage"} element={<GroupStage/>}/>
            </Routes>
        </div>
    );
}

export default App;
