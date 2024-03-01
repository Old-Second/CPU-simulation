import "./line.css"


export default function Line({left, top, width, color}) {
  return (<div style={{
    position: 'absolute',
    left: left,
    top: top,
    width: width,
    borderColor: color
  }} className="line"></div>)
}