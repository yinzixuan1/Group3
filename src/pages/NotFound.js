import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const nav = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="PageNotFound"
      extra={
        <Button type="primary" onClick={() => nav("/home")}>
          back to homepage
        </Button>
      }
    />
  );
};

export default NotFound;
