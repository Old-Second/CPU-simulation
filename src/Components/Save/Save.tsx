import {SaveOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {useCallback, useEffect} from "react";
import {Edge, Node, ReactFlowInstance, useReactFlow} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import {ChipDataState, DataState} from "../../type/Data.ts";

const selector = (state: {
  data: DataState;
  chipData: ChipDataState;
  setEdges: (edges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
  setData: (data: DataState) => void;
  setChipData: (chipData: ChipDataState) => void;
}) => ({
  data: state.data,
  chipData: state.chipData,
  setEdges: state.setEdges,
  setNodes: state.setNodes,
  setData: state.setData,
  setChipData: state.setChipData,
});

const Save = ({rfInstance}: { rfInstance: ReactFlowInstance }) => {
  const {data, chipData, setNodes, setEdges, setData, setChipData} = useDataStore(selector);
  const {setViewport} = useReactFlow();
  
  // 保存数据到本地存储
  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem('Circuit', JSON.stringify(flow));
      localStorage.setItem('data', JSON.stringify(data));
      localStorage.setItem('chip-data', JSON.stringify(chipData));
    }
  }, [chipData, data, rfInstance]);
  
  // 从本地存储恢复数据
  const onRestore = useCallback(async () => {
    const restoreData = async () => {
      const dataString = localStorage.getItem('data');
      const chipDataString = localStorage.getItem('chip-data');
      if (dataString && chipDataString) {
        const data = JSON.parse(dataString);
        const chipData = JSON.parse(chipDataString);
        if (data && chipData) {
          try {
            setChipData(chipData || []);
            setData(data || {});
          } catch (error) {
            console.error("An error occurred while restoring data:", error);
          }
        }
      }
    };
    const restoreFlow = async () => {
      const CircuitString = localStorage.getItem('Circuit');
      if (CircuitString) {
        const Circuit = JSON.parse(CircuitString);
        if (Circuit) {
          const {x = 0, y = 0, zoom = 1} = Circuit.viewport;
          try {
            setNodes(Circuit.nodes || []);
            setEdges(Circuit.edges || []);
            setViewport({x, y, zoom});
          } catch (error) {
            console.error("An error occurred while restoring data:", error);
          }
        }
      }
    }
    
    await restoreData();
    await restoreFlow();
  }, [setChipData, setData, setEdges, setNodes, setViewport]);
  
  // 组件挂载时执行保存操作
  useEffect(() => {
    onSave();
  }, []);
  // 组件挂载时执行恢复操作
  useEffect(() => {
    onRestore();
  }, []);
  
  return (
    <Button type="primary" icon={<SaveOutlined/>} onClick={() => {
      onSave();
    }}>
      保存
    </Button>
  )
};

export default Save;