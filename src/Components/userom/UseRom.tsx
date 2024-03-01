import React from 'react';
import Rom from './Rom.tsx';

class UseRom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.addressInput = React.createRef();
    this.dataInput = React.createRef();
    this.romComponent = React.createRef(); // 创建引用
  }
  
  handleReadData = () => {
    const address = parseInt(this.addressInput.current.value);
    const data = this.romComponent.current.readData(address); // 使用引用来调用组件方法
    console.log(`Read data at address ${address}: ${data}`);
  };
  
  handleWriteData = () => {
    const address = parseInt(this.addressInput.current.value);
    const data = parseInt(this.dataInput.current.value);
    this.romComponent.current.writeData(address, data); // 使用引用来调用组件方法
    console.log(`Wrote data ${data} at address ${address}`);
  };
  
  render() {
    return (
      <div>
        <Rom
          ref={this.romComponent}
          romData={this.state.romData}
          onWriteData={this.handleWriteData}
        />
      </div>
    );
  }
}

export default UseRom;