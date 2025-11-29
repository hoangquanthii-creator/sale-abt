
import React, { useState } from 'react';
import { TeamMember } from '../types';
import { DEPARTMENTS, MEMBER_COLORS } from '../constants';
import { Users, Plus, Search, Trash2, Edit2, Phone, Briefcase, Building2, Save, X } from 'lucide-react';

interface TeamManagerProps {
  members: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ members, onUpdateMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  
  // Edit/Create State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<TeamMember>>({
      name: '',
      phone: '',
      role: '',
      department: DEPARTMENTS[0],
      color: MEMBER_COLORS[0]
  });

  const resetForm = () => {
      setFormData({
        name: '',
        phone: '',
        role: '',
        department: DEPARTMENTS[0],
        color: MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]
      });
      setIsEditing(false);
      setEditingId(null);
  };

  const handleEdit = (member: TeamMember) => {
      setFormData(member);
      setEditingId(member.id);
      setIsEditing(true);
  };

  const handleSave = () => {
      if (!formData.name) return;

      const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      if (editingId) {
          // Update
          const updatedMembers = members.map(m => m.id === editingId ? { ...m, ...formData, initials } as TeamMember : m);
          onUpdateMembers(updatedMembers);
      } else {
          // Create
          const newMember: TeamMember = {
              id: crypto.randomUUID(),
              initials,
              name: formData.name,
              phone: formData.phone,
              role: formData.role || 'Member',
              department: formData.department || 'Khác',
              color: formData.color || MEMBER_COLORS[0]
          };
          onUpdateMembers([...members, newMember]);
      }
      resetForm();
  };

  const handleDelete = (id: string) => {
      if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
          onUpdateMembers(members.filter(m => m.id !== id));
      }
  };

  // Filter Logic
  const filteredMembers = members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.role?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All' || m.department === selectedDept;
      return matchesSearch && matchesDept;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 flex-shrink-0">
          <div>
              <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      <Users size={28} />
                  </div>
                  <div>
                      <h1 className="text-3xl font-bold text-slate-800">Quản lý Nhân sự</h1>
                      <p className="text-slate-500">Danh sách nhân viên, phân quyền và bộ phận</p>
                  </div>
              </div>
          </div>
          <button 
              onClick={() => { resetForm(); setIsEditing(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
              <Plus size={20} />
              Thêm nhân viên
          </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6 overflow-y-auto pr-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Building2 size={18} className="text-slate-400"/>
                      Phòng ban
                  </h3>
                  <div className="space-y-1">
                      <button 
                          onClick={() => setSelectedDept('All')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDept === 'All' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                          Tất cả ({members.length})
                      </button>
                      {DEPARTMENTS.map(dept => {
                          const count = members.filter(m => m.department === dept).length;
                          return (
                              <button 
                                  key={dept}
                                  onClick={() => setSelectedDept(dept)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between ${selectedDept === dept ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                  <span>{dept}</span>
                                  <span className="bg-slate-100 text-slate-500 px-1.5 rounded-full text-xs">{count}</span>
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>

          {/* Main List */}
          <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="mb-4 flex gap-4">
                  <div className="relative flex-1">
                      <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
                      <input 
                          type="text" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Tìm kiếm nhân viên..." 
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                  </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-20">
                  {filteredMembers.map(member => (
                      <div key={member.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                          <div className="flex items-start justify-between mb-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${member.color}`}>
                                  {member.initials}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(member)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                      <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => handleDelete(member.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </div>
                          
                          <h3 className="font-bold text-slate-800 text-lg">{member.name}</h3>
                          <div className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-2">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{member.role}</span>
                              <span>•</span>
                              <span className="text-blue-600">{member.department}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                              <Phone size={14} />
                              <span>{member.phone || 'Chưa cập nhật SĐT'}</span>
                          </div>
                      </div>
                  ))}
                  
                  {filteredMembers.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                          <Users size={48} className="mx-auto mb-3 opacity-20" />
                          <p>Không tìm thấy nhân viên nào.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Edit/Create Modal Overlay */}
      {isEditing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên Mới'}</h2>
                      <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                          <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                              placeholder="Nguyễn Văn A"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Phòng ban</label>
                             <select 
                                  value={formData.department}
                                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none bg-white"
                              >
                                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                             </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Chức vụ (Role)</label>
                              <input 
                                  type="text" 
                                  value={formData.role}
                                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                                  placeholder="Sales, Dev..."
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại (Zalo)</label>
                          <input 
                              type="text" 
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                              placeholder="090xxxxxxx"
                          />
                      </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                      <button onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                      <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                          <Save size={18} /> Lưu
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TeamManager;
