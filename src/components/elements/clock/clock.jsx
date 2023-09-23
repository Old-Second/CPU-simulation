import './clock.css'

export default function Clock({left, top, bgColor, onButtonClick}) {
    return <button 
                className="clock"
                style={{
                    position: 'absolute',
                    left: left,
                    top: top,
                    backgroundColor: bgColor
                }} 
                onClick={onButtonClick}>clock</button>
}