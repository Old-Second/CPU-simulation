import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import React, {useEffect, useState} from "react";
import useDataStore from "../../store/useDataStore.ts";
import {selector} from "../../utils/selector.ts";
import {Form, InputNumber, message, Modal} from "antd";

const One = () => {
  const {updateData, chipData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [oneData, setOneData] = useState({
    label: "One",
    dataBits: 1,
  });
  
  useEffect(() => {
    setOneData((getChipData(nodeId) ?? getChipData('one')) as { label: string, dataBits: number });
  }, [chipData, getChipData, nodeId]);
  
  // 更新输出
  useEffect(() => {
    updateData(nodeId, '1', Number('1'.repeat(oneData.dataBits)))
  }, [oneData.dataBits, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditOne = () => setOpen(true);
  const closeEditOne = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { label: string; dataBits: number; }) => {
    setOneData(values);
    updateChipData(nodeId, values);
    void message.success('配置成功');
    closeEditOne();
  };
  
  return (
    <>
      <div style={{padding: 2}}>
        <h2>1</h2>
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditOne}/>
          <OneModal open={open} closeEditOne={closeEditOne} initialValues={oneData}
                    onSubmit={handleSubmit}/>
        </NodeToolbar>
        <Handle type='source' id="1" position={Position.Right}/>
      </div>
    </>
  );
}

export default One;

interface OneModalProps {
  open: boolean;
  closeEditOne: () => void;
  initialValues: {
    label: string;
    dataBits: number;
  };
  onSubmit: (values: { label: string; dataBits: number; }) => void;
}

const OneModal: React.FC<OneModalProps> = ({open, closeEditOne, initialValues, onSubmit}) => {
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
      onCancel={closeEditOne}
      onOk={handleOk}
    >
      <Form form={form} name="OneConfiguration" initialValues={initialValues}>
        <Form.Item
          name="dataBits" label="Data Bits"
          rules={[{required: true, message: '请输入数据位数!'}]}
        >
          <InputNumber min={1} max={32}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};