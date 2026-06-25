import Modal from "../../../shared/components/Modal";

export default function ModalShell({ title, onClose, children }) {
  return (
    <Modal
      title={title}
      titleTag="h3"
      onClose={onClose}
      maxWidth="520px"
      className="auth-modal"
      bodyClassName="auth-modal-body"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-md border border-gray-300 px-3 text-xs hover:bg-gray-50 sm:h-10 sm:px-4 sm:text-sm"
        >
          닫기
        </button>
      }
    >
      {children}
    </Modal>
  );
}
