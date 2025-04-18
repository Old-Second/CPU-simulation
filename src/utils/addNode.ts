import useDataStore from "../store/useDataStore.ts";
import {Node} from "reactflow";
import {nanoid} from "nanoid";

/**
 * 添加新节点到画布
 * @param type - 节点类型
 * @param position - 节点位置
 */
const addNode = (type: string, position: { x: number, y: number }): void => {
  // 获取当前节点列表
  const currentNodeList = useDataStore.getState().nodes;
  
  // 创建一个新节点
  const newNode: Node = {
    id: nanoid(), // 设置节点ID
    type: type, // 设置节点类型
    data: {}, // 设置节点数据
    position: position, // 设置节点位置
  };
  
  // 将新节点添加到当前节点列表中
  const updatedNodeList = [...currentNodeList, newNode];
  
  // 使用 setNodes 更新节点状态
  useDataStore.setState({nodes: updatedNodeList});
};

export default addNode;