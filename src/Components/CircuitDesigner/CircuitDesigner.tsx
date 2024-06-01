import {
  BackgroundVariant, Edge, Node, OnConnect, OnEdgesChange, OnEdgesDelete, OnNodesChange, Panel, ReactFlowInstance,
} from "reactflow";
import './index.css'
import {useCallback, useRef, useState} from 'react';
import {Background, Controls, MiniMap, ReactFlow} from 'reactflow';
import 'reactflow/dist/style.css';
import useDataStore from "../../store/useDataStore.ts";
import {NodeTypes} from "../../type/NodeTypes.ts";
import addNode from "../../utils/addNode.ts";
import Save from "../Save/Save.tsx";


const selector = (state: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onEdgesDelete: OnEdgesDelete
  onConnect: OnConnect;
}) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onEdgesDelete: state.onEdgesDelete,
  onConnect: state.onConnect,
});

const CircuitDiagram = () => {
  const reactFlowWrapper = useRef(null);
  const {nodes, edges, onNodesChange, onEdgesChange, onEdgesDelete, onConnect} = useDataStore(selector);
  
  const diagramRef = useRef<HTMLDivElement>(null);
  
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  const onDragOver = useCallback((event: {
    preventDefault: () => void;
    dataTransfer: { dropEffect: string; };
  }) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: {
      preventDefault: () => void;
      dataTransfer: { getData: (arg0: string) => string; };
      clientX: number;
      clientY: number;
    }) => {
      event.preventDefault();
      
      const type = event.dataTransfer.getData('application/reactflow');
      
      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }
      
      const position = rfInstance!.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(type, position);
    },
    [rfInstance],
  );
  
  return (
    <div style={{height: '100vh', width: '88vw'}} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NodeTypes}
        // edgeTypes={edgeTypes}
        proOptions={{hideAttribution: true}}
        fitView={true}
        fitViewOptions={{duration: 500}}
        ref={diagramRef}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgesDelete={onEdgesDelete}
      >
        <Panel position="top-left">
          <Save rfInstance={rfInstance as ReactFlowInstance}/>
        </Panel>
        <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
        <Controls/>
        <MiniMap/>
      </ReactFlow>
    </div>
  );
};

export default CircuitDiagram;