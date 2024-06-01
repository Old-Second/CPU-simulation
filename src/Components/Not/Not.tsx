import './index.css';
import {Handle, NodeToolbar, Position, useNodeId, useUpdateNodeInternals} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, message, Modal, Select} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const Not = () => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const updateNodeInternals = useUpdateNodeInternals();
  const [notInput, setNotInput] = useState(0);
  const [notData, setNotData] = useState({
    label: "Not",
    rotation: 0,
  });
  
  useEffect(() => {
    setNotData((getChipData(nodeId) ?? getChipData('not')) as { label: string, rotation: number });
  }, [chipData, getChipData, nodeId]);
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [notData, nodeId, updateNodeInternals]);
  
  // 当数据或节点 ID 更改时更新
  useEffect(() => {
      setNotInput(getData(nodeId, 'in'))
    }, [data, getData, nodeId]
  );
  
  // 更新输出
  useEffect(() => {
    const invertedInput = parseInt(notInput.toString(2).split('').map(bit => bit === '0' ? '1' : '0').join(''), 2);
    updateData(nodeId, 'out', invertedInput);
  }, [edges, notInput, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditNot = () => setOpen(true);
  const closeEditNot = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { label: string; rotation: number; }) => {
    setNotData({...values, label: 'Not'});
    updateChipData(nodeId, {...values, label: 'Not'});
    updateNodeInternals(nodeId);
    void message.success('配置成功');
    closeEditNot();
  };
  
  return (
    <>
      <h3>{notData.label}</h3>
      <div className="not" style={{transform: `rotate(${-notData.rotation}deg)`}}>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditNot}/>
          <NotModal open={open} closeEditNot={closeEditNot} initialValues={notData} onSubmit={handleSubmit}/>
        </NodeToolbar>
        <div className='not-square'>
          <Handle type='target' id="in" position={Position.Left}/>
        </div>
        <div className="not-circle">
          <Handle type='source' id="out" position={Position.Right}/>
        </div>
      </div>
    </>
  );
};

export default Not;

interface NotModalProps {
  open: boolean;
  closeEditNot: () => void;
  initialValues: {
    label: string;
    rotation: number;
  };
  onSubmit: (values: { label: string; rotation: number; }) => void;
}

const NotModal: React.FC<NotModalProps> = ({open, closeEditNot, initialValues, onSubmit}) => {
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
      onCancel={closeEditNot}
      onOk={handleOk}
    >
      <Form form={form} name="NotConfiguration" initialValues={initialValues}>
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