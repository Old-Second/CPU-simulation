import {Layout} from "antd";
import {NodeTypes} from "../../type/NodeTypes.ts";
import React from "react";

const {Sider} = Layout;

const nodeTypesArray = Object.keys(NodeTypes);

const Sidebar = () => {
  
  return (
    <Sider collapsible theme="light" width={'12vw'}>
      {nodeTypesArray.map((item) => {
        return (<div key={item} style={{height: '30px'}}><DraggableItem key={item} type={item}/></div>)
      })}
    </Sider>
  )
};

export default Sidebar;

const DraggableItem = React.memo(({type}: { type: string }) => {
  
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (<div onDragStart={(event) => onDragStart(event, `${type}`)} draggable>{type}</div>)
})