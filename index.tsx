import React, { useEffect } from "react";
import { gapi } from "gapi-script";
import { Button } from "antd";
import GoogleLogo from "../../../assets/google";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
interface GoogleLoginButtonProps {
  onGoogleLoginSuccess: (credentialResponse: { credential: string }) => Promise<void>;
  loading: boolean;
  width?: any;
  text?: string;
}
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onGoogleLoginSuccess, loading, width, text }) => {
  useEffect(() => {
    const initClient = () => {
      gapi.auth2.init({
        client_id: clientId,
        scope: "profile email",
      });
    };
    gapi.load("auth2", initClient);
  }, []);

  const handleLogin = async () => {
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      const user = await auth2.signIn();
      const id_token = user.getAuthResponse().id_token;

      if(id_token) {
        await onGoogleLoginSuccess({ credential: id_token });
      }
    } catch (error) {
      console.log("Error signing in", error);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      style={{...customButtonStyle, width: width}}
      icon={<GoogleLogo style={{marginRight: -5}}/>}
      loading={loading}
    >
      {text}
    </Button>
  );
};

const customButtonStyle = {
  color: "black",
  fontSize: "16px",
};

export default GoogleLoginButton;
