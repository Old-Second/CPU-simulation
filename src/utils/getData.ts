import {DataState} from "../type/Data.ts";

/**
 * 从数据状态中获取特定目标 ID 和目标端口的数据。
 * @param targetId 目标 ID
 * @param targetPort 目标端口
 * @param currentData 当前数据状态
 * @returns 返回满足条件的元素的数据，如果没有找到则返回默认值 0
 */
const getData = (targetId: string, targetPort: string, currentData: DataState): number => {
  // 找到满足条件的元素
  const foundItemKey = Object.keys(currentData).find(key => {
    const {targetId: itemTargetId, targetPort: itemTargetPort} = currentData[key];
    return itemTargetId === targetId && itemTargetPort === targetPort;
  });
  
  // 返回满足条件的元素的数据，如果没有找到则返回默认值 0
  return foundItemKey ? currentData[foundItemKey].data : 0;
};

export default getData;