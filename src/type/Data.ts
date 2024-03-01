// 定义数据类型
export interface DataItem {
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
  data: number;
}

export interface DataState {
  [edgeId: string]: DataItem;
}

// 定义上下文类型
export interface DataContextType {
  data: DataState;
  updateData: (newData: DataState) => void;
}