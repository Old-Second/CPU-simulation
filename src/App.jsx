import {useState} from 'react'
import './App.css'
import DigitalTube from "./components/DigitalTube/index.jsx";
import TestCounter from "./components/elements/test/testCounter.jsx";
import UseRom from "./components/rom/UseRom.jsx";

function App() {
    const [number, setNumber] = useState(8)
    const changeCounter = (num) => {
        setNumber(num)
    }

    return (
        <>
            <div className={'count'}><TestCounter changeCounter={changeCounter}></TestCounter></div>
            <div className="conductor1"></div>
            <div className={'Rom'}>
                <p1>A</p1>
                <p2>D</p2>
                <b>Rom</b></div>
            <div className="conductor2"></div>
            <div className="DigitalTube1"><DigitalTube value={Math.floor(number / 10)}/></div>
            <div className="DigitalTube2"><DigitalTube value={number % 10}/></div>

            {/*<input type="number" onChange={(e) => {*/}
            {/*    setNumber(e.target.value)*/}
            {/*}}/>*/}
        </>
    )
}

export default App
