import {
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Panel,
  ReactFlowInstance,
  updateEdge,
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
  onConnect: OnConnect;
  setEdges: (edges: Edge[]) => void;
}) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setEdges: state.setEdges,
});

const CircuitDiagram = () => {
  const reactFlowWrapper = useRef(null);
  const {nodes, edges, onNodesChange, onEdgesChange, onConnect, setEdges} = useDataStore(selector);
  
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
  
  const edgeUpdateSuccessful = useRef(true);
  
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);
  
  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeUpdateSuccessful.current = true;
    setEdges(updateEdge(oldEdge, newConnection, edges));
  }, [edges, setEdges]);
  
  const onEdgeUpdateEnd = useCallback((_: unknown, edge: { id: string; }) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges(edges.filter((e) => e.id !== edge.id));
    }
    
    edgeUpdateSuccessful.current = true;
  }, [edges, setEdges]);
  
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
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
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