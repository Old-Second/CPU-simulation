import './index.css';
import {Handle, NodeToolbar, Position, useNodeId, useUpdateNodeInternals} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, InputNumber, Input, message, Modal, Select} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const Multiplexer = () => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const updateNodeInternals = useUpdateNodeInternals();
  const [multiplexerInput, setMultiplexerInput] = useState<{ input: number[]; sel: number; }>({
    input: [],
    sel: 0
  });
  const [multiplexerData, setMultiplexerData] = useState({
    label: "Multiplexer",
    rotation: 0,
    dataBits: 1,
    numberOfSelectorBits: 1
  });
  
  useEffect(() => {
    setMultiplexerData((getChipData(nodeId) ?? getChipData('multiplexer')) as {
      label: string,
      rotation: number,
      dataBits: number,
      numberOfSelectorBits: number
    });
  }, [chipData, getChipData, nodeId]);
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [multiplexerData, nodeId, updateNodeInternals]);
  
  useEffect(() => {
      setMultiplexerInput({
        input: Array.from({length: Math.pow(2, multiplexerData.numberOfSelectorBits)}, (_, index) =>
          getData(nodeId, `input${index}`)
        ),
        sel: getData(nodeId, 'sel')
      })
    }, [data, getData, multiplexerData.numberOfSelectorBits, nodeId]
  );
  
  useEffect(() => {
    const {input, sel} = multiplexerInput;
    const out = input[sel];
    updateData(nodeId, 'out', out);
  }, [edges, multiplexerInput, multiplexerData.dataBits, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditMultiplexer = () => setOpen(true);
  const closeEditMultiplexer = () => setOpen(false);
  
  // 处理表单提交
  const handleSubmit = (values: {
    label: string;
    rotation: number;
    dataBits: number;
    numberOfSelectorBits: number;
  }) => {
    setMultiplexerData(values);
    updateChipData(nodeId, values);
    updateNodeInternals(nodeId);
    void message.success('配置成功');
    closeEditMultiplexer();
  };
  
  
  return (
    <div className="multiplexer-container">
      <h3>{multiplexerData.label}</h3>
      <div className={`multiplexer ${nodeId}`} style={{
        transform: `rotate(${-multiplexerData.rotation}deg)`,
        height: `${30 * (Math.pow(2, multiplexerData.numberOfSelectorBits) - 1) + 30 + 10}px`,
      }}>
        <style>
          {`.${nodeId}::before { height: ${30 * (Math.pow(2, multiplexerData.numberOfSelectorBits) - 1) + 30}px; }`}
        </style>
        
        {/* 节点端口 */}
        <p className={'multiplexer-port multiplexer-0'}>0</p>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditMultiplexer}/>
          <MultiplexerModal open={open} closeEditMultiplexer={closeEditMultiplexer} initialValues={multiplexerData}
                            onSubmit={handleSubmit}/>
        </NodeToolbar>
        
        {Array.from({length: Math.pow(2, multiplexerData.numberOfSelectorBits)}, (_, i) => {
            const leftPosition = 30 * i;
            return <Handle key={`${nodeId}-input-${i}`} type='target' id={`input-${i}`} position={Position.Left}
                           style={{top: `${leftPosition + 15 + 5}px`}}/>
          }
        )}
        <Handle type='target' id="sel" position={Position.Bottom} style={{bottom: '7px'}}/>
        <Handle type='source' id="out" position={Position.Right}/>
      </div>
    </div>
  );
};

export default Multiplexer;

interface MultiplexerModalProps {
  open: boolean;
  closeEditMultiplexer: () => void;
  initialValues: {
    label: string;
    rotation: number;
    dataBits: number;
    numberOfSelectorBits: number;
  };
  onSubmit: (values: { label: string; rotation: number; dataBits: number; numberOfSelectorBits: number; }) => void;
}

const MultiplexerModal: React.FC<MultiplexerModalProps> = ({
                                                             open,
                                                             closeEditMultiplexer: closeEditMultiplexer,
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
      onCancel={closeEditMultiplexer}
      onOk={handleOk}
    >
      <Form form={form} name="MultiplexerConfiguration" initialValues={initialValues}>
        <Form.Item
          name="label" label="Label"
        >
          <Input/>
        </Form.Item>
        <Form.Item
          name="rotation" label="Rotation"
        >
          <Select options={[
            {value: 0, label: '0°'},
            {value: 90, label: '90°'},
            {value: 180, label: '180°'},
            {value: 270, label: '270°'}]}/>
        </Form.Item>
        <Form.Item
          name="dataBits" label="Data Bits"
          rules={[{required: true, message: '请输入数据位数!'}]}
        >
          <InputNumber min={1} max={32}/>
        </Form.Item>
        <Form.Item
          name="numberOfSelectorBits" label="Number of Selector Bits"
          rules={[{required: true, message: '请输入选择器位数!'}]}
        >
          <InputNumber min={1} max={32}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};