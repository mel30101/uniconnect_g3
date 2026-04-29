import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { AppNotification } from '../../../domain/entities/AppNotification';
import { useNotificationContext } from '../../context/NotificationContext';
import { respondToAdminTransfer } from '../../../di/container';
import { useAuthStore } from '../../store/useAuthStore';
import { UCaldasTheme } from '@/app/constants/Colors';

interface ToastProps {
  notification: AppNotification;
}

const NotificationToast: React.FC<ToastProps> = ({ notification }) => {
  const router = useRouter();
  const { removeNotification } = useNotificationContext();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, removeNotification]);

  const handleAction = () => {
    if (notification.type === 'join_request' && notification.data.groupId) {
      router.push(`/group/${notification.data.groupId}/admin` as any);
    }
    removeNotification(notification.id);
  };

  const handleAdminTransfer = async (action: 'accept' | 'reject') => {
    if (!user?.uid || !notification.data.groupId) return;
    try {
      await respondToAdminTransfer.execute(notification.data.groupId, user.uid, action);
      removeNotification(notification.id);
    } catch (error) {
      console.error("Error responding to admin transfer:", error);
    }
  };

  const config = {
    join_request: {
      borderColor: '#0056b3',
      icon: <User color="#0056b3" size={22} />,
      title: 'Solicitud de Ingreso',
    },
    new_member: {
      borderColor: '#28a745',
      icon: <CheckCircle color="#28a745" size={22} />,
      title: 'Nuevo Miembro',
    },
    admin_transfer: {
      borderColor: UCaldasTheme.dorado,
      icon: <AlertTriangle color={UCaldasTheme.dorado} size={22} />,
      title: 'Transferencia de Administración',
    },
    request_rejected: {
      borderColor: '#dc3545',
      icon: <XCircle color="#dc3545" size={22} />,
      title: 'Solicitud Rechazada',
    },
    admin_transfer_rejected: {
      borderColor: '#dc3545',
      icon: <XCircle color="#dc3545" size={22} />,
      title: 'Transferencia Rechazada',
    }
  };

  const typeConfig = config[notification.type as keyof typeof config] || config.join_request;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      style={{
        width: 380,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 12,
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        borderLeft: `8px solid ${typeConfig.borderColor}`,
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ marginRight: 12, marginTop: 2 }}>{typeConfig.icon}</View>
        
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 }}>
            {typeConfig.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#4a4a4a', lineHeight: 20 }}>
            {notification.message}
          </Text>
          
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
            {notification.type === 'join_request' && (
              <TouchableOpacity
                onPress={handleAction}
                style={{
                  backgroundColor: UCaldasTheme.azulOscuro,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Ver solicitud</Text>
              </TouchableOpacity>
            )}
            
            {notification.type === 'admin_transfer' && (
              <>
                <TouchableOpacity
                  onPress={() => handleAdminTransfer('accept')}
                  style={{ backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleAdminTransfer('reject')}
                  style={{ backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Rechazar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={() => removeNotification(notification.id)} style={{ padding: 4 }}>
          <X color="#999" size={20} />
        </TouchableOpacity>
      </div>

      {/* Barra de progreso animada */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        style={{ height: 4, backgroundColor: typeConfig.borderColor, opacity: 0.3 }}
      />
    </motion.div>
  );
};

export const NotificationStack: React.FC = () => {
  const { notifications } = useNotificationContext();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationToast key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
};
