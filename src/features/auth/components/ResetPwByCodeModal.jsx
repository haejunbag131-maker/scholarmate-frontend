import { useEffect, useState } from "react";
import axios from "../../../api/axios";
import ModalShell from "./ModalShell";

const primaryButtonClassName =
  "h-9 sm:h-10 px-3 sm:px-4 rounded-md bg-gray-900 text-white text-xs sm:text-sm font-semibold hover:bg-black hover:text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2";

export default function ResetPwByCodeModal({ onClose, inputCls }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setInterval(() => setCooldown((currentCooldown) => Math.max(0, currentCooldown - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendCode = async () => {
    setErr("");
    setInfo("");
    if (!username) return setErr("아이디를 입력해 주세요.");
    if (!email) return setErr("이메일을 입력해 주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("올바른 이메일 형식이 아닙니다.");
    if (cooldown) return undefined;

    setSubmitting(true);
    try {
      await axios.post("/auth/password/send-code/", { username, email });
      setCodeSent(true);
      setInfo("인증 코드를 전송했습니다. 메일함(스팸함 포함)을 확인해 주세요.");
      setCooldown(60);
    } catch (error) {
      const message = error?.response?.data?.detail || "코드 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      setErr(String(message));
    } finally {
      setSubmitting(false);
    }
    return undefined;
  };

  const verifyCode = async () => {
    setErr("");
    setInfo("");
    if (!username || !email || !code) return setErr("아이디, 이메일, 인증코드를 모두 입력해 주세요.");
    setSubmitting(true);
    try {
      const { data } = await axios.post("/auth/password/verify-code/", { username, email, code });
      setResetToken(data.reset_token);
      setVerified(true);
      setInfo("인증이 완료되었습니다. 새 비밀번호를 설정해 주세요.");
    } catch (error) {
      const message = error?.response?.data?.detail || "인증에 실패했습니다. 코드를 확인해 주세요.";
      setErr(String(message));
    } finally {
      setSubmitting(false);
    }
    return undefined;
  };

  const resetPassword = async () => {
    setErr("");
    setInfo("");
    if (!verified || !resetToken) return setErr("인증이 필요합니다.");
    if (!pw1 || !pw2) return setErr("새 비밀번호를 입력해 주세요.");
    if (pw1.length < 8) return setErr("비밀번호는 8자 이상이어야 합니다.");
    if (pw1 !== pw2) return setErr("비밀번호가 일치하지 않습니다.");

    setSubmitting(true);
    try {
      await axios.post("/auth/password/reset-with-code/", {
        username,
        email,
        reset_token: resetToken,
        new_password: pw1,
        re_new_password: pw2,
      });
      setInfo("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.");
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      const message =
        error?.response?.data?.new_password?.[0] ||
        error?.response?.data?.detail ||
        "비밀번호 변경에 실패했습니다. 다시 시도해 주세요.";
      setErr(String(message));
    } finally {
      setSubmitting(false);
    }
    return undefined;
  };

  return (
    <ModalShell title="비밀번호 재설정 (코드 인증)" onClose={onClose}>
      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
        아이디와 이메일로 인증 후, 바로 새 비밀번호를 설정해요.
      </p>
      <label className="block text-xs text-gray-600 mb-1">아이디</label>
      <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} className={inputCls} />
      <div className="mt-3">
        <label className="block text-xs text-gray-600 mb-1">이메일</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputCls} />
      </div>
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <button
          type="button"
          onClick={sendCode}
          disabled={submitting || cooldown > 0}
          className={primaryButtonClassName}
        >
          {submitting ? "전송 중..." : cooldown ? `재전송 ${cooldown}s` : "인증코드 보내기"}
        </button>
        {codeSent && <span className="text-xs text-emerald-600">전송됨</span>}
      </div>
      <div className="mt-4">
        <label className="block text-xs text-gray-600 mb-1">인증코드</label>
        <input type="text" value={code} onChange={(event) => setCode(event.target.value)} className={inputCls} />
        <button
          type="button"
          onClick={verifyCode}
          disabled={submitting}
          className={`mt-2 ${primaryButtonClassName}`}
        >
          {submitting ? "확인 중..." : "코드 확인"}
        </button>
        {verified && <span className="ml-2 text-xs text-emerald-600">인증 완료</span>}
      </div>
      <div className="mt-4">
        <label className="block text-xs text-gray-600 mb-1">새 비밀번호</label>
        <input
          type="password"
          value={pw1}
          onChange={(event) => setPw1(event.target.value)}
          className={inputCls}
          disabled={!verified}
        />
      </div>
      <div className="mt-3">
        <label className="block text-xs text-gray-600 mb-1">새 비밀번호 확인</label>
        <input
          type="password"
          value={pw2}
          onChange={(event) => setPw2(event.target.value)}
          className={inputCls}
          disabled={!verified}
        />
      </div>
      {info && <p className="text-xs text-emerald-600 mt-2">{info}</p>}
      {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={resetPassword}
          disabled={submitting || !verified}
          className={primaryButtonClassName}
        >
          {submitting ? "변경 중..." : "비밀번호 변경"}
        </button>
      </div>
    </ModalShell>
  );
}
