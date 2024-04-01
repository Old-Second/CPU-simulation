import {useEffect, useState} from 'react'
import './App.css'
import DigitalTube from "./components/DigitalTube/index.jsx";
import TestCounter from "./components/elements/test/testCounter.jsx";
import Rom from "./components/rom/Rom.jsx";

function App() {
  const [number, setNumber] = useState(8)
  const changeCounter = (num) => {
    setNumber(num)
  }

  const [rom, setRom] = useState(0)

  useEffect(() => {
    setRom(0)
  }, [])
  const changeRom = (num) => {
    setRom(num)
    console.log('outt', num)
  }

  return (
      <>
        <div className={'count'}><TestCounter changeCounter={changeCounter}></TestCounter></div>
        <div className="conductor1"></div>
        <Rom A={number} sel={1} changeRom={changeRom}></Rom>
        <div className="conductor2"></div>
        <div className="DigitalTube1"><DigitalTube value={Math.floor(((rom % 100) / 10) > 0 ? ((rom % 100) / 10) : 0)}/>
        </div>
        <div className="DigitalTube2"><DigitalTube value={rom % 10 > 0 ? rom % 10 : 0}/></div>

        {/*<input type="number" onChange={(e) => {*/}
        {/*    setNumber(e.target.value)*/}
        {/*}}/>*/}
      </>
  )
}

export default App