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

export interface ChipDataState {
  [nodeId: string]: unknown;
}