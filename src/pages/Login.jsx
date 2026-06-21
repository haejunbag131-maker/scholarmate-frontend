import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import FindIdModal from "../features/auth/components/FindIdModal";
import ResetPwByCodeModal from "../features/auth/components/ResetPwByCodeModal";
import { loginSucceeded } from "../features/auth/authSlice";
import PageShell from "../shared/components/PageShell";
import PageTitle from "../shared/components/PageTitle";

import logo from "../assets/img/로고.png";

// 로그인 페이지
export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showFindId, setShowFindId] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);

  const [idEmail, setIdEmail] = useState("");
  const [idCode, setIdCode] = useState("");
  const [idSubmitting, setIdSubmitting] = useState(false);
  const [idInfo, setIdInfo] = useState("");
  const [idErr, setIdErr] = useState("");
  const [idCodeSent, setIdCodeSent] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [revealedUsernames, setRevealedUsernames] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const from = location.state?.from || location.state?.fromProtected || "/";

  const inputCls =
    "w-full h-10 sm:h-11 border border-gray-300 rounded-md px-3 sm:px-4 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] bg-white placeholder-gray-400";

  useEffect(() => {
    const saved = localStorage.getItem("autoLogin") === "true";
    setAutoLogin(saved);

    const token = localStorage.getItem("token");
    if (saved && token) {
      axios
        .get("/auth/users/me/")
        .then(() => {
          navigate(from, { replace: true });
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        });
    }
  }, [navigate, from]);

  useEffect(() => {
    const onBeforeUnload = () => {
      const saved = localStorage.getItem("autoLogin") === "true";
      if (!saved) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/jwt/create/", {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem("token", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("autoLogin", String(autoLogin));
      axios.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      dispatch(loginSucceeded());
      navigate(from, { replace: true });
    } catch {
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const sendIdCode = async () => {
    setIdErr("");
    setIdInfo("");
    setRevealedUsernames([]);
    if (!idEmail) {
      setIdErr("이메일을 입력해 주세요.");
      return;
    }
    setIdSubmitting(true);
    try {
      await axios.post("/auth/email/send-code/", { email: idEmail });
      setIdCodeSent(true);
      setIdInfo("인증번호를 전송했습니다. 메일함(스팸함 포함)을 확인해 주세요.");
    } catch {
      setIdErr("인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIdSubmitting(false);
    }
  };

  const verifyIdCode = async () => {
    setIdErr("");
    setIdInfo("");
    if (!idEmail || !idCode) {
      setIdErr("이메일과 인증번호를 입력해 주세요.");
      return;
    }
    setIdSubmitting(true);
    try {
      await axios.post("/auth/email/verify-code/", { email: idEmail, code: idCode });
      setIdVerified(true);
      setIdInfo("이메일 인증이 완료되었습니다. 아이디 보기를 눌러 주세요.");
    } catch {
      setIdErr("인증번호가 올바르지 않거나 만료되었습니다.");
    } finally {
      setIdSubmitting(false);
    }
  };

  const revealUsernames = async () => {
    setIdErr("");
    setIdInfo("");
    setRevealedUsernames([]);
    if (!idVerified) {
      setIdErr("이메일 인증이 필요합니다.");
      return;
    }
    setIdSubmitting(true);
    try {
      const { data } = await axios.post("/auth/account/reveal-username/", { email: idEmail });
      setRevealedUsernames(Array.isArray(data.usernames) ? data.usernames : []);
      if (!data.usernames || data.usernames.length === 0) {
        setIdInfo("해당 이메일로 가입된 아이디가 없습니다.");
      }
    } catch {
      setIdErr("아이디 조회 중 오류가 발생했습니다.");
    } finally {
      setIdSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col bg-white text-gray-900">
      <PageShell width="narrow" className="flex justify-center">
        <div className="w-full max-w-[520px] rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-7 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8">
            <div className="w-full flex flex-col items-center mb-6 sm:mb-8">
              <img src={logo} alt="로고" className="h-20 object-contain sm:h-32 md:h-40" />
            </div>

            <PageTitle>로그인</PageTitle>

            {location.state?.from && (
              <p className="text-xs sm:text-sm text-rose-600 mb-2">로그인 후 이용 가능합니다.</p>
            )}
            {errorMessage && (
              <p className="text-xs sm:text-sm text-rose-600 mb-2 text-center">{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="username"
                placeholder="id"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
                className={inputCls}
              />
              <input
                type="password"
                name="password"
                placeholder="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className={inputCls}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-11 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-sm sm:text-base font-semibold transition-colors rounded-md"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>

              <div className="space-y-3 pt-2 text-xs sm:text-sm">
                <div className="flex justify-start">
                  <label
                    htmlFor="autoLogin"
                    className="inline-flex cursor-pointer select-none items-center gap-2 whitespace-nowrap font-bold text-gray-900"
                  >
                    <input
                      id="autoLogin"
                      type="checkbox"
                      checked={autoLogin}
                      onChange={(e) => {
                        setAutoLogin(e.target.checked);
                        localStorage.setItem("autoLogin", String(e.target.checked));
                      }}
                      className="peer sr-only"
                    />
                    <span
                      className="relative inline-block w-4 h-4 border border-gray-400 bg-white
                                 peer-focus:ring-2 peer-focus:ring-black
                                 peer-checked:border-black
                                 after:content-[''] after:absolute after:w-[6px] after:h-[10px]
                                 after:border-r-2 after:border-b-2 after:border-black
                                 after:left-[5px] after:top-[1px] after:rotate-45
                                 after:opacity-0 peer-checked:after:opacity-100"
                      aria-hidden="true"
                    />
                    자동 로그인
                  </label>
                </div>

                <div className="flex items-center justify-center gap-3 whitespace-nowrap text-gray-700 sm:gap-4">
                  <button
                    type="button"
                    className="hover:text-gray-600"
                    onClick={() => {
                      setIdEmail("");
                      setIdCode("");
                      setIdSubmitting(false);
                      setIdInfo("");
                      setIdErr("");
                      setIdCodeSent(false);
                      setIdVerified(false);
                      setRevealedUsernames([]);
                      setShowFindId(true);
                    }}
                  >
                    아이디 찾기
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    className="hover:text-gray-600"
                    onClick={() => {
                      setShowFindPw(true);
                    }}
                  >
                    비밀번호 찾기
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    className="hover:text-gray-600"
                    onClick={() => navigate("/register")}
                  >
                    회원가입
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </PageShell>

      <footer className="py-6 text-xs text-gray-900">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
            <span>© 2025</span>
            <a className="text-gray-900 hover:text-black" href="#!">사용자약관</a>
            <a className="text-gray-900 hover:text-black" href="#!">개인정보 취급방침</a>
            <a className="text-gray-900 hover:text-black" href="#!">커뮤니티정책</a>
            <a className="text-gray-900 hover:text-black" href="#!">쿠키정책</a>
            <a className="text-gray-900 hover:text-black" href="#!">저작권침해</a>
            <a className="text-gray-900 hover:text-black" href="#!">피드백 보내기</a>
          </div>
        </div>
      </footer>
      
      {showFindId && (
        <FindIdModal
          onClose={() => setShowFindId(false)}
          idEmail={idEmail} setIdEmail={setIdEmail}
          idCode={idCode} setIdCode={setIdCode}
          idSubmitting={idSubmitting}
          idInfo={idInfo} idErr={idErr}
          idCodeSent={idCodeSent} idVerified={idVerified}
          sendIdCode={sendIdCode} verifyIdCode={verifyIdCode} revealUsernames={revealUsernames}
          revealedUsernames={revealedUsernames}
          inputCls={inputCls}
        />
      )}
      {showFindPw && <ResetPwByCodeModal onClose={() => setShowFindPw(false)} inputCls={inputCls} />}
    </div>
  );
}
