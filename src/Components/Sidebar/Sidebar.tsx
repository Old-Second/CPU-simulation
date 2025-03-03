import {Layout} from "antd";
import {NodeTypes} from "../../type/NodeTypes.ts";
import React from "react";

const {Sider} = Layout;

const nodeTypesArray = Object.keys(NodeTypes) as (keyof typeof NodeTypes)[];

const Sidebar = () => {

  return (
    <Sider theme="light" width={'150px'} style={{height: '100vh', overflowY: "scroll"}}>
      {nodeTypesArray.map((item) => {
        return (<div key={item}><DraggableItem key={item} type={item}/></div>)
      })}
    </Sider>
  )
};

export default Sidebar;

const DraggableItem = React.memo(({type}: { type: keyof typeof NodeTypes }) => {
  const Component = NodeTypes[type] as React.ComponentType<{ preview?: boolean }>;

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      onDragStart={(event) => onDragStart(event, `${type}`)}
      draggable
      style={{
        cursor: 'grab',
        // width: '100%',
        padding: '8px',
        margin: '8px',
        border: '2px solid #d9d9d9',
        borderRadius: '4px',

      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}>
        <Component preview={true}/>
        {type}
      </div>
    </div>
  )
})