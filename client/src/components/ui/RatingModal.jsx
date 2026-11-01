import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RatingModal({ open, onClose, allocationId, rated, orgLabel, directionLabel, onDone }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!stars) { toast.error('Pick a rating'); return; }
    setSaving(true);
    try {
      await api.post('/ratings', { allocationId, stars, comment: comment || undefined });
      toast.success('Thanks for rating!');
      onClose(); onDone?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to rate');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rate this pickup">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{directionLabel} {orgLabel ? <strong>{orgLabel}</strong> : null}</p>
      {rated ? (
        <p className="text-sm text-[#245C45] font-medium mb-2">✅ You already rated this pickup. Your rating: {rated.stars}/5</p>
      ) : (
        <div className="flex gap-1 mb-3" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`${s} star${s > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(s)}
              className={`text-2xl leading-none transition-transform hover:scale-110 ${(hover || stars) >= s ? 'text-amber-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      )}
      {!rated && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Optional comment (max 500 chars)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#245C45]/40 mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={submit} disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Submit rating'}</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </>
      )}
      {rated && (
        <>
          {rated.comment && <p className="text-sm text-gray-500 mb-2">“{rated.comment}”</p>}
          <Button variant="ghost" onClick={onClose} className="w-full">Close</Button>
        </>
      )}
    </Modal>
  );
}
