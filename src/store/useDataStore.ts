import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

import {initialNodes} from './nodes';
import {DataState} from "../type/Data.ts";
import {createWithEqualityFn} from "zustand/traditional";
import {shallow} from "zustand/shallow";

export interface RFState {
  nodes: Node[];
  edges: Edge[];
  data: DataState;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateData: (sourceId: string, sourcePort: string, newData: number) => void;
}


const useDataStore = createWithEqualityFn<RFState>((set, get) => ({
  // eslint-disable-next-line
  // @ts-ignore
  nodes: initialNodes,
  edges: [],
  data: {},
  // 处理节点变化
  // onNodesChange: (changes: NodeChange[]) => {
  //   // 使用自定义的比较函数来比较节点内容是否发生了变化
  //   const areNodesEqual = (nodeA: Node, nodeB: Node) => {
  //     // 这里可以根据你的节点数据结构定义比较逻辑
  //     return nodeA.id === nodeB.id && nodeA.position.x === nodeB.position.x && nodeA.position.y === nodeB.position.y;
  //   };
  //
  //   // 应用节点变化，并且只在节点内容发生变化时触发状态更新
  //   set((state) => {
  //     const updatedNodes = applyNodeChanges(changes, state.nodes);
  //     if (updatedNodes.some((node, index) => !areNodesEqual(node, state.nodes[index]))) {
  //       return {nodes: updatedNodes};
  //     } else {
  //       return state;
  //     }
  //   })
  // },
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  // 处理边变化
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  // 处理连接事件
  onConnect: (connection: Connection) => {
    const currentState = get();
    // 添加新边
    const newEdges = addEdge({...connection, type: 'step'}, currentState.edges);
    // 创建新数据项的键
    const newEdgeDataKey = `reactflow__edge-${connection.source}-${connection.target}`;
    // 更新数据
    const newData = {
      ...currentState.data,
      [newEdgeDataKey]: {
        sourceId: connection.source ?? '',
        sourcePort: connection.sourceHandle ?? '',
        targetId: connection.target ?? '',
        targetPort: connection.targetHandle ?? '',
        data: get().nodes.find(obj => obj.id === connection.source)?.type === "one" ? 1 : 0,
      },
    };
    // 设置新的边和数据
    set({edges: newEdges, data: newData});
  },
  // 设置节点
  setNodes: (nodes: Node[]) => {
    set({nodes});
  },
  // 设置边
  setEdges: (edges: Edge[]) => {
    set({edges});
  },
  // 更新数据
  updateData: (sourceId: string, sourcePort: string, newData: number) => {
    const currentState = get();
    const currentData = currentState.data;
    // 查找要更新的数据项
    const foundItemKey = Object.keys(currentData).find(
      key => currentData[key].sourceId === sourceId && currentData[key].sourcePort === sourcePort
    );
    // 如果找到匹配的数据项，更新其数据
    if (foundItemKey && currentData[foundItemKey].data !== newData) {
      const newDataState = {
        ...currentState.data,
        [foundItemKey]: {...currentState.data[foundItemKey], data: newData},
      };
      // 设置新的数据状态
      set({data: newDataState});
    }
  },
}), shallow);

export default useDataStore;