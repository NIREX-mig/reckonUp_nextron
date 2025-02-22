import { useState } from "react";

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalProps, setModalProps] = useState({});

  const openModal = (type: "Invoice-Details" | "Payment", props = {}) => {
    setModalType(type);
    setModalProps(props);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
    setModalProps({});
  };

  return {
    isOpen,
    modalType,
    modalProps,
    openModal,
    closeModal,
  };
};

export default useModal;
