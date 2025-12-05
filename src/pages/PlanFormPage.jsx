import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';
import { PlanForm } from '../components/features/plans/PlanForm';

import { Loader2 } from 'lucide-react';

export const PlanFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const [plan, setPlan] = useState(undefined);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      // Find plan by ID
      const foundPlan = state.plans.find(p => p.id === id);
      setPlan(foundPlan);
      setLoading(false);
    }
  }, [id, state.plans]);

  const handleClose = () => {
    navigate('/plans');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return <PlanForm onClose={handleClose} initialData={plan} />;
};


