import './index.css';
import {Handle, NodeToolbar, Position, useNodeId, useUpdateNodeInternals} from "reactflow";
import useDataStore from "../../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, message, Modal, Select} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../../utils/selector.ts";

const Or = () => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const updateNodeInternals = useUpdateNodeInternals();
  const [orInput, setOrInput] = useState<number[][]>([[0], [0]]);
  const [orData, setOrData] = useState({
    label: "OR",
    rotation: 0,
  });
  
  useEffect(() => {
    setOrData((getChipData(nodeId) ?? getChipData('or')) as { label: string, rotation: number });
  }, [chipData, getChipData, nodeId]);
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [orData, nodeId, updateNodeInternals]);
  
  // 当数据或节点 ID 更改时更新
  useEffect(() => {
      const input1 = (getData(nodeId, 'in1')?.toString(2) ?? '').padStart(32, '0').split('').map(Number);
      const input2 = (getData(nodeId, 'in2')?.toString(2) ?? '').padStart(32, '0').split('').map(Number);
      setOrInput([input1, input2]);
    }, [data, getData, nodeId]
  );
  
  // 更新输出
  useEffect(() => {
    const output = orInput[0].map((bit, index) => (bit || orInput[1][index]) ? 1 : 0);
    updateData(nodeId, 'out', parseInt(output.join(''), 2));
  }, [edges, orInput, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditOr = () => setOpen(true);
  const closeEditOr = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { label: string; rotation: number; }) => {
    setOrData({...values, label: 'Or'});
    updateChipData(nodeId, {...values, label: 'Or'});
    updateNodeInternals(nodeId);
    void message.success('配置成功');
    closeEditOr();
  };
  
  return (
    <>
      <h3>{orData.label}</h3>
      <div className="or" style={{transform: `rotate(${-orData.rotation}deg)`}}>
        <p className={'or-≥1'}>≥1</p>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditOr}/>
          <OrModal open={open} closeEditOr={closeEditOr} initialValues={orData} onSubmit={handleSubmit}/>
        </NodeToolbar>
        
        <Handle type='target' id="in1" position={Position.Left} style={{top: '33%'}}/>
        <Handle type='target' id="in2" position={Position.Left} style={{top: '66%'}}/>
        <Handle type='source' id="out" position={Position.Right}/>
      </div>
    </>
  );
};

export default Or;

interface OrModalProps {
  open: boolean;
  closeEditOr: () => void;
  initialValues: {
    label: string;
    rotation: number;
  };
  onSubmit: (values: { label: string; rotation: number; }) => void;
}

const OrModal: React.FC<OrModalProps> = ({open, closeEditOr, initialValues, onSubmit}) => {
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
      onCancel={closeEditOr}
      onOk={handleOk}
    >
      <Form form={form} name="OrConfiguration" initialValues={initialValues}>
        <Form.Item
          name="rotation" label="Rotation"
        >
          <Select options={[
            {value: 0, label: '0°'},
            {value: 90, label: '90°'},
            {value: 180, label: '180°'},
            {value: 270, label: '270°'}]}/>
        </Form.Item>
        {/*<Form.Item*/}
        {/*  name="dataBits" label="Data Bits"*/}
        {/*  rules={[{required: true, message: '请输入数据位数!'}]}*/}
        {/*>*/}
        {/*  <InputNumber min={1} max={32}/>*/}
        {/*</Form.Item>*/}
      </Form>
    </Modal>
  );
};