import {ChipConfigValue, ChipDataState, DataState} from "../type/Data.ts";
import {Edge} from "reactflow";

/**
 * 通用选择器，用于从状态中提取特定字段
 * 使用此选择器可以避免不必要的重渲染
 */
export const selector = (state: {
  edges: Edge[];
  data: DataState;
  chipData: ChipDataState;
  updateData: (sourceId: string, sourcePort: string, newData: number) => void;
  getData: (targetId: string, targetPort: string) => number;
  updateChipData: (chipId: string, chipData: ChipConfigValue) => void;
  getChipData: (chipId: string) => ChipConfigValue;
}) => ({
  edges: state.edges,
  data: state.data,
  chipData: state.chipData,
  updateData: state.updateData,
  getData: state.getData,
  updateChipData: state.updateChipData,
  getChipData: state.getChipData,
});