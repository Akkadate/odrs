import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const RequestList = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        // Add user role and approver level if needed
        let url = '/api/requests';
        if (user.role === 'approver') {
          url += `?approverLevel=${user.approverLevel}`;
        }
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.status === 'success') {
          setRequests(response.data.data);
        } else {
          setError('Failed to fetch requests');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [token, user]);
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_payment':
        return t('pendingPayment');
      case 'payment_verified':
        return t('paymentVerified');
      case 'pending_approval':
        return t('pendingApproval');
      case 'approved':
        return t('approved');
      case 'rejected':
        return t('rejected');
      case 'processing':
        return t('processing');
      case 'completed':
        return t('completed');
      case 'delivered':
        return t('delivered');
      default:
        return status;
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending_payment':
        return 'status-pending';
      case 'payment_verified':
        return 'status-payment-verified';
      case 'pending_approval':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'delivered':
        return 'status-delivered';
      default:
        return 'status-default';
    }
  };
  
  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="retry-btn">
          {t('retry')}
        </button>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="empty-requests">
        <h2>{t('noRequests')}</h2>
        <p>{t('noRequestsDescription')}</p>
        <Link to="/requests/new" className="button primary">
          {t('createNewRequest')}
        </Link>
      </div>
    );
  }
  
  return (
    <div className="requests-container">
      <div className="requests-header">
        <h2>{t('myRequests')}</h2>
        <Link to="/requests/new" className="button primary">
          {t('newRequest')}
        </Link>
      </div>
      
      <div className="requests-list">
        <table className="requests-table">
          <thead>
            <tr>
              <th>{t('requestNumber')}</th>
              <th>{t('documentType')}</th>
              <th>{t('requestDate')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id}>
                <td>{request.requestNumber}</td>
                <td>
                  {user?.language === 'th' 
                    ? request.documentTypeName 
                    : request.documentTypeNameEn}
                </td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </td>
                <td>
                  <Link to={`/requests/${request.id}`} className="view-btn">
                    {t('view')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestList;