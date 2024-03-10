import './index.css';
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, Input, message, Modal} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const HandInput = () => {
  const {updateData, chipData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [handInputData, setHandInputData] = useState({
    label: "HandInput",
    // dataBits: 1,
  });
  const [out, setOut] = useState(0);
  
  useEffect(() => {
    setHandInputData((getChipData(nodeId) ?? getChipData('handInput')) as { label: string });
  }, [chipData, getChipData, nodeId]);
  
  // 更新输出
  const updateHandInputData = () => {
    updateData(nodeId, 'out', Number(!out));
    setOut(prev => Number(!prev));
  }
  
  const [open, setOpen] = useState(false);
  const openEditHandInput = () => setOpen(true);
  const closeEditHandInput = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { label: string; /*dataBits: number;*/ }) => {
    setHandInputData({...values});
    updateChipData(nodeId, values);
    void message.success('配置成功');
    closeEditHandInput();
  };
  
  return (
    <>
      <h3>{handInputData.label}</h3>
      <div className="handInput" onClick={updateHandInputData}>
        <div className='handInput-circle' style={{backgroundColor: out ? 'green' : 'red'}}/>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditHandInput}/>
          <HandInputModal open={open} closeEditHandInput={closeEditHandInput} initialValues={handInputData}
                          onSubmit={handleSubmit}/>
        </NodeToolbar>
        
        <Handle type='source' id="out" position={Position.Right}/>
      </div>
    </>
  );
};

export default HandInput;

interface HandInputModalProps {
  open: boolean;
  closeEditHandInput: () => void;
  initialValues: {
    label: string;
    // dataBits: number;
  };
  onSubmit: (values: { label: string; /*dataBits: number;*/ }) => void;
}

const HandInputModal: React.FC<HandInputModalProps> = ({open, closeEditHandInput, initialValues, onSubmit}) => {
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
      onCancel={closeEditHandInput}
      onOk={handleOk}
    >
      <Form form={form} name="HandInputConfiguration" initialValues={initialValues}>
        <Form.Item
          name="label" label="Label"
        >
          <Input/>
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