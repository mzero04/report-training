import React, { useState, useEffect } from 'react';
import { TraineeRecord } from '../types';
import { parseAnyDate, formatToLongDate, formatToIsoDate } from '../utils/dateExportUtils';
import { X, Plus, Calendar, Clock, Check, ChevronDown } from 'lucide-react';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: TraineeRecord) => void;
  selectedDate: string;
  availableDates?: string[];
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  selectedDate,
  availableDates = [],
}) => {
  // Initialize date picker state
  const getInitialIsoDate = () => {
    const parsed = parseAnyDate(selectedDate);
    if (parsed) return formatToIsoDate(parsed);
    return formatToIsoDate(new Date());
  };

  const [isoDate, setIsoDate] = useState<string>(getInitialIsoDate());
  const [displayDate, setDisplayDate] = useState<string>(selectedDate || formatToLongDate(new Date()));
  const [name, setName] = useState('');
  const [learningMaterial, setLearningMaterial] = useState('');
  const [trainer, setTrainer] = useState('');
  const [remark, setRemark] = useState('');
  const [dateSelectionMode, setDateSelectionMode] = useState<'picker' | 'existing'>('picker');

  // Sync state whenever modal opens or selectedDate changes
  useEffect(() => {
    if (isOpen) {
      const parsed = parseAnyDate(selectedDate);
      if (parsed) {
        setIsoDate(formatToIsoDate(parsed));
        setDisplayDate(selectedDate);
      } else {
        const today = new Date();
        setIsoDate(formatToIsoDate(today));
        setDisplayDate(formatToLongDate(today));
      }
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  // Handle date change from date picker
  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIsoDate(val);
    if (val) {
      const parsed = parseAnyDate(val);
      if (parsed) {
        setDisplayDate(formatToLongDate(parsed));
      }
    }
  };

  // Handle quick date selection
  const handleSelectQuickDate = (type: 'today' | 'yesterday') => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    setIsoDate(formatToIsoDate(d));
    setDisplayDate(formatToLongDate(d));
    setDateSelectionMode('picker');
  };

  // Handle existing sheet date selection
  const handleSelectExistingDate = (dStr: string) => {
    setDisplayDate(dStr);
    const parsed = parseAnyDate(dStr);
    if (parsed) {
      setIsoDate(formatToIsoDate(parsed));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddRecord({
      id: `custom-${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      date: displayDate.trim(),
      name: name.trim(),
      learningMaterial: learningMaterial.trim(),
      trainer: trainer.trim(),
      remark: remark.trim(),
    });

    setName('');
    setLearningMaterial('');
    setTrainer('');
    setRemark('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Add Trainee Daily Activity</h3>
              <p className="text-[11px] text-slate-400">Record learning progress, modules, and remarks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Date Selection Section (Interactive Calendar & Pickers - Not Manual Text) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pilih Tanggal Log (Date Picker)</span>
              </label>

              {/* Toggle Mode: Calendar vs Existing Sheet Dates */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDateSelectionMode('picker')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    dateSelectionMode === 'picker'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kalender
                </button>
                {availableDates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDateSelectionMode('existing')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      dateSelectionMode === 'existing'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dari Spreadsheet ({availableDates.length})
                  </button>
                )}
              </div>
            </div>

            {/* Selected Date Badge Preview */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-900">
              <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider">Tanggal Terpilih</div>
                <div className="font-bold text-xs text-emerald-950">{displayDate}</div>
              </div>
            </div>

            {dateSelectionMode === 'picker' ? (
              <div className="space-y-2">
                {/* HTML5 Date Input Picker */}
                <div className="relative">
                  <input
                    type="date"
                    value={isoDate}
                    onChange={handlePickerChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800 text-xs shadow-2xs"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500">Pilih Cepat:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickDate('today')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors"
                  >
                    Hari Ini (Today)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickDate('yesterday')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors"
                  >
                    Kemarin (Yesterday)
                  </button>
                </div>
              </div>
            ) : (
              /* Select from Existing Dates in the Sheet */
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-500">Pilih salah satu tanggal yang sudah ada di spreadsheet:</div>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-lg p-1.5 bg-white">
                  {availableDates.map(d => {
                    const isSelected = d === displayDate;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSelectExistingDate(d)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{d}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Trainee Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Trainee / Peserta *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Aulia Darma Putra"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Today's Learning Material */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Materi Pembelajaran Hari Ini (Learning Material)
            </label>
            <textarea
              rows={3}
              value={learningMaterial}
              onChange={e => setLearningMaterial(e.target.value)}
              placeholder="1. Compare PA pada Module Pre-Layout&#10;2. Training Action Plan&#10;3. Training Previous Layout"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Trainer / Mentors */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Trainer / Instruktur / Pembimbing
            </label>
            <input
              type="text"
              value={trainer}
              onChange={e => setTrainer(e.target.value)}
              placeholder="Contoh: 1. Siti Yuhaeni, 2. Budi, 3. Ijal"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Remark / Question */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Remark / Catatan / Pertanyaan / Kendala (Optional)
            </label>
            <input
              type="text"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Contoh: Perlu review compare PA dengan layout mesin"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-xs"
            >
              Simpan Entri
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
