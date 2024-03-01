import {BackgroundVariant, Edge, Node, OnConnect, OnEdgesChange, OnNodesChange} from "reactflow";
import './index.css'
import {useRef} from 'react';
import {Background, Controls, MiniMap, ReactFlow} from 'reactflow';
import 'reactflow/dist/style.css';
import useDataStore from "../../store/useDataStore.ts";
import {useDrop} from "react-dnd";
import {NodeTypes} from "../../type/NodeTypes.ts";
import addNode from "../../utils/addNode.ts";


const selector = (state: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
}) => ({
  nodes: state.nodes,
  edges: state.edges,
  // data: state.data,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const CircuitDiagram = () => {
  const {nodes, edges, onNodesChange, onEdgesChange, onConnect} = useDataStore(selector);
  
  
  const diagramRef = useRef<HTMLDivElement>(null);
  
  const [, drop] = useDrop(
    () => ({
      accept: 'chip',
      drop: (item: { type: string }, monitor) => {
        const mouseOffset = monitor.getClientOffset();
        if (!mouseOffset) return; // 空值检查
        const diagramOffset = diagramRef.current?.getBoundingClientRect();
        if (!diagramOffset) return; // 空值检查
        // 计算鼠标相对于 CircuitDiagram 组件的位置
        const relativeX = mouseOffset.x - diagramOffset.left;
        const relativeY = mouseOffset.y - diagramOffset.top;
        addNode(item.type, {x: relativeX, y: relativeY})
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
  );
  
  return (
    <div style={{height: '100vh', width: '100vw'}} ref={drop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NodeTypes}
        // edgeTypes={edgeTypes}
        proOptions={{hideAttribution: true}}
        // fitView={true}
        fitViewOptions={{duration: 500}}
        ref={diagramRef}
      >
        {/*<Controls>*/}
        {/*  <ControlButton onClick={() => alert('Something magical just happened. ✨')}>*/}
        {/*    /!*<MagicWand/>*!/*/}
        {/*  </ControlButton>*/}
        {/*</Controls>*/}
        <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
        <Controls/>
        <MiniMap/>
      </ReactFlow>
    </div>
  );
};

export default CircuitDiagram;