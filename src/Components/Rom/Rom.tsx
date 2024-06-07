import './index.css'
import {Handle, NodeToolbar, Position, useNodeId} from "reactflow";
import useDataStore from "../../store/useDataStore.ts";
import React, {useCallback, useEffect, useState} from "react";
import {Form, Input, InputNumber, message, Modal, Table} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";
import {selector} from "../../utils/selector.ts";

const {Column} = Table;


const Rom = () => {
  const {edges, data, chipData, updateData, getData, updateChipData, getChipData} = useDataStore(selector);
  const nodeId = useNodeId() as string;
  const [romInput, setRomInput] = useState({A: 0, sel: 0});
  const [romData, setRomData] = useState<{
    dataBits: number;
    addressBits: number;
    label: string,
    dataSource: { [address: string]: number; }
  }>({addressBits: 1, dataBits: 1, label: "ROM", dataSource: {}});
  
  useEffect(() => {
    setRomData((getChipData(nodeId) ?? getChipData('rom')) as {
      dataBits: number;
      addressBits: number;
      label: string,
      dataSource: { [address: string]: number; }
    });
  }, [chipData, getChipData, nodeId]);
  
  // 当数据或节点 ID 更改时更新 A 和 sel
  useEffect(() => {
    setRomInput({
      A: getData(nodeId, 'A'),
      sel: getData(nodeId, 'sel')
    })
  }, [data, getData, nodeId]);
  
  // 当 A 或数据源更改时更新 D
  useEffect(() => {
    const {A, sel} = romInput;
    if (sel === 1) {
      updateData(nodeId, 'D', romData.dataSource[A])
    }
  }, [edges, romInput, nodeId, romData, updateData]);
  
  const [open, setOpen] = useState(false);
  const openEditRom = () => setOpen(true);
  const closeEditRom = () => setOpen(false);
  
  // 处理表单提交
  const handleSubmit = (data: {
    dataBits: number;
    addressBits: number;
    label: string;
    dataSource: { [address: string]: number; }
  }) => {
    setRomData(data);
    updateChipData(nodeId, data);
    void message.success('配置成功');
    closeEditRom();
  }
  
  return (
    <>
      <h3>{romData.label}</h3>
      <div className="rom">
        {/* 节点端口 */}
        <p className={'rom-port rom-A'}>A</p>
        <p className={'rom-port rom-sel'}>sel</p>
        <p className={'rom-port rom-D'}>D</p>
        
        <NodeToolbar offset={0}>
          <EditOutlined onClick={openEditRom}/>
          <RomModal open={open} closeEditRom={closeEditRom} onSubmit={handleSubmit} initialValues={romData}/>
        </NodeToolbar>
        
        <Handle type='target' id="A" position={Position.Left} style={{top: '33%'}}/>
        <Handle type='target' id="sel" position={Position.Left} style={{top: '66%'}}/>
        <Handle type='source' id="D" position={Position.Right}/>
      </div>
    </>
  );
}

export default Rom;

interface RomModalProps {
  open: boolean;
  closeEditRom: () => void;
  initialValues: {
    label: string;
    dataBits: number;
    addressBits: number;
    dataSource: { [address: string]: number; }
  };
  onSubmit: (data: {
    dataBits: number;
    addressBits: number;
    label: string;
    dataSource: { [address: string]: number; }
  }) => void;
}

const RomModal: React.FC<RomModalProps> = ({open, closeEditRom, initialValues, onSubmit}) => {
  const [form] = Form.useForm();
  const [dataBits, setDataBits] = useState<number>(initialValues.dataBits);
  const [dataSource, setDataSource] = React.useState<Array<{
    key: number;
    address: string;
    value: string
  }>>(Object.entries(initialValues.dataSource).map(([address, value], index) => ({
      key: index,
      address: address.toString(),
      value: value.toString()
    }))
  );
  
  // 生成数据源
  const generateDataSource = useCallback((addressBits: number) => {
    const rowCount = Math.pow(2, addressBits);
    const newData = Array.from({length: rowCount}, (_, i) => ({
      key: i,
      address: i > 9 ? `0x${i.toString(16).toUpperCase()}` : i.toString(),
      value: '0',
    }));
    if (initialValues.dataSource[0]) {
      Array.from({length: rowCount}, (_, i) => {
          const newValue = initialValues.dataSource[i]?.toString() ?? '';
          const maxHexValue = Math.pow(2, initialValues.dataBits) - 1;
          if (parseInt(newValue, 16) > maxHexValue) {
            // 如果超出最大值，设置为最大可能的值
            newData[i].value = maxHexValue > 9 ? `0x${maxHexValue.toString(16).toUpperCase()}` : String(maxHexValue);
          } else {
            // 未超出最大值，直接更新为新输入的值，保留十六进制格式
            newData[i].value = parseInt(newValue, 16) > 9 ? `0x${newValue}` : newValue;
          }
        }
      );
    }
    setDataSource(newData);
  }, [initialValues.dataBits, initialValues.dataSource]);
  
  useEffect(() => {
    generateDataSource(initialValues.addressBits);
  }, [generateDataSource, initialValues.addressBits]);
  
  // 处理表单提交
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const decimalDataSource = dataSource.reduce((acc, item, index) => {
          acc[index] = parseInt(item.value, 16);
          return acc;
        }, {} as { [address: string]: number });
        onSubmit({...values, dataSource: decimalDataSource});
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  
  const inputDataSource = useCallback((newValue: string, index: number) => {
    const newData = [...dataSource];
    const maxHexValue = Math.pow(2, dataBits) - 1;
    // 检查输入的值是否小于2^(Data Bits)位的十六进制数字
    if (parseInt(newValue, 16) > maxHexValue) {
      // 如果超出最大值，设置为最大可能的值
      newData[index].value = maxHexValue > 9 ? `0x${maxHexValue.toString(16).toUpperCase()}` : String(maxHexValue);
    } else {
      // 未超出最大值，直接更新为新输入的值，保留十六进制格式
      newData[index].value = parseInt(newValue, 16) > 9 ? `0x${newValue}` : newValue;
    }
    setDataSource(newData);
  }, [dataBits, dataSource])
  
  return (
    <Modal
      open={open}
      title={`${initialValues.label} 配置`}
      okText="确定"
      cancelText="取消"
      onCancel={closeEditRom}
      onOk={handleOk}
    >
      <Form form={form} name="RomConfiguration" initialValues={initialValues}>
        <Form.Item
          name="dataBits" label="Data Bits"
          rules={[{required: true, message: '请输入数据位数!'}]}
        >
          <InputNumber min={1} max={32} onChange={value => setDataBits(value as number)}/>
        </Form.Item>
        <Form.Item
          name="addressBits" label="Address Bits"
          rules={[{required: true, message: '请输入地址位数!'}]}
        >
          <InputNumber min={1} max={32} onChange={value => generateDataSource(value as number)}/>
        </Form.Item>
        <Form.Item
          name="label" label="label"
        >
          <Input/>
        </Form.Item>
      </Form>
      <Table
        dataSource={dataSource}
        pagination={false}
        bordered
        size="small"
      >
        <Column title="Address" dataIndex="address" key="address"/>
        <Column
          title="Value"
          dataIndex="value"
          key="value"
          render={(text, _record, index) => (
            <Input
              value={text}
              onChange={(e) => {
                inputDataSource(e.target.value.toUpperCase(), index)
              }}
            />
          )}
        />
      </Table>
    </Modal>
  );
};