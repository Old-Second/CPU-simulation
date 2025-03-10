import './index.css'
import {Handle, Position, useNodeId} from "reactflow";
import useDataStore from "../../../store/useDataStore.ts";
import {useEffect, useState} from "react";
import {selector} from "../../../utils/selector.ts";


const DigitalTube = ({preview = false}: { preview?: boolean }) => {
  const {data, getData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(getData(nodeId, '111'))
  }, [data, getData, nodeId]);

  // 定义每个数字的数码管段
  const segments = [
    [1, 1, 1, 0, 1, 1, 1], // 0
    [0, 0, 0, 0, 1, 1, 0], // 1
    [1, 0, 1, 1, 0, 1, 1], // 2
    [1, 0, 0, 1, 1, 1, 1], // 3
    [0, 1, 0, 1, 1, 1, 0], // 4
    [1, 1, 0, 1, 1, 0, 1], // 5
    [1, 1, 1, 1, 1, 0, 1], // 6
    [1, 0, 0, 0, 1, 1, 0], // 7
    [1, 1, 1, 1, 1, 1, 1], // 8
    [1, 1, 0, 1, 1, 1, 1], // 9
  ];


  // 根据传入的值获取对应的数码管段定义
  const getSegment = (val: number) => {
    if (val >= 0 && val <= 9) {
      return segments[val];
    } else {
      return [0, 0, 0, 0, 0, 0, 0]; // 如果传入的值无效，则显示空白
    }
  };

  if (preview) {
    return (
      <div className="seven-segment-display">
        {getSegment(8).map((value, index) => ((value) ?
          <div key={`${nodeId}-${index}`} className={`segment-${index} segment`}></div> : ''))}
      </div>
    )
  }

  return (
    <div className="seven-segment-display">
      {getSegment(value).map((value, index) => ((value) ?
        <div key={`${nodeId}-${index}`} className={`segment-${index} segment`}></div> : ''))}
      <Handle type='target' id="111" position={Position.Left}/>
    </div>
  );

}

export default DigitalTube;