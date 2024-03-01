import Line from '../line/Line.tsx';
import Button from '../button/Button.tsx'
import Counter from '../counter/Counter.tsx';
import {useState, useEffect} from 'react';

// import Outputscreen from '../outputscreen/outputscreen.tsx';
import Clock from '../clock/clock.tsx';

import '../outputscreen/outputscreen.css'
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../../store/useDataStore.ts";

export default function TestCounter() {
  const [buttonenval, setButtonenval] = useState('green')
  const [buttonCval, setButtonCval] = useState('green')
  const [buttonclrval, setButtonclrval] = useState('green')
  const [outval, setoutval] = useState(0)
  const [ovfval, setovfval] = useState('green')
  const [selectedVal, setSelectedVal] = useState(6)
  const [isRun, setIsRun] = useState(false)
  const [bitSelectVal, bitSetSelectVal] = useState(false)
  
  
  const updateData = useDataStore((state) => state.updateData);
  const nodeId = useNodeId() as string;
  
  useEffect(() => {
    updateData(nodeId, '111', outval)
  }, [nodeId, outval, updateData]);
  
  // eslint-disable-next-line
  // @ts-ignore
  function handleButtonClick(btval, setbtval) {
    if (btval == 'green') {
      setbtval('red')
    } else {
      setbtval('green')
    }
  }
  
  function clockStep() {
    const maxVar = Math.pow(2, selectedVal) - 1;
    if (buttonCval == 'green') {
      let tmp = outval;
      if (buttonenval == 'red') {
        tmp = outval + 1
        setoutval(tmp)
      }
      
      
      setButtonCval('red')
      
      
      if (maxVar != tmp) {
        setovfval('green')
      } else {
        setovfval('red')
      }
      
      if (tmp > maxVar) {
        setoutval(0)
      }
      
      if (buttonclrval == 'red') {
        setoutval(0)
        setovfval('green')
      }
      
      
    } else {
      setButtonCval('green')
    }
    
  }
  
  useEffect(() => {
    if (isRun) {
      setTimeout(() => {
        clockStep()
      }, 1000)
    }
  })
  
  function handleCClick() {
    if (!isRun) {
      setIsRun(true)
    } else {
      setIsRun(false)
    }
  }
  
  
  const setSelect = () => {
    bitSetSelectVal(!bitSelectVal)
  }
  return (
    <div>
      <h2>
        Counter
      </h2>
      <Line
        left="50px"
        width={"100px"}
        top={"100px"}
        color={buttonenval}></Line>
      <Line
        left="50px"
        width={"100px"}
        top={"140px"}
        color={buttonCval}></Line>
      <Line
        left="50px"
        width={"100px"}
        top={"180px"}
        color={buttonclrval}></Line>
      
      <Line
        left="200px"
        width={"100px"}
        top={"100px"}
        color={'blue'}></Line>
      
      <Line
        left="200px"
        width={"100px"}
        top={"140px"}
        color={ovfval}></Line>
      <Button
        left="0px"
        top={"80px"}
        color={buttonenval}
        onButtonClick={() => handleButtonClick(buttonenval, setButtonenval)}></Button>
      <Clock
        left="0px"
        top={"125px"}
        bgColor={isRun ? buttonCval : 'white'}
        onButtonClick={handleCClick}></Clock>
      <Button
        left="0px"
        top={"170px"}
        color={buttonclrval}
        onButtonClick={() => handleButtonClick(buttonclrval, setButtonclrval)}></Button>
      {/*<Outputscreen*/}
      {/*  left={'300px'}*/}
      {/*  top={'80px'}*/}
      {/*  text={outval}></Outputscreen>*/}
      <div className='outputscreen' style={{
        position: 'absolute',
        left: '300px',
        top: '80px',
      }}>
        {outval}
      </div>
      <div className='outputscreen' style={{
        position: 'absolute',
        left: '300px',
        top: '120px',
      }}>
        {ovfval == 'green' ? 0 : 1}
      </div>
      {/*<Outputscreen*/}
      {/*  left={'300px'}*/}
      {/*  top={'120px'}*/}
      {/*  text={ovfval == 'green' ? 0 : 1}></Outputscreen>*/}
      <Counter left="150px" top={'90px'} setSelect={setSelect}></Counter>
      
      {/*{bitSelectVal ? (): ''}*/}
      <NodeToolbar>
        <select
          id="dropdown"
          value={selectedVal}
          // eslint-disable-next-line
          // @ts-ignore
          onChange={e => setSelectedVal(e.target.value)}
          style={
            {
              top: '90px',
              left: '170px',
              position: 'absolute'
            }}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>
      </NodeToolbar>
      <Handle type='source' id="111" position={Position.Right}/>
    </div>
  );
}