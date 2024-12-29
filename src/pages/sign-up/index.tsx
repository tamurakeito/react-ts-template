import Text, { textSizes } from "ui/atoms/text";
import Center from "ui/atoms/center";
import classes from "./styles.module.scss";
import Input from "ui/atoms/input";
import Button from "ui/atoms/button";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToast, toastTypes } from "components/toast";
import {
  checkIsSignUpResponse,
  PostSignUp,
  postSignUpErrors,
} from "data/api/postSignup";
import { useAuthContext } from "providers/auth-provider";
import { checkIsErrorResponse } from "data/utils/typeGuards";
import { handleUnexpectedError } from "data/utils/handleErrors";
import Spinner from "ui/atoms/spinner";

const SignUp = () => {
  const idRef = useRef<HTMLInputElement | null>(null);
  const passRef = useRef<HTMLInputElement | null>(null);
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const { user, signIn, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  const validation = (user: string, password: string) => {
    if (!user.trim()) {
      setToast("ユーザーIDを入力してください。", toastTypes.error);
      return false;
    }
    if (!password.trim()) {
      setToast("パスワードを入力してください。", toastTypes.error);
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    await setIsLoading(true);

    if (!validation(id, pass)) {
      setIsLoading(false);
      return;
    }

    const result = await PostSignUp(id, pass);

    if (checkIsSignUpResponse(result)) {
      signIn(result.id, result.user_id, result.name, result.token);
      setId("");
      setPass("");
      setToast("アカウントが登録されました", toastTypes.success);
      navigate("/");
    } else if (checkIsErrorResponse(result)) {
      switch (result.error) {
        case postSignUpErrors.badRequest:
          setToast(
            "idまたはパスワードの形式が正しくありません",
            toastTypes.error
          );
          break;
        case postSignUpErrors.conflict:
          setToast(
            "既に登録されているIDのため使用できません",
            toastTypes.error
          );
          break;
        case postSignUpErrors.internalServerError:
          setToast(
            "サーバで問題が発生しました. 時間を置いて再度お試しください.",
            toastTypes.error
          );
          break;
        default:
          handleUnexpectedError();
      }
    } else {
      handleUnexpectedError();
    }
    setIsLoading(false);
    return;
  };

  return (
    <Center className={classes.sign_up}>
      <div className={classes.container}>
        <Text size={textSizes.h2}>新規アカウント登録</Text>
      </div>
      <div className={classes.container}>
        <Input
          ref={idRef}
          value={id}
          placeholder={"id"}
          onChange={(event) => setId(event.target.value)}
          onKeyDown={(event) => {
            event.key === "Enter" && passRef.current?.focus();
          }}
        />
      </div>
      <div className={classes.container}>
        <input
          ref={passRef}
          type={"password"}
          value={pass}
          placeholder={"password"}
          onChange={(event) => setPass(event.target.value)}
          onKeyDown={(event) => {
            event.key === "Enter" && handleSignUp();
          }}
        />
      </div>
      <Button
        className={classes.button}
        onClick={handleSignUp}
        disabled={isLoading}
      >
        {!isLoading ? "アカウント登録" : <Spinner size={16} />}
      </Button>
    </Center>
  );
};

export default SignUp;