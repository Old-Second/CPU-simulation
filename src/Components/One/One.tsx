import {Handle, Position} from "reactflow";

const One = () => {
  
  return (
    <>
      <div style={{padding: 2}}>
        <h2>1</h2>
        <Handle type='source' id="1" position={Position.Right}/>
      </div>
    </>
  );
}

export default One;