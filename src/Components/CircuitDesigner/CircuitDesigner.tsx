import {
  BackgroundVariant, Edge, Node, OnConnect, OnEdgesChange, OnEdgesDelete, OnNodesChange, Panel, ReactFlowInstance,
} from "reactflow";
import './index.css'
import {useCallback, useRef, useState, memo} from 'react';
import {Background, Controls, MiniMap, ReactFlow} from 'reactflow';
import 'reactflow/dist/style.css';
import useDataStore from "../../store/useDataStore.ts";
import {EdgeTypes, NodeTypes} from "../../type/NodeTypes.ts";
import addNode from "../../utils/addNode.ts";
import Save from "../Save/Save.tsx";

// 使用选择器优化性能，只获取需要的状态
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

// 使用memo优化组件，避免不必要的重渲染
const CircuitDiagram = memo(() => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {nodes, edges, onNodesChange, onEdgesChange, onEdgesDelete, onConnect} = useDataStore(selector);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // 处理拖拽悬停事件
  const onDragOver = useCallback((event: {
    preventDefault: () => void;
    dataTransfer: { dropEffect: string; };
  }) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 处理拖拽放置事件
  const onDrop = useCallback(
    (event: {
      preventDefault: () => void;
      dataTransfer: { getData: (arg0: string) => string; };
      clientX: number;
      clientY: number;
    }) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // 检查拖放的元素是否有效
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // 确保rfInstance存在
      if (!rfInstance) {
        console.warn('ReactFlow实例尚未初始化');
        return;
      }

      // 将屏幕坐标转换为流坐标
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      // 添加新节点
      addNode(type, position);
    },
    [rfInstance],
  );

  // 处理ReactFlow初始化
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setRfInstance(instance);
  }, []);

  return (
    <div style={{height: '100vh', width: '88vw'}} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NodeTypes}
        edgeTypes={EdgeTypes}
        proOptions={{hideAttribution: true}}
        fitView={true}
        fitViewOptions={{duration: 500}}
        ref={diagramRef}
        onInit={onInit}
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
});

export default CircuitDiagram;