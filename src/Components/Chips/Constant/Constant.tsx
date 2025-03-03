import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import React, {useEffect, useState} from "react";
import useDataStore from "../../../store/useDataStore.ts";
import {selector} from "../../../utils/selector.ts";
import {Form, Input, message, Modal} from "antd";

const Constant = ({preview = false}: { preview?: boolean }) => {
  const {edges, updateData, chipData, updateChipData, getChipData} = useDataStore(selector);
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
  }, [edges, constantData.value, nodeId, updateData]);

  const [open, setOpen] = useState(false);
  const openEditConstant = () => setOpen(true);
  const closeEditConstant = () => setOpen(false);


  // 处理表单提交
  const handleSubmit = (values: { label: string; value: string; }) => {
    const parsedValue = parseInt(values.value, 16);
    setConstantData({...values, label: 'Constant', value: parsedValue});
    updateChipData(nodeId, {...values, label: 'Constant', value: parsedValue});
    void message.success('配置成功');
    closeEditConstant();
  };

  if (preview) {
    return (
      <div style={{padding: 2}}>
        <h2>1</h2>
      </div>
    );
  }

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
  const [inputValue, setInputValue] = useState(String(initialValues.value));

  useEffect(() => {
    setInputValue(String(initialValues.value));
  }, [initialValues.value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('0x')) {
      value = `0x${value}`;
    }
    setInputValue(value);
    form.setFieldsValue({value});
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const modifiedValues = {
          ...values,
          value: values.value.startsWith('0x') ? values.value : `0x${values.value}`,
        };
        onSubmit(modifiedValues);
      })
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
      <Form form={form} name="ConstantConfiguration" initialValues={{...initialValues, value: inputValue}}>
        <Form.Item
          name="value" label="Value"
          rules={[
            {required: true, message: '请输入数据!'},
            {
              pattern: /^(0x|0X)?[0-9a-fA-F]+$/,
              message: '请输入有效的十六进制数字!',
            },
          ]}
        >
          <Input placeholder="请输入十六进制数字" onChange={handleInputChange}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};