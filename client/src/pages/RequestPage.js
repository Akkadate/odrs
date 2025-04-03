import React from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import RequestForm from '../components/requests/RequestForm';
import RequestList from '../components/requests/RequestList';
import RequestDetails from '../components/requests/RequestDetails';

const RequestPage = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RequestList />} />
        <Route path="/new" element={<RequestForm />} />
        <Route path="/:id" element={<RequestDetails />} />
        <Route path="*" element={<Navigate to="/requests" />} />
      </Routes>
    </Layout>
  );
};

export default RequestPage;