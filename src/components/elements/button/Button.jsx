import "./button.css"

export default function Button({left, top, color, onButtonClick}) {
        
    return <button 
                style={{
                    position: 'absolute',
                    left: left,
                    top: top,
                    backgroundColor: color
                }} 
                className="button"
                onClick={onButtonClick}
            ></button>
} 

