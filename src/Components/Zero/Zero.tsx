import {Handle, Position} from "reactflow";

const Zero = () => {
  
  return (
    <>
      <div style={{padding: 2}}>
        <h2>0</h2>
        <Handle type='source' id="0" position={Position.Right}/>
      </div>
    </>
  );
}

export default Zero;