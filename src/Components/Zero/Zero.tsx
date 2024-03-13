import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import React, {useEffect, useState} from "react";
import useDataStore from "../../store/useDataStore.ts";
import {selector} from "../../utils/selector.ts";
import {Form, InputNumber, message, Modal} from "antd";

const Zero = () => {
  const {updateData, chipData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [zeroData, setZeroData] = useState({
    label: "Zero",
    dataBits: 1,
  });
  
  useEffect(() => {
    setZeroData((getChipData(nodeId) ?? getChipData('zero')) as { label: string, dataBits: number });
  }, [chipData, getChipData, nodeId]);
  
  // 更新输出
  useEffect(() => {
    updateData(nodeId, '0', Number('0'.repeat(zeroData.dataBits)))
  }, [zeroData.dataBits, nodeId, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditZero = () => setOpen(true);
  const closeEditZero = () => setOpen(false);
  
  
  // 处理表单提交
  const handleSubmit = (values: { label: string; dataBits: number; }) => {
    setZeroData(values);
    updateChipData(nodeId, values);
    void message.success('配置成功');
    closeEditZero();
  };
  
  return (
    <>
      <div style={{padding: 2}}>
        <h2>0</h2>
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditZero}/>
          <ZeroModal open={open} closeEditZero={closeEditZero} initialValues={zeroData}
                     onSubmit={handleSubmit}/>
        </NodeToolbar>
        <Handle type='source' id="0" position={Position.Right}/>
      </div>
    </>
  );
}

export default Zero;

interface ZeroModalProps {
  open: boolean;
  closeEditZero: () => void;
  initialValues: {
    label: string;
    dataBits: number;
  };
  onSubmit: (values: { label: string; dataBits: number; }) => void;
}

const ZeroModal: React.FC<ZeroModalProps> = ({open, closeEditZero, initialValues, onSubmit}) => {
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
      onCancel={closeEditZero}
      onOk={handleOk}
    >
      <Form form={form} name="ZeroConfiguration" initialValues={initialValues}>
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