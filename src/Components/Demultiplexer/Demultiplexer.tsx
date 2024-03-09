import './index.css';
import {Handle, NodeToolbar, Position, useNodeId, useUpdateNodeInternals} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, InputNumber, Input, message, Modal, Select} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const Demultiplexer = () => {
  const {data, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const updateNodeInternals = useUpdateNodeInternals();
  const [demultiplexerInput, setDemultiplexerInput] = useState<{ input: number; sel: number; }>({
    input: 0,
    sel: 0
  });
  const [demultiplexerData, setDemultiplexerData] = useState({
    label: "Demultiplexer",
    rotation: 0,
    dataBits: 1,
    numberOfSelectorBits: 1
  });
  
  useEffect(() => {
    setDemultiplexerData((getChipData(nodeId) ?? getChipData('demultiplexer')) as {
      label: string,
      rotation: number,
      dataBits: number,
      numberOfSelectorBits: number
    });
  }, [getChipData, nodeId]);
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [demultiplexerData, nodeId, updateNodeInternals]);
  
  useEffect(() => {
      setDemultiplexerInput({
        input: getData(nodeId, `input`),
        sel: getData(nodeId, 'sel')
      })
    }, [data, demultiplexerData.numberOfSelectorBits, getData, nodeId]
  );
  
  useEffect(() => {
    const {input, sel} = demultiplexerInput;
    // const out = input[sel];
    updateData(nodeId, `out${sel}`, input)
    // updateData(nodeId, 'out', out);
  }, [demultiplexerInput, demultiplexerData.dataBits, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditDemultiplexer = () => setOpen(true);
  const closeEditDemultiplexer = () => setOpen(false);
  
  // 处理表单提交
  const handleSubmit = (values: {
    label: string;
    rotation: number;
    dataBits: number;
    numberOfSelectorBits: number;
  }) => {
    setDemultiplexerData(values);
    updateChipData(nodeId, values);
    updateNodeInternals(nodeId);
    void message.success('配置成功');
    closeEditDemultiplexer();
  };
  
  return (
    <div className="demultiplexer-container">
      <h3>{demultiplexerData.label}</h3>
      <div className={`demultiplexer ${nodeId}`} style={{
        transform: `rotate(${-demultiplexerData.rotation}deg)`,
        height: `${30 * (Math.pow(2, demultiplexerData.numberOfSelectorBits) - 1) + 30 + 10}px`,
      }}>
        <style>
          {`.${nodeId}::before { height: ${30 * (Math.pow(2, demultiplexerData.numberOfSelectorBits) - 1) + 30}px; }`}
        </style>
        
        {/* 节点端口 */}
        <p className={'demultiplexer-port demultiplexer-0'}>0</p>
        
        <NodeToolbar isVisible={true} offset={0}>
          <EditOutlined onClick={openEditDemultiplexer}/>
          <DemultiplexerModal open={open} closeEditDemultiplexer={closeEditDemultiplexer}
                              initialValues={demultiplexerData}
                              onSubmit={handleSubmit}/>
        </NodeToolbar>
        
        {Array.from({length: Math.pow(2, demultiplexerData.numberOfSelectorBits)}, (_, i) => {
            const rightPosition = 30 * i;
            return <Handle key={`${nodeId}-out-${i}`} type='source' id={`out-${i}`} position={Position.Right}
                           style={{top: `${rightPosition + 15 + 5}px`}}/>
          }
        )}
        <Handle type='target' id="sel" position={Position.Bottom} style={{bottom: '7px'}}/>
        <Handle type='target' id="input" position={Position.Left}/>
      </div>
    </div>
  );
};

export default Demultiplexer;

interface DemultiplexerModalProps {
  open: boolean;
  closeEditDemultiplexer: () => void;
  initialValues: {
    label: string;
    rotation: number;
    dataBits: number;
    numberOfSelectorBits: number;
  };
  onSubmit: (values: { label: string; rotation: number; dataBits: number; numberOfSelectorBits: number; }) => void;
}

const DemultiplexerModal: React.FC<DemultiplexerModalProps> = ({
                                                                 open,
                                                                 closeEditDemultiplexer: closeEditDemultiplexer,
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
      onCancel={closeEditDemultiplexer}
      onOk={handleOk}
    >
      <Form form={form} name="DemultiplexerConfiguration" initialValues={initialValues}>
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