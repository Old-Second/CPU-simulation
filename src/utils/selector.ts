import {ChipDataState, DataState} from "../type/Data.ts";

export const selector = (state: {
  data: DataState;
  updateData: (sourceId: string, sourcePort: string, newData: number) => void;
  updateChipData: (chipId: string, chipData: ChipDataState) => void;
  getChipData: (chipId: string) => unknown;
}) => ({
  data: state.data,
  updateData: state.updateData,
  updateChipData: state.updateChipData,
  getChipData: state.getChipData,
});