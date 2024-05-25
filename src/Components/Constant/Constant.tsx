import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import React, {useEffect, useState} from "react";
import useDataStore from "../../store/useDataStore.ts";
import {selector} from "../../utils/selector.ts";
import {Form, Input, message, Modal} from "antd";

const Constant = () => {
  const {updateData, chipData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [constantData, setConstantData] = useState({
    label: "Constant",
    value: 1,
  });
  
  useEffect(() => {
    setConstantData((getChipData(nodeId) ?? getChipData('constant')) as { label: string, value: number });
  }, [chipData, getChipData, nodeId]);
  
  // 更新输出
  useEffect(() => {
    updateData(nodeId, 'out', Number(constantData.value))
  }, [constantData.value, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditConstant = () => setOpen(true);
  const closeEditConstant = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { label: string; value: string; }) => {
    const parsedValue = parseInt(values.value, 16);
    setConstantData({...values, value: parsedValue});
    updateChipData(nodeId, {...values, value: parsedValue});
    void message.success('配置成功');
    closeEditConstant();
  };
  
  return (
    <>
      <div style={{padding: 2}}>
        <h2>{constantData.value > 9 ? '0x' + constantData.value.toString(16).toUpperCase() : constantData.value.toString(16).toUpperCase()}</h2>
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditConstant}/>
          <ConstantModal open={open} closeEditConstant={closeEditConstant} initialValues={constantData}
                         onSubmit={handleSubmit}/>
        </NodeToolbar>
        <Handle type='source' id="out" position={Position.Right}/>
      </div>
    </>
  );
}

export default Constant;

interface ConstantModalProps {
  open: boolean;
  closeEditConstant: () => void;
  initialValues: {
    label: string;
    value: number;
  };
  onSubmit: (values: { label: string; value: string; }) => void;
}

const ConstantModal: React.FC<ConstantModalProps> = ({open, closeEditConstant, initialValues, onSubmit}) => {
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
      onCancel={closeEditConstant}
      onOk={handleOk}
    >
      <Form form={form} name="ConstantConfiguration" initialValues={initialValues}>
        <Form.Item
          name="value" label="Value"
          rules={[
            {required: true, message: '请输入数据!'},
            {
              pattern: /^[0-9a-fA-F]+$/,
              message: '请输入有效的十六进制字符串!',
            },
          ]}
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  );
};