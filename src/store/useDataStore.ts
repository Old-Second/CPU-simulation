import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnEdgesDelete,
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
  onEdgesDelete: OnEdgesDelete;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setData: (data: DataState) => void;
  updateData: (sourceId: string, sourcePort: string, newData: number) => void;
  deleteData: (chipId: string) => void;
  deleteEdgeData: (edgeId: string) => void;
  getData: (targetId: string, targetPort: string) => number;
  setChipData: (newData: ChipDataState) => void;
  updateChipData: (chipId: string, chipData: ChipConfigValue) => void;
  deleteChipData: (chipId: string) => void;
  getChipData: (chipId: string) => ChipConfigValue;
}

// 创建数据存储
const useDataStore = createWithEqualityFn<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  data: {},
  chipData: chipData,
  
  // 处理节点变化
  onNodesChange: (changes: NodeChange[]) => {
    // 检查是否有节点被删除
    const hasRemovedNodes = changes.some(node => node.type === 'remove');
    
    if (hasRemovedNodes) {
      // 收集所有被删除的节点ID
      const removedNodeIds = changes
        .filter(node => node.type === "remove")
        .map(node => node.id);
      
      // 批量删除相关数据
      removedNodeIds.forEach(nodeId => {
        get().deleteChipData(nodeId);
        get().deleteData(nodeId);
      });
    }
    
    // 应用节点变化
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
  
  // 处理边删除
  onEdgesDelete: (edges: Edge[]) => {
    // 批量删除边数据
    edges.forEach(edge => {
      get().deleteEdgeData(edge.id);
    });
  },
  
  // 处理连接事件
  onConnect: (connection: Connection) => {
    const currentState = get();
    
    // 添加新边
    const newEdges = addEdge({...connection, type: 'custom-path-edge'}, currentState.edges);
    // 创建新数据项的键
    // const newEdgeDataKey = `reactflow__edge-${connection.source}${connection.sourceHandle}-${connection.target}${connection.targetHandle}`;
    const newEdge = newEdges[newEdges.length - 1];
    // 更新数据
    const newData = {
      ...currentState.data,
      [newEdge.id]: {
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
      // 查找并更新所有匹配的数据项
      const itemsToUpdate = Object.values(draft.data).filter((item) =>
        (item.sourceId === sourceId && item.sourcePort === sourcePort)
      );

      itemsToUpdate.forEach(item => {
        item.data = newData;
      });

      // 检查是否需要添加新项（针对TunnelIn特殊情况）
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
  
  // 删除数据
  deleteData: (chipId: string) => {
    set(produce<RFState>(draft => {
      // 查找并删除匹配的项
      const keysToDelete = Object.keys(draft.data).filter(key => {
        const item = draft.data[key];
        return item.sourceId === chipId || item.targetId === chipId;
      });

      keysToDelete.forEach(key => {
        delete draft.data[key];
      });
    }));
  },
  
  // 删除边数据
  deleteEdgeData: (edgeId: string) => {
    set(produce<RFState>(draft => {
      if (edgeId in draft.data) {
        delete draft.data[edgeId];
      }
    }));
  },
  
  // 获取数据
  getData: (targetId: string, targetPort: string) => {
    const data = get().data;
    // 直接查找并返回满足条件的元素数据，或默认值0
    return Object.values(data).find(item => item.targetId === targetId && item.targetPort === targetPort)?.data ?? 0;
  },
  
  // 设置芯片数据
  setChipData: (chipData: ChipDataState) => {
    set({chipData});
  },
  
  // 更新芯片数据
  updateChipData: (chipId: string, chipData: ChipDataType[ChipType]) => {
    set(produce<RFState>(draft => {
      // 直接更新或添加新的chipData项
      if (!Object.hasOwn(draft.chipData, chipId) || draft.chipData[chipId] !== chipData) {
        draft.chipData[chipId] = chipData;
      }
    }));
  },
  
  // 删除芯片数据
  deleteChipData: (chipId: string) => {
    set(produce<RFState>(draft => {
      // 检查是否存在要删除的chipId，存在则删除
      if (Object.hasOwn(draft.chipData, chipId)) {
        delete draft.chipData[chipId];
      }
    }));
  },
  
  // 获取芯片数据
  getChipData: (chipId: string) => {
    return get().chipData[chipId];
  },
}), shallow);

export default useDataStore;