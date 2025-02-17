import { Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const useToast = () => {
  const showToast = (message, status = "success") => {
    if (status === "success") {
      toast.success(message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    } else if (status === "error") {
      toast.error(message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  return { showToast };
};

export default useToast;
