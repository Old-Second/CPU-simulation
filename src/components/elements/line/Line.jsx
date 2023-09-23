import "./line.css"


export default function Line({left, top, width, height, color}) { 
    return (<div style={{
        position: 'absolute',
        left: left,
        top: top,
        width: width,
        height: height,
        borderColor: color
    }} className="line"></div>)
} 

