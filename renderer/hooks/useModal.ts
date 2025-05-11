import { useState } from 'react';

// Define modal type;
export type ModalType = 'Invoice-Details' | 'Payment';

// Modal state structure
interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
}
const useModal = () => {
  const [modal, setModal] = useState<ModalState>({
    type: null,
    isOpen: false,
  });

  const openModal = (type: ModalType) => {
    setModal({
      type,
      isOpen: true,
    });
  };

  const closeModal = () => {
    setModal({
      type: null,
      isOpen: false,
    });
  };

  return {
    modal,
    openModal,
    closeModal,
  };
};

export default useModal;
