import './counter.css'

export default function Counter({left, top,setSelect}) {



    const position = {
        position: 'absolute',
        left: left,
        top: top
    }
    return <div className='counter' style={position} onClick={setSelect}>en&nbsp;&nbsp;out C&nbsp;&nbsp;&nbsp;&nbsp;ovf clr &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br></br></div>
}