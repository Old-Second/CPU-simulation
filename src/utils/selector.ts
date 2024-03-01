import {DataState} from "../type/Data.ts";

export const selector = (state: {
  data: DataState;
  updateData: (sourceId: string, sourcePort: string, newData: number) => void
}) => ({
  data: state.data,
  updateData: state.updateData,
});