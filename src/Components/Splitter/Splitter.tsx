import './index.css';
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import getData from "../../utils/getData.ts";
import React, {useEffect, useState} from "react";
import {Form, Input, message, Modal} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const Splitter = () => {
  const {data, updateData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [splitterInput, setSplitterInput] = useState('');
  
  const [splitterData, setSplitterData] = useState({
    label: "Splitter",
    InputSplitting: '4,4', // 输入分割信息
    OutputSplitting: '8', // 输出分割信息
  });
  
  // 输入和输出端口范围的状态
  const [inPort, setInPort] = useState<string[]>(['0-3', '5-8'])
  const [outPort, setOutPort] = useState<string[]>(['0-7'])
  
  useEffect(() => {
    // 解析分割数据
    const parseSplittingData = (splittingData: string) => {
      const lengths = splittingData.split(',').map(Number);
      let current = 0;
      return lengths.map(length => {
        const start = current;
        const end = current + length - 1;
        current = end + 1;
        return `${start}-${end}`;
      });
    };
    
    // 更新端口范围
    setInPort(parseSplittingData(splitterData.InputSplitting));
    setOutPort(parseSplittingData(splitterData.OutputSplitting));
  }, [splitterData]);
  
  useEffect(() => {
    // 获取输入端口数据
    setSplitterInput(Array.from({length: splitterData.InputSplitting.split(',').length}, (_, index) =>
      getData(nodeId, `input-${inPort[index]}`, data)
    ).join(''))
  }, [data, splitterData.InputSplitting, nodeId, inPort]);
  
  useEffect(() => {
    // 解析输出分割信息
    const outputLengths = splitterData.OutputSplitting.split(',').map(Number);
    let currentIndex = 0;
    
    // 更新输出数据
    outputLengths.forEach((length, i) => {
      const outputBinary = splitterInput.slice(currentIndex, currentIndex + length);
      const output = parseInt(outputBinary);
      currentIndex += length;
      updateData(nodeId, `out-${outPort[i]}`, output);
    });
  }, [splitterInput, splitterData.OutputSplitting, nodeId, updateData, outPort]);
  
  const [open, setOpen] = useState(false);
  const openEditSplitter = () => setOpen(true);
  const closeEditSplitter = () => setOpen(false);
  
  // 处理表单提交
  const handleSubmit = (values: {
    label: string;
    InputSplitting: string;
    OutputSplitting: string;
  }) => {
    // 更新分离器数据
    setSplitterData((prevData) => ({
      ...prevData,
      ...(values.InputSplitting && {InputSplitting: values.InputSplitting}),
      ...(values.OutputSplitting && {OutputSplitting: values.OutputSplitting}),
    }));
    void message.success('配置成功');
    closeEditSplitter();
  };
  
  
  return (
    <div className="splitter-container">
      {/*<h3>{splitterData.label}</h3>*/}
      {/* 输入端口标记 */}
      {Array.from({length: splitterData.InputSplitting.split(',').length}, (_, i) => {
        const step = 80 / (Math.max(splitterData.InputSplitting.split(',').length, splitterData.OutputSplitting.split(',').length) - 1);
        const leftPosition = 10 + step * i;
        return <p key={`input-${inPort[i]}-port`} className={'splitter-port-in'}
                  style={{top: `calc(${leftPosition}% - 10px)`}}>{inPort[i]}</p>
      })}
      {/* 输出端口标记 */}
      {Array.from({length: splitterData.OutputSplitting.split(',').length}, (_, i) => {
        const step = 80 / (Math.max(splitterData.InputSplitting.split(',').length, splitterData.OutputSplitting.split(',').length) - 1);
        const rightPosition = 10 + step * i;
        return <p key={`output-${outPort[i]}-port`} className={'splitter-port-out'}
                  style={{top: `calc(${rightPosition}% - 10px)`}}>{outPort[i]}</p>
      })}
      
      <div className="splitter" style={{
        height: `${15 * (Math.max(splitterData.InputSplitting.split(',').length, splitterData.OutputSplitting.split(',').length)) + 10}px`,
      }}>
        
        <NodeToolbar isVisible={true} offset={0}>
          <EditOutlined onClick={openEditSplitter}/>
          <SplitterModal open={open} closeEditSplitter={closeEditSplitter} initialValues={splitterData}
                         onSubmit={handleSubmit}/>
        </NodeToolbar>
        
        {/* 输入端口 */}
        {Array.from({length: splitterData.InputSplitting.split(',').length}, (_, i) => {
          const step = 80 / (Math.max(splitterData.InputSplitting.split(',').length, splitterData.OutputSplitting.split(',').length) - 1);
          const leftPosition = 10 + step * i;
          return <Handle key={`input-${inPort[i]}`} type='target' id={`input-${inPort[i]}`} position={Position.Left}
                         style={{top: `${leftPosition}%`}}/>
        })}
        {/* 输出端口 */}
        {Array.from({length: splitterData.OutputSplitting.split(',').length}, (_, i) => {
          const step = 80 / (Math.max(splitterData.InputSplitting.split(',').length, splitterData.OutputSplitting.split(',').length) - 1);
          const rightPosition = 10 + step * i;
          return <Handle key={`output-${outPort[i]}`} type='source' id={`output-${outPort[i]}`}
                         position={Position.Right} style={{top: `${rightPosition}%`}}/>
        })}
      </div>
    </div>
  );
};

export default Splitter;

interface SplitterModalProps {
  open: boolean;
  closeEditSplitter: () => void;
  initialValues: {
    label: string;
    InputSplitting: string,
    OutputSplitting: string,
  };
  onSubmit: (values: { label: string; InputSplitting: string; OutputSplitting: string; }) => void;
}

const SplitterModal: React.FC<SplitterModalProps> = ({
                                                       open,
                                                       closeEditSplitter: closeEditSplitter,
                                                       initialValues,
                                                       onSubmit
                                                     }) => {
  const [form] = Form.useForm();
  
  const handleOk = () => {
    form
      .validateFields()
      .then(onSubmit)
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  
  return (
    <Modal
      open={open}
      title={`${initialValues.label} 配置`}
      okText="确定"
      cancelText="取消"
      onCancel={closeEditSplitter}
      onOk={handleOk}
    >
      <Form form={form} name="SplitterConfiguration" initialValues={initialValues}>
        <Form.Item
          name="InputSplitting" label="Input Splitting"
        >
          <Input/>
        </Form.Item>
        <Form.Item
          name="OutputSplitting" label="Output Splitting"
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  );
};