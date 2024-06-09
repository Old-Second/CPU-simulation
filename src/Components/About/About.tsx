import {FloatButton} from "antd";
import {GithubOutlined, MenuOutlined, QuestionCircleOutlined} from "@ant-design/icons";

const About = () => {
  return (
    <>
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{right: 50, bottom: 180}}
        icon={<MenuOutlined/>}
      >
        <FloatButton icon={<GithubOutlined/>} tooltip={<div>源码仓库</div>} target="_blank"
                     href="https://github.com/Old-Second/CPU-simulation"/>
        <FloatButton icon={<QuestionCircleOutlined/>} tooltip={<div>问题反馈</div>} target="_blank"
                     href="https://github.com/Old-Second/CPU-simulation/discussions"/>
      </FloatButton.Group>
    </>
  )
}

export default About;