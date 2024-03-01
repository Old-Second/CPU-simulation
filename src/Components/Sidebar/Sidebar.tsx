import {Layout} from "antd";
import {useDrag} from "react-dnd";
import {NodeTypes} from "../../type/NodeTypes.ts";
import React from "react";

const {Sider} = Layout;

const nodeTypesArray = Object.keys(NodeTypes);

const Sidebar = () => {
  
  return (
    <Sider collapsible theme="light">
      {nodeTypesArray.map((item) => <DraggableItem key={item} type={item}/>)}
    </Sider>
  )
};

export default Sidebar;

const DraggableItem = React.memo(({type}: { type: string }) => {
  
  const [, drag] = useDrag(() => ({
    type: 'chip',
    item: {type},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  return (<div ref={drag}>{type}</div>)
})