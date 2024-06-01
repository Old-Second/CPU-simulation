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

import {DataState, ChipConfigValue, chipData, ChipDataType, ChipType, ChipDataState} from "../type/Data.ts";
import {createWithEqualityFn} from "zustand/traditional";
import {shallow} from "zustand/shallow";
import {produce} from "immer";

export interface RFState {
  nodes: Node[];
  edges: Edge[];
  data: DataState;
  chipData: ChipDataState;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setData: (data: DataState) => void;
  updateData: (sourceId: string, sourcePort: string, newData: number) => void;
  getData: (targetId: string, targetPort: string) => number;
  setChipData: (newData: ChipDataState) => void;
  updateChipData: (chipId: string, chipData: ChipConfigValue) => void;
  getChipData: (chipId: string) => ChipConfigValue;
}


const useDataStore = createWithEqualityFn<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  data: {},
  chipData: chipData,
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
        data: 0,
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
  // 设置数据
  setData: (data: DataState) => {
    set({data});
  },
  // 更新数据
  updateData: (sourceId: string, sourcePort: string, newData: number) => {
    set(produce<RFState>(draft => {
      const itemsToUpdate = Object.values(draft.data).filter((item) =>
        (item.sourceId === sourceId && item.sourcePort === sourcePort)
      );
      
      itemsToUpdate.forEach(item => {
        item.data = newData;
      });
      
      // 检查是否需要添加新项
      if (sourceId === 'TunnelIn' && !Object.values(draft.data).some(item => item.sourcePort === sourcePort)) {
        const newEdgeDataKey = `reactflow__edge-${sourceId}-${sourcePort}`;
        draft.data[newEdgeDataKey] = {
          sourceId: 'TunnelIn',
          sourcePort: sourcePort,
          targetId: 'TunnelOut',
          targetPort: sourcePort,
          data: newData,
        };
      }
    }));
  },
  getData: (targetId: string, targetPort: string) => {
    const data = get().data;
    // 直接查找并返回满足条件的元素数据，或默认值0
    return Object.values(data).find(item => item.targetId === targetId && item.targetPort === targetPort)?.data ?? 0;
  },
  setChipData: (chipData: ChipDataState) => {
    set({chipData});
  },
  updateChipData: (chipId: string, chipData: ChipDataType[ChipType]) => {
    set(produce<RFState>(draft => {
      // 直接更新或添加新的chipData项
      if (!draft.chipData.hasOwnProperty(chipId) || draft.chipData[chipId] !== chipData) {
        draft.chipData[chipId] = chipData;
      }
    }));
  },
  getChipData: (chipId: string) => {
    return get().chipData[chipId];
  },
}), shallow);

export default useDataStore;