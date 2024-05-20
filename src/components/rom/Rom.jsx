import './index.css'
import {useCallback, useEffect, useState} from "react";
import {Form, Input, InputNumber, message, Modal, Table} from "antd";
import {EditOutlined} from "@ant-design/icons/lib/icons";

const {Column} = Table;


const Rom = ({A, sel, changeRom}) => {
  // const [romInput, setRomInput] = useState({A: 0, sel: 0});
  const [romData, setRomData] = useState({addressBits: 1, dataBits: 7, label: "ROM", dataSource: []});

  // useEffect(() => {
  //   setRomData((getChipData(nodeId) ?? getChipData('rom')));
  // }, [chipData, getChipData, nodeId]);
  //
  // // 当数据或节点 ID 更改时更新 A 和 sel
  // useEffect(() => {
  //   setRomInput({
  //     A: getData(nodeId, 'A'),
  //     sel: getData(nodeId, 'sel')
  //   })
  // }, [data, getData, nodeId]);

  // 当 A 或数据源更改时更新 D
  useEffect(() => {
    // const {A, sel} = romInput;
    if (sel === 1) {
      changeRom(romData.dataSource[A])
      console.log('out', romData)
    }
  }, [A, changeRom, romData, romData.dataSource, sel]);

  const [open, setOpen] = useState(false);
  const openEditRom = () => setOpen(true);
  const closeEditRom = () => setOpen(false);

  // 处理表单提交
  const handleSubmit = (data) => {
    setRomData(data);
    // updateChipData(nodeId, data);
    void message.success('配置成功');
    closeEditRom();
  }

  return (
      <>
        {/*<h3>{romData.label}</h3>*/}
        <div className="rom">
          {/* 节点端口 */}
          <p className={'rom-port rom-A'}>A</p>
          <p className={'rom-port rom-sel'}>sel</p>
          <p className={'rom-port rom-D'}>D</p>

          {/*<NodeToolbar offset={0}>*/}
          <EditOutlined onClick={openEditRom}/>
          <RomModal open={open} closeEditRom={closeEditRom} onSubmit={handleSubmit} initialValues={romData}/>
          {/*</NodeToolbar>*/}

          {/*<Handle type='target' id="A" position={Position.Left} style={{top: '33%'}}/>*/}
          {/*<Handle type='target' id="sel" position={Position.Left} style={{top: '66%'}}/>*/}
          {/*<Handle type='source' id="D" position={Position.Right}/>*/}
        </div>
      </>
  );
}

export default Rom;


const RomModal = ({open, closeEditRom, initialValues, onSubmit}) => {
  const [form] = Form.useForm();
  const [dataBits, setDataBits] = useState(7);
  const [addressBits, setAddressBits] = useState(1);
  const [dataSource, setDataSource] = useState([]);

  // 生成数据源
  const generateDataSource = useCallback((addressBits, dataSource) => {
    const rowCount = Math.pow(2, addressBits);
    const newData = Array.from({length: rowCount}, (_, i) => ({
      key: i,
      address: i > 9 ? `0x${i.toString(16).toUpperCase()}` : i.toString(),
      value: dataSource[i] ? dataSource[i].value : '0',
    }));
    console.log('init', newData);
    return newData;
  }, []);

  useEffect(() => {
    const newData = generateDataSource(addressBits, dataSource);
    if (newData.length !== dataSource.length) {
      setDataSource(newData);
    }
  }, [addressBits, dataSource, generateDataSource]);


  // 处理表单提交
  const handleOk = () => {
    form
        .validateFields()
        .then((values) => {
          const decimalDataSource = dataSource.reduce((acc, item) => {
            acc[item.address] = item.value;
            return acc;
          }, {});
          onSubmit({...values, dataSource: decimalDataSource});
        })
        .catch((info) => {
          console.log('Validate Failed:', info);
        });
  };

  // const inputDataSource = useCallback((newValue, index) => {
  //   const newData = [...dataSource];
  //   const maxHexValue = Math.pow(2, dataBits) - 1;
  //   // 检查输入的值是否小于2^(Data Bits)位的十六进制数字
  //   if (parseInt(newValue, 16) > maxHexValue) {
  //     // 如果超出最大值，设置为最大可能的值
  //     newData[index].value = maxHexValue > 9 ? `0x${maxHexValue.toString(16).toUpperCase()}` : String(maxHexValue);
  //   } else {
  //     // 未超出最大值，直接更新为新输入的值，保留十六进制格式
  //     newData[index].value = parseInt(newValue, 16) > 9 ? `0x${newValue}` : newValue;
  //   }
  //   setDataSource(newData);
  //   console.log('change', newData)
  // }, [dataBits, dataSource])

  const inputDataSource = useCallback((newValue, index) => {
    const newData = [...dataSource];
    const maxBinaryValue = Math.pow(2, dataBits) - 1;

    // 如果输入为空，设置为默认值 "0"
    if (newValue === "") {
      newData[index].value = "0".padStart(dataBits, '0');
    } else {
      // 检查输入的值是否小于 2^dataBits
      if (parseInt(newValue, 2) > maxBinaryValue) {
        // 如果超出最大值，设置为最大可能的值
        newData[index].value = maxBinaryValue.toString(2).padStart(dataBits, '0');
      } else {
        // 未超出最大值，直接更新为新输入的值，保留二进制格式
        newData[index].value = parseInt(newValue, 2).toString(2).padStart(dataBits, '0');
      }
    }

    setDataSource(newData);
    console.log('change', newData);
  }, [dataBits, dataSource]);


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
            <InputNumber disabled min={1} max={32} onChange={value => setDataBits(value)}/>
          </Form.Item>
          <Form.Item
              name="addressBits" label="Address Bits"
              rules={[{required: true, message: '请输入地址位数!'}]}
          >
            <InputNumber min={1} max={32} onChange={value => setAddressBits(value)}/>
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
                        inputDataSource(e.target.value, index)
                      }}
                  />
              )}
          />
        </Table>
      </Modal>
  );
};
