import Line from '../line/Line.jsx';
import Button from '../button/Button.jsx'
import Counter from '../counter/Counter.jsx';
import {useState, useEffect} from 'react';

import Outputscreen from '../outputscreen/outputscreen.jsx';
import Clock from '../clock/clock.jsx';

export default function TestCounter({changeCounter}) {
    const [buttonenval, setButtonenval] = useState('green')
    const [buttonCval, setButtonCval] = useState('green')
    const [buttonclrval, setButtonclrval] = useState('green')
    const [outval, setoutval] = useState(0)
    const [ovfval, setovfval] = useState('green')
    const [selectedVal, setSelectedVal] = useState(1)
    const [isRun, setIsRun] = useState(false)

    const [bitSelectVal, bitSetSelectVal] = useState(false)

    function handleButtonClick(btval, setbtval) {
        if (btval == 'green') {
            setbtval('red')
        } else {
            setbtval('green')
        }
    }

    useEffect(() => {
        changeCounter(outval)
    }, [changeCounter, outval])


    function clockStep() {
        var maxVar = Math.pow(2, selectedVal) - 1
        if (buttonCval == 'green') {
            var tmp = outval
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
    return <div>
        <Line
            left={"200px"}
            width={"100px"}
            top={"310px"}
            color={buttonenval}></Line>
        <Line
            left={"200px"}
            width={"100px"}
            top={"350px"}
            color={buttonCval}></Line>
        <Line
            left={"200px"}
            width={"100px"}
            top={"390px"}
            color={buttonclrval}></Line>

        <Line
            left={"350px"}
            width={"100px"}
            top={"310px"}
            color={'blue'}></Line>

        <Line
            left={"350px"}
            width={"100px"}
            top={"350px"}
            color={ovfval}></Line>
        <Button
            left={"150px"}
            top={"290px"}
            color={buttonenval}
            onButtonClick={() => handleButtonClick(buttonenval, setButtonenval)}></Button>
        <Clock
            left={"150px"}
            top={"335px"}
            bgColor={isRun ? buttonCval : 'white'}
            onButtonClick={handleCClick}></Clock>
        <Button
            left={"150px"}
            top={"380px"}
            color={buttonclrval}
            onButtonClick={() => handleButtonClick(buttonclrval, setButtonclrval)}></Button>
        <Outputscreen
            left={'450px'}
            top={'290px'}
            text={outval}></Outputscreen>
        <Outputscreen
            left={'450px'}
            top={'330px'}
            text={ovfval == 'green' ? 0 : 1}></Outputscreen>
        <Counter left={'300px'} top={'300px'} setSelect={setSelect}></Counter>

        {bitSelectVal ? (<select
            id="dropdown"
            value={selectedVal}
            onChange={e => setSelectedVal(e.target.value)}
            style={
                {
                    top: '300px',
                    left: '320px',
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
        </select>) : ''}
    </div>
}