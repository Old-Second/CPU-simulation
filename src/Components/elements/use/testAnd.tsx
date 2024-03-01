import AndGate from '../andgate/AndGate.tsx';
import Line from '../line/Line.tsx';
import Button from '../button/Button.tsx'
import {useState} from 'react';

export default function TestAnd() {
  const [button1val, setButton1val] = useState('green')
  const [button2val, setButton2val] = useState('green')
  
  function handleButtonClick(btval, setbtval) {
    if (btval == 'green') {
      setbtval('red')
    } else {
      setbtval('green')
    }
  }
  
  function andGateFunction(a, b) {
    if (a == 'red' && b == 'red') {
      return 'red'
    } else {
      return 'green'
    }
  }
  
  return (
    <div>
      <AndGate left={"300px"} top={"300px"}></AndGate>
      <Line
        left={"200px"}
        width={"100px"}
        top={"310px"}
        color={button1val}></Line>
      <Line
        left={"200px"}
        width={"100px"}
        top={"350px"}
        color={button2val}></Line>
      <Line
        left={"365px"}
        width={"100px"}
        top={"330px"}
        color={andGateFunction(button1val, button2val)}></Line>
      <Button
        left={"150px"}
        top={"290px"}
        color={button1val}
        onButtonClick={() => handleButtonClick(button1val, setButton1val)}></Button>
      <Button
        left={"150px"}
        top={"340px"}
        color={button2val}
        onButtonClick={() => handleButtonClick(button2val, setButton2val)}></Button>
    </div>
  )
}