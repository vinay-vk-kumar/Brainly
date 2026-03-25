import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type NotificationProps = {
  message: string;
  onClose: () => void;
};

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex flex-col gap-2 w-80"
    >
      <div className="h-1 bg-white w-full rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 3, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="text-white">
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
};

type NotificationContainerProps = {
  notifications: { id: number; message: string }[];
  removeNotification: (id: number) => void;
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  removeNotification,
}) => {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            message={notif.message}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
