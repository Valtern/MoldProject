import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Thermometer, Droplets, Wifi, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { db } from '@/lib/firebase';
import { collection, updateDoc, deleteDoc, doc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

function getStatusConfig(t: (key: string) => string): Record<string, { dotClass: string, textClass: string, bgClass: string, label: string }> {
  return {
    safe: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 border-emerald-500/20', label: t('dashboard.status.safe') },
    warning: { dotClass: 'bg-amber-500', textClass: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/20', label: t('dashboard.status.warning') },
    critical: { dotClass: 'bg-red-500', textClass: 'text-red-500', bgClass: 'bg-red-500/10 border-red-500/20', label: t('dashboard.status.critical') },
    waiting: { dotClass: 'bg-zinc-400', textClass: 'text-zinc-600 dark:text-zinc-400', bgClass: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700', label: t('dashboard.status.waiting') },
  };
}

interface RoomsPageProps {
  availableRooms: any[];
  onRoomSelect: (roomId: string) => void;
}

function RoomCard({ room, onRoomSelect, openEdit, handleDelete, onStatusUpdate }: any) {
  const { t } = useTranslation();
  const [latestLog, setLatestLog] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('waiting');
  const statusConfig = getStatusConfig(t);

  useEffect(() => {
    if (!room.deviceID) {
      setCurrentStatus('waiting');
      if (onStatusUpdate) onStatusUpdate(room.id, 'waiting');
      return;
    }

    const q = query(
      collection(db, 'SensorLogs'),
      where('deviceID', '==', room.deviceID),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const logData = snapshot.docs[0].data();
        setLatestLog(logData);

        const hum = Number(logData.humidity ?? 0);
        const safeLimit = Number(room.safeLimit ?? 60);
        const criticalLimit = Number(room.criticalLimit ?? 85);

        let status = 'safe';
        if (hum >= criticalLimit) {
          status = 'critical';
        } else if (hum >= safeLimit) {
          status = 'warning';
        }

        setCurrentStatus(status);
        if (onStatusUpdate) onStatusUpdate(room.id, status);
      } else {
        setLatestLog(null);
        setCurrentStatus('waiting');
        if (onStatusUpdate) onStatusUpdate(room.id, 'waiting');
      }
    }, (error: any) => {
      if (error?.code === 'permission-denied') {
        console.warn('[RoomCard] Listener permission denied for', room.name, ':', error.message);
      } else {
        console.error('[RoomCard] Listener error for', room.name, ':', error);
      }
    });

    return () => unsubscribe();
  }, [room.deviceID, room.safeLimit, room.criticalLimit]);

  const config = statusConfig[currentStatus] || statusConfig['waiting'];

  return (
    <div
      onClick={() => onRoomSelect(room.id)}
      className="
        group
        bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-4 text-left cursor-pointer
        transition-all duration-150 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white/80 dark:hover:bg-zinc-800/60
        focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50
        relative
      "
    >
      {/* Room Name & Actions */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{room.name}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => openEdit(e, room)}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => handleDelete(e, room.id)}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:hidden" />
      </div>

      {/* Temperature & Humidity */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="text-zinc-500 dark:text-zinc-400">{latestLog?.temperature ?? '--'}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="text-zinc-500 dark:text-zinc-400">{latestLog?.wifiSignal ? `${latestLog.wifiSignal} dBm` : '--'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Droplets className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span className="text-zinc-500 dark:text-zinc-400">{latestLog?.humidity ?? '--'}% {t('rooms.humidity')}</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bgClass} ${config.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
          {config.label}
        </span>
      </div>
    </div>
  );
}

export function RoomsPage({ availableRooms, onRoomSelect }: RoomsPageProps) {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [roomStatuses, setRoomStatuses] = useState<Record<string, string>>({});

  // Use ref to accumulate status updates without triggering re-renders
  const statusRef = useRef<Record<string, string>>({});

  const handleStatusUpdate = useCallback((roomId: string, status: string) => {
    statusRef.current[roomId] = status;
  }, []);

  // Periodically sync ref -> state for the summary counters
  useEffect(() => {
    const interval = setInterval(() => {
      setRoomStatuses(prev => {
        const current = { ...statusRef.current };
        // Only update state if something actually changed
        const changed = Object.keys(current).some(k => prev[k] !== current[k]) ||
                        Object.keys(current).length !== Object.keys(prev).length;
        return changed ? current : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    deviceID: ''
  });



  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom?.id) return;
    try {
      await updateDoc(doc(db, 'Devices', editingRoom.id), {
        name: formData.name,
        deviceID: formData.deviceID
      });
      setIsEditOpen(false);
      setEditingRoom(null);
    } catch (err) {
      console.error("Failed to update room", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm(t('rooms.edit.deleteConfirm'))) {
      await deleteDoc(doc(db, 'Devices', id));
    }
  };

  const openEdit = (e: React.MouseEvent, room: any) => {
    e.stopPropagation();
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      deviceID: room.deviceID || ''
    });
    setIsEditOpen(true);
  };



  // Calculate dynamic stats directly from the active cards reporting in
  const statuses = Object.values(roomStatuses);
  const safeCount = statuses.filter(s => s === 'safe').length;
  const warningCount = statuses.filter(s => s === 'warning').length;
  const criticalCount = statuses.filter(s => s === 'critical').length;

  return (
    <div className="w-full max-w-[1920px] mx-auto transition-all">
      <div className="px-3 py-3 md:p-6 lg:p-8 2xl:p-10">
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t('rooms.title')}</h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t('rooms.subtitle')}
        </p>
      </div>

      {/* Edit Room Modal */}
      <Dialog.Root open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if(!open) setEditingRoom(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-2rem)] max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 z-50 focus:outline-none">
            <div className="flex justify-between items-center mb-5">
              <Dialog.Title className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{t('rooms.edit.title')}</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">{t('rooms.edit.roomName')}</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">{t('rooms.edit.deviceId')}</label>
                <input required value={formData.deviceID} onChange={e => setFormData({...formData, deviceID: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500" />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors">
                  {t('rooms.edit.update')}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {availableRooms.length === 0 ? (
        <div className="text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-lg border-dashed">
          <p className="text-zinc-500 dark:text-zinc-400">{t('rooms.noDevices', { deviceControls: t('rooms.deviceControls') })}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 2xl:gap-6 transition-all">
          {availableRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onRoomSelect={onRoomSelect}
              openEdit={openEdit}
              handleDelete={handleDelete}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 md:gap-4 max-w-full">
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-2 md:p-3 text-center">
          <p className="text-xl md:text-2xl font-semibold text-emerald-500">{safeCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t('rooms.summary.online')}</p>
        </div>
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-2 md:p-3 text-center">
          <p className="text-xl md:text-2xl font-semibold text-amber-500">{warningCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t('rooms.summary.warning')}</p>
        </div>
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-2 md:p-3 text-center">
          <p className="text-xl md:text-2xl font-semibold text-red-500">{criticalCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t('rooms.summary.offline')}</p>
        </div>
      </div>
      </div>
    </div>
  );
}
