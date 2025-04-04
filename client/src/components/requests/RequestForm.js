import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import requestService from '../../services/requestService';

const RequestForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressField, setShowAddressField] = useState(false);
  const [priceCalculated, setPriceCalculated] = useState(false);
  
  const [formData, setFormData] = useState({
    documentTypeId: '',
    quantity: 1,
    language: 'th',
    deliveryMethod: 'pickup',
    deliveryAddress: '',
  });
  
  const [priceDetails, setPriceDetails] = useState({
    documentPrice: 0,
    shippingFee: 0,
    totalPrice: 0
  });
  
  // Fetch document types when component mounts
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoading(true);
        const response = await requestService.getDocumentTypes();
        
        if (response.status === 'success') {
          setDocumentTypes(response.data);
        } else {
          setError('Failed to fetch document types');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching document types:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentTypes();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Reset price calculation when form changes
    if (priceCalculated) {
      setPriceCalculated(false);
    }
    
    // Show/hide address field based on delivery method
    if (name === 'deliveryMethod') {
      setShowAddressField(value === 'mail');
      if (value !== 'mail') {
        setFormData(prev => ({ ...prev, deliveryAddress: '' }));
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const calculatePrice = () => {
    const selectedDocument = documentTypes.find(doc => doc.id === formData.documentTypeId);
    
    if (!selectedDocument) {
      setError('Please select a document type');
      return;
    }
    
    // Calculate document price
    const documentPrice = selectedDocument.price * formData.quantity;
    
    // Calculate shipping fee
    const shippingFee = formData.deliveryMethod === 'mail' ? 50 : 0;
    
    // Calculate total price
    const totalPrice = documentPrice + shippingFee;
    
    setPriceDetails({
      documentPrice,
      shippingFee,
      totalPrice
    });
    
    setPriceCalculated(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!priceCalculated) {
      setError('Please calculate price before submitting');
      return;
    }
    
    if (formData.deliveryMethod === 'mail' && !formData.deliveryAddress) {
      setError('Delivery address is required for mail delivery');
      return;
    }
    
    try {
      setLoading(true);
      
      // Add price details to form data
      const requestData = {
        ...formData,
        documentPrice: priceDetails.documentPrice,
        shippingFee: priceDetails.shippingFee,
        totalPrice: priceDetails.totalPrice
      };
      
      const response = await requestService.createRequest(requestData);
      
      if (response.status === 'success') {
        // Redirect to request details or list
        navigate('/requests');
      } else {
        setError(response.message || 'Failed to submit request');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting request');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && documentTypes.length === 0) {
    return <div className="loading">{t('loading')}</div>;
  }
  
  return (
    <div className="request-form-container">
      <h2>{t('requestDocument')}</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label htmlFor="documentTypeId">{t('documentType')}</label>
          <select 
            id="documentTypeId"
            name="documentTypeId"
            value={formData.documentTypeId}
            onChange={handleInputChange}
            required
          >
            <option value="">{t('selectDocumentType')}</option>
            {documentTypes.map(doc => (
              <option key={doc.id} value={doc.id}>
                {user?.language === 'th' ? doc.name : doc.nameEn}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="quantity">{t('quantity')}</label>
          <input 
            type="number" 
            id="quantity"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="language">{t('language')}</label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            required
          >
            <option value="th">{t('thai')}</option>
            <option value="en">{t('english')}</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="deliveryMethod">{t('deliveryMethod')}</label>
          <select
            id="deliveryMethod"
            name="deliveryMethod"
            value={formData.deliveryMethod}
            onChange={handleInputChange}
            required
          >
            <option value="pickup">{t('pickupInPerson')}</option>
            <option value="mail">{t('mailDelivery')}</option>
            <option value="digital">{t('digitalDocument')}</option>
          </select>
        </div>
        
        {showAddressField && (
          <div className="form-group">
            <label htmlFor="deliveryAddress">{t('deliveryAddress')}</label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              rows="3"
              required={formData.deliveryMethod === 'mail'}
            ></textarea>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="calculate-btn"
            onClick={calculatePrice}
            disabled={!formData.documentTypeId || loading}
          >
            {t('calculatePrice')}
          </button>
        </div>
        
        {priceCalculated && (
          <div className="price-details">
            <h3>{t('estimatedPrice')}</h3>
            <div className="price-row">
              <span>{t('documentPrice')}</span>
              <span className="price">{priceDetails.documentPrice} THB</span>
            </div>
            <div className="price-row">
              <span>{t('shippingFee')}</span>
              <span className="price">{priceDetails.shippingFee} THB</span>
            </div>
            <div className="price-row total">
              <span>{t('total')}</span>
              <span className="price">{priceDetails.totalPrice} THB</span>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? t('submitting') : t('submitRequest')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RequestForm;