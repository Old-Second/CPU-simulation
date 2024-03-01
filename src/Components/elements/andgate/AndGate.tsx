import './andgate.css'

export default function AndGate({left, top}) {
    const position = {
        position: 'absolute',
        left: left,
        top: top
    }
    return (
        <div className='andgate' style={position}>&</div>
    )
}
