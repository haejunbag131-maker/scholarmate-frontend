import { useEffect, useRef } from "react";
import ModalShell from "./ModalShell";

const primaryButtonClassName =
  "h-9 sm:h-10 px-3 sm:px-4 rounded-md bg-gray-900 text-white text-xs sm:text-sm font-semibold hover:bg-black hover:text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2";

export default function FindIdModal({
  onClose,
  idEmail,
  setIdEmail,
  idCode,
  setIdCode,
  idSubmitting,
  idInfo,
  idErr,
  idCodeSent,
  idVerified,
  sendIdCode,
  verifyIdCode,
  revealUsernames,
  revealedUsernames,
  inputCls,
}) {
  const codeInputRef = useRef(null);

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  return (
    <ModalShell title="아이디 찾기" onClose={onClose}>
      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
        가입하신 이메일로 본인 인증 후 아이디를 확인할 수 있어요.
      </p>

      <label className="block text-xs text-gray-600 mb-1">이메일</label>
      <input
        type="email"
        placeholder="example@email.com"
        value={idEmail}
        onChange={(event) => setIdEmail(event.target.value)}
        className={inputCls}
      />

      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <button
          type="button"
          onClick={sendIdCode}
          disabled={idSubmitting}
          className={primaryButtonClassName}
        >
          {idSubmitting ? "전송 중..." : "인증코드 보내기"}
        </button>
        {idCodeSent && <span className="text-xs text-emerald-600">전송됨</span>}
      </div>

      <div className="mt-4">
        <label className="block text-xs text-gray-600 mb-1">인증코드</label>
        <input
          ref={codeInputRef}
          type="text"
          placeholder="6자리 코드"
          value={idCode}
          onChange={(event) => setIdCode(event.target.value)}
          className={inputCls}
        />
        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button
            type="button"
            onClick={verifyIdCode}
            disabled={idSubmitting}
            className={primaryButtonClassName}
          >
            {idSubmitting ? "확인 중..." : "코드 확인"}
          </button>
          {idVerified && <span className="ml-2 text-xs text-emerald-600">인증 완료</span>}
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={revealUsernames}
          disabled={idSubmitting || !idVerified}
          className={primaryButtonClassName}
        >
          {idSubmitting ? "조회 중..." : "아이디 보기"}
        </button>
      </div>

      {idInfo && <p className="text-xs text-emerald-600 mt-2">{idInfo}</p>}
      {idErr && <p className="text-xs text-rose-600 mt-2">{idErr}</p>}

      {revealedUsernames.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-md p-3 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">해당 이메일로 가입된 아이디:</p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-gray-900 space-y-1 max-h-40 sm:max-h-56 overflow-auto pr-1">
            {revealedUsernames.map((username, index) => (
              <li key={`${username}-${index}`} className="flex items-center justify-between">
                <span className="truncate">{username}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText?.(username)}
                  className="text-xs underline text-gray-500 hover:text-gray-700 shrink-0"
                >
                  복사
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ModalShell>
  );
}
