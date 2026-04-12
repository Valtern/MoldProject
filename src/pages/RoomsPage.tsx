import { useState } from 'react';
import { Thermometer, Droplets, ChevronRight, Plus, Pencil, Trash2, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const statusConfig: Record<string, { dotClass: string, textClass: string, label: string }> = {
  safe: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500', label: 'Safe' },
  warning: { dotClass: 'bg-amber-500', textClass: 'text-amber-500', label: 'Warning' },
  critical: { dotClass: 'bg-red-500', textClass: 'text-red-500', label: 'Critical Risk' },
};

interface RoomsPageProps {
  availableRooms: any[];
  onRoomSelect: (roomId: string) => void;
}

export function RoomsPage({ availableRooms, onRoomSelect }: RoomsPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    deviceID: '',
    safeLimit: 60,
    criticalLimit: 85
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'Devices'), {
        name: formData.name,
        deviceID: formData.deviceID,
        safeLimit: Number(formData.safeLimit),
        criticalLimit: Number(formData.criticalLimit),
        appliances: [
          { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'auto' }, 
          { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' }
        ]
      });
      setIsAddOpen(false);
      setFormData({ name: '', deviceID: '', safeLimit: 60, criticalLimit: 85 });
    } catch (err) {
      console.error("Failed to add room", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom?.id) return;
    try {
      await updateDoc(doc(db, 'Devices', editingRoom.id), {
        name: formData.name,
        deviceID: formData.deviceID,
        safeLimit: Number(formData.safeLimit),
        criticalLimit: Number(formData.criticalLimit)
      });
      setIsEditOpen(false);
      setEditingRoom(null);
    } catch (err) {
      console.error("Failed to update room", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this room?')) {
      await deleteDoc(doc(db, 'Devices', id));
    }
  };

  const openEdit = (e: React.MouseEvent, room: any) => {
    e.stopPropagation();
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      deviceID: room.deviceID || '',
      safeLimit: room.safeLimit ?? 60,
      criticalLimit: room.criticalLimit ?? 85
    });
    setIsEditOpen(true);
  };

  const resetForm = () => setFormData({ name: '', deviceID: '', safeLimit: 60, criticalLimit: 85 });

  // Calculate dynamic stats
  const safeCount = availableRooms.filter(r => (r.status || 'safe') === 'safe').length;
  const warningCount = availableRooms.filter(r => r.status === 'warning').length;
  const criticalCount = availableRooms.filter(r => r.status === 'critical').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Rooms</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Monitor environmental conditions across all rooms
          </p>
        </div>

        {/* Add Room Trigger */}
        <Dialog.Root open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if(!open) resetForm(); }}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 z-50 focus:outline-none">
              <div className="flex justify-between items-center mb-5">
                <Dialog.Title className="text-lg font-medium text-zinc-100">Add New Room</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-zinc-500 hover:text-zinc-300">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Room Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500" placeholder="e.g. Living Room" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Device ID</label>
                  <input required value={formData.deviceID} onChange={e => setFormData({...formData, deviceID: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500" placeholder="e.g. ESP32_01" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Safe Humidity Limit (%)</label>
                    <input type="number" required value={formData.safeLimit} onChange={e => setFormData({...formData, safeLimit: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Critical Limit (%)</label>
                    <input type="number" required value={formData.criticalLimit} onChange={e => setFormData({...formData, criticalLimit: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors">
                    Save Room
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Edit Room Modal (Shared state) */}
        <Dialog.Root open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if(!open) setEditingRoom(null); }}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 z-50 focus:outline-none">
              <div className="flex justify-between items-center mb-5">
                <Dialog.Title className="text-lg font-medium text-zinc-100">Edit Room</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-zinc-500 hover:text-zinc-300">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Room Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Device ID</label>
                  <input required value={formData.deviceID} onChange={e => setFormData({...formData, deviceID: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Safe Humidity Limit (%)</label>
                    <input type="number" required value={formData.safeLimit} onChange={e => setFormData({...formData, safeLimit: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Critical Limit (%)</label>
                    <input type="number" required value={formData.criticalLimit} onChange={e => setFormData({...formData, criticalLimit: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors">
                    Update Room
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

      </div>

      {availableRooms.length === 0 ? (
        <div className="text-center py-12 border border-zinc-800 rounded-lg border-dashed">
          <p className="text-zinc-500">No rooms configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableRooms.map((room) => {
            const config = statusConfig[room.status || 'safe'];

            return (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className="
                  group
                  bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left cursor-pointer
                  transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-800/50
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50
                  relative
                "
              >
                {/* Room Name & Actions */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-zinc-100">{room.name}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => openEdit(e, room)}
                      className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, room.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:hidden" />
                </div>

                {/* Temperature & Humidity (using local defaults if unpopulated) */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Thermometer className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-400">{room.temperature ?? '--'}°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Droplets className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-400">{room.humidity ?? '--'}% humidity</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                  <span className={`text-xs font-medium ${config.textClass}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-emerald-500">{safeCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Safe</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-amber-500">{warningCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Warning</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-red-500">{criticalCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Critical</p>
        </div>
      </div>
    </div>
  );
}
