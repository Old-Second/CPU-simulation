import './index.css';
import {Handle, NodeToolbar, Position, useNodeId, useUpdateNodeInternals} from "reactflow";
import useDataStore from "../../../store/useDataStore.ts";
import React, {useEffect, useState} from "react";
import {Form, Input, InputNumber, message, Modal, Select} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../../utils/selector.ts";

const Or = ({preview = false}: { preview?: boolean }) => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const updateNodeInternals = useUpdateNodeInternals();
  const [orInput, setOrInput] = useState<number[][]>([[0], [0]]);
  const [orData, setOrData] = useState({
    label: "OR",
    rotation: 0,
    dataBits: 1,
    numberOfInputs: 2
  });

  useEffect(() => {
    setOrData((getChipData(nodeId) ?? getChipData('or')) as {
      label: string,
      rotation: number,
      dataBits: number,
      numberOfInputs: number
    });
  }, [chipData, getChipData, nodeId]);
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [orData, nodeId, updateNodeInternals]);

  // 当数据或节点 ID 更改时更新
  useEffect(() => {
      const inputs = [];
      for (let i = 1; i <= orData.numberOfInputs; i++) {
        const rawValue = getData(nodeId, `in${i}`) ?? 0;
        const maskedValue = rawValue & ((1 << orData.dataBits) - 1);
        const bitArray = maskedValue.toString(2)
          .padStart(orData.dataBits, '0')
          .split('')
          .map(Number);
        inputs.push(bitArray);
      }
      setOrInput(inputs);
    }, [data, getData, nodeId, orData.dataBits, orData.numberOfInputs]
  );

  // 更新输出
  useEffect(() => {
    if (orInput.length === 0 || orData.dataBits === 0) return;

    const outputBits = orInput[0].map((_, index) =>
      orInput.some(input => input[index] === 1) ? 1 : 0
    );
    const outputValue = parseInt(outputBits.join(''), 2);
    updateData(nodeId, 'out', outputValue);
  }, [edges, orInput, nodeId, updateData, orData.dataBits]);

  const [open, setOpen] = useState(false);
  const openEditOr = () => setOpen(true);
  const closeEditOr = () => setOpen(false);


  // 处理表单提交
  const handleSubmit = (values: typeof orData) => {
    setOrData(values);
    updateChipData(nodeId, values);
    updateNodeInternals(nodeId);
    void message.success('配置成功');
    closeEditOr();
  };

  if (preview) {
    return (
      <div className="or" style={{transform: `rotate(${-orData.rotation}deg)`}}>
        <p className={'or-≥1'}>≥1</p>
      </div>
    );
  }

  return (
    <>
      <h3>{orData.label}</h3>
      <div className="or" style={{transform: `rotate(${-orData.rotation}deg)`}}>
        <p className={'or-≥1'}>≥1</p>

        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditOr}/>
          <OrModal open={open} closeEditOr={closeEditOr} initialValues={orData} onSubmit={handleSubmit}/>
        </NodeToolbar>

        {Array.from({length: orData.numberOfInputs}, (_, i) => {
          const positionPercentage = ((i + 1) / (orData.numberOfInputs + 1)) * 100;
          return (
            <Handle
              key={`${nodeId}-in${i + 1}`}
              type="target"
              id={`in${i + 1}`}
              position={Position.Left}
              style={{top: `${positionPercentage}%`}}
            />
          );
        })}
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
    dataBits: number;
    numberOfInputs: number;
  };
  onSubmit: (values: typeof Or.prototype.orData) => void;
}

const OrModal: React.FC<OrModalProps> = ({open, closeEditOr, initialValues, onSubmit}) => {
  const [form] = Form.useForm();
  const handleOk = () => {
    form.validateFields()
      .then(values => onSubmit({...initialValues, ...values}))
      .catch(info => console.log('Validate Failed:', info));
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
          name="dataBits"
          label="Data Bits"
          rules={[{required: true, message: '请输入数据位数!'}]}
        >
          <InputNumber min={1} max={32}/>
        </Form.Item>
        <Form.Item
          name="numberOfInputs"
          label="Number of inputs"
          rules={[{required: true, message: '请输入输入端口数量!'}]}
        >
          <InputNumber min={2} max={8}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};