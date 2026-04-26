import { useState } from 'react';
import { supabase } from '../supabaseClient/supabaseClient';
import '../details/BugReportModal.css';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BugReportModal = ({ isOpen, onClose }: BugReportModalProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a bug report message');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/bug-report/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          bug_report: message.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit bug report');
      }

      setSuccess(true);
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bug-report-overlay">
      <div className="bug-report-modal">
        <h2>Report a Bug</h2>
        
        {success && (
          <div className="success-message">
            Thank you! Your bug report has been submitted.
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the bug you encountered..."
            rows={5}
            disabled={isLoading || success}
          />

          <div className="button-group">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={isLoading || success}
            >
              Cancel Report
            </button>
            <button
              type="submit"
              className="send-btn"
              disabled={isLoading || success}
            >
              {isLoading ? 'Sending...' : 'Send Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
