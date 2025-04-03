import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const RequestDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        // Add query params for role-based access
        let url = `/api/requests/${id}?userId=${user.id}&userRole=${user.role}`;
        if (user.role === 'approver') {
          url += `&approverLevel=${user.approverLevel}`;
        }
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.status === 'success') {
          setRequest(response.data.data);
        } else {
          setError('Failed to fetch request details');
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You are not authorized to view this request');
        } else {
          setError('Error loading request details');
        }
        console.error('Error fetching request details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [id, token, user]);
  
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
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      user?.language === 'th' ? 'th-TH' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };
  
  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/requests')} className="back-btn">
          {t('backToRequests')}
        </button>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="not-found">
        <h2>{t('requestNotFound')}</h2>
        <button onClick={() => navigate('/requests')} className="back-btn">
          {t('backToRequests')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="request-details-container">
      <div className="request-details-header">
        <h2>{t('requestDetails')}</h2>
        <button onClick={() => navigate('/requests')} className="back-btn">
          {t('backToRequests')}
        </button>
      </div>
      
      <div className="request-info-card">
        <div className="request-header">
          <div className="request-number">
            <span className="label">{t('requestNumber')}</span>
            <span className="value">{request.requestNumber}</span>
          </div>
          <div className="request-status">
            <span className="label">{t('status')}</span>
            <span className={`status-badge status-${request.status}`}>
              {getStatusLabel(request.status)}
            </span>
          </div>
        </div>
        
        <div className="request-details-grid">
          <div className="detail-item">
            <span className="label">{t('documentType')}</span>
            <span className="value">
              {user?.language === 'th' 
                ? request.documentTypeName 
                : request.documentTypeNameEn}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="label">{t('quantity')}</span>
            <span className="value">{request.quantity}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">{t('language')}</span>
            <span className="value">
              {request.language === 'thai' ? t('thai') : t('english')}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="label">{t('deliveryMethod')}</span>
            <span className="value">
              {request.deliveryMethod === 'pickup' ? t('pickupInPerson') :
               request.deliveryMethod === 'mail' ? t('mailDelivery') :
               t('digitalDocument')}
            </span>
          </div>
          
          {request.deliveryMethod === 'mail' && (
            <div className="detail-item full-width">
              <span className="label">{t('deliveryAddress')}</span>
              <span className="value address">{request.deliveryAddress}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="label">{t('requestDate')}</span>
            <span className="value">{formatDate(request.createdAt)}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">{t('estimatedCompletionDate')}</span>
            <span className="value">{formatDate(request.estimatedCompletionDate)}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">{t('documentPrice')}</span>
            <span className="value">{request.totalPrice - (request.shippingFee || 0)} THB</span>
          </div>
          
          <div className="detail-item">
            <span className="label">{t('shippingFee')}</span>
            <span className="value">{request.shippingFee || 0} THB</span>
          </div>
          
          <div className="detail-item total-price">
            <span className="label">{t('totalPrice')}</span>
            <span className="value">{request.totalPrice} THB</span>
          </div>
          
          <div className="detail-item">
            <span className="label">{t('paymentStatus')}</span>
            <span className={`status-badge payment-${request.paymentStatus}`}>
              {request.paymentStatus === 'paid' ? t('paid') : t('unpaid')}
            </span>
          </div>
        </div>
        
        {/* Approval information if applicable */}
        {request.currentApprovalLevel && (
          <div className="approval-info">
            <h3>{t('approvalProcess')}</h3>
            {/* Depending on your data structure, you might display approval levels here */}
          </div>
        )}
        
        {/* Payment section if status is pending_payment */}
        {request.status === 'pending_payment' && (
          <div className="payment-section">
            <h3>{t('paymentInstructions')}</h3>
            <p>{t('paymentInstructionsText')}</p>
            <button className="button primary">
              {t('uploadPaymentProof')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;