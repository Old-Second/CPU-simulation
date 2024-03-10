import {ChipDataState, DataState} from "../type/Data.ts";

export const selector = (state: {
  data: DataState;
  chipData: ChipDataState;
  updateData: (sourceId: string, sourcePort: string, newData: number) => void;
  getData: (targetId: string, targetPort: string) => number;
  updateChipData: (chipId: string, chipData: ChipDataState) => void;
  getChipData: (chipId: string) => unknown;
}) => ({
  data: state.data,
  chipData: state.chipData,
  updateData: state.updateData,
  getData: state.getData,
  updateChipData: state.updateChipData,
  getChipData: state.getChipData,
});