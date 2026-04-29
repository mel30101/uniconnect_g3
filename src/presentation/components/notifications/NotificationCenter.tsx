import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Bell, User, CheckCircle, AlertTriangle, XCircle, Trash2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useNotificationContext } from '../../context/NotificationContext';
import { UCaldasTheme } from '@/app/constants/Colors';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside (Web only logic)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.type === 'join_request' && notification.data?.groupId) {
      router.push(`/group/${notification.data.groupId}/admin` as any);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'join_request': return <User size={18} color="#0056b3" />;
      case 'new_member': return <CheckCircle size={18} color="#28a745" />;
      case 'admin_transfer': return <AlertTriangle size={18} color={UCaldasTheme.dorado} />;
      case 'request_rejected':
      case 'admin_transfer_rejected': return <XCircle size={18} color="#dc3545" />;
      default: return <Bell size={18} color="#666" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Bell Icon & Badge */}
      <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)} 
        activeOpacity={0.7}
        style={styles.bellButton}
      >
        <Bell size={24} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 50,
              right: 0,
              width: 360,
              backgroundColor: '#fff',
              borderRadius: 12,
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
              zIndex: 9999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e0e0e0',
            }}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notificaciones</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.headerAction}>Marcar todo como leído</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearAll}>
                  <Trash2 size={16} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>

            {/* List */}
            <ScrollView style={{ maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Bell size={40} color="#ccc" style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyText}>No tienes notificaciones pendientes</Text>
                </View>
              ) : (
                notifications.map((notif) => (
                  <Pressable
                    key={notif.id}
                    onPress={() => handleNotificationClick(notif)}
                    style={({ hovered }) => [
                      styles.notifItem,
                      !notif.read && styles.unreadItem,
                      hovered && styles.hoveredItem
                    ]}
                  >
                    <View style={styles.itemIconContainer}>
                      {getIcon(notif.type)}
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemMessage, !notif.read && styles.unreadMessage]}>
                        {notif.message}
                      </Text>
                      <Text style={styles.itemTime}>
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: es })}
                      </Text>
                    </View>

                    {!notif.read && <View style={styles.unreadDot} />}
                  </Pressable>
                ))
              )}
            </ScrollView>

            {/* Footer / View All (Optional) */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.footerText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </motion.div>
        )}
      </AnimatePresence>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 15,
  },
  bellButton: {
    padding: 5,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: UCaldasTheme.azulOscuro,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerAction: {
    fontSize: 12,
    color: UCaldasTheme.azulOscuro,
    fontWeight: '600',
  },
  notifItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: '#f0f7ff',
  },
  hoveredItem: {
    backgroundColor: '#f5f5f5',
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemMessage: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500',
  },
  itemTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginLeft: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  }
});

export default NotificationCenter;
