import React from "react";

class Rom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      romData: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      readData: null,
      isExpanded: true,
      dataValue: ""
    };
    this.addressInput = React.createRef();
    this.dataInput = React.createRef();
  }

  readData = (address) => {
    const {romData} = this.state;
    return romData[address] || null;
  };

  writeData = (address, data) => {
    const {romData} = this.state;
    romData[address] = data;
    this.setState({romData});
  };

  handleReadData = () => {
    const address = parseInt(this.addressInput.current.value, 16);
    const data = this.readData(address);
    this.setState({readData: data, dataValue: data});
    console.log(`Read data at address 0x${address.toString(16)}: 0x${data.toString(16)}`);
  };

  handleWriteData = () => {
    const address = parseInt(this.addressInput.current.value, 16);
    const data = parseInt(this.state.dataValue, 16);
    this.writeData(address, data);
    console.log(`Wrote data 0x${data.toString(16)} at address 0x${address.toString(16)}`);
  };

  toggleExpand = () => {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded
    }));
  };

  render() {
    const {romData, readData, isExpanded, dataValue} = this.state;
    const rowCount = Math.ceil(romData.length / 4);

    return (
        <div>
          <h2>
            {/*<span onClick={this.toggleExpand} style={{ cursor: "pointer" }}>*/}
            {/*  {isExpanded ? "-" : "+"}*/}
            {/*</span>{" "}*/}
            ROM Storage
          </h2>
          {isExpanded && (
              <>
                <table style={{width: "30%", borderCollapse: "collapse", fontSize: "12px"}}>
                  <tbody>
                  {Array(rowCount)
                      .fill()
                      .map((_, rowIndex) => (
                          <tr key={rowIndex}>
                            {Array(4)
                                .fill()
                                .map((_, colIndex) => {
                                  const dataIndex = rowIndex * 4 + colIndex;
                                  if (dataIndex < romData.length) {
                                    return (
                                        <td
                                            key={colIndex}
                                            style={{border: "1px solid black", padding: "4px"}}
                                        >
                                          <div>Address: 0x{dataIndex.toString(16).padStart(2, "0")}</div>
                                          <div>Data: 0x{romData[dataIndex].toString(16).padStart(4, "0")}</div>
                                        </td>
                                    );
                                  } else {
                                    return <td key={colIndex}></td>;
                                  }
                                })}
                          </tr>
                      ))}
                  </tbody>
                </table>
                <div>
                  <label>Address: </label>
                  <input type="text" ref={this.addressInput}/>
                </div>
                <div>
                  <label>Data: </label>
                  <input
                      type="text"
                      value={dataValue}
                      ref={this.dataInput}
                      onChange={(e) => this.setState({dataValue: e.target.value})}
                  />
                </div>
                <button onClick={this.handleReadData}>Read Data</button>
                <button onClick={this.handleWriteData}>Write Data</button>
              </>
          )}
        </div>
    );
  }
}

export default Rom;