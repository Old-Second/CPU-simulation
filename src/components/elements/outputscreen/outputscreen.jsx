import './outputscreen.css'

export default function Outputscreen({left, top, text}) {
    return <div className='outputscreen' style={{
        position: 'absolute',
        left: left,
        top: top,
    }} >{text}</div>
}