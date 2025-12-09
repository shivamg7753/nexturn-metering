import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useApp } from '../context/store';
import { api } from '../api/client';
import { useFeatures } from '../hooks';
import {
  FeaturesHeader,
  FeatureForm,
  EmptyFeaturesState,
  FeaturesGrid,
  FeaturesList,
  FeatureDetail,
} from '../components/features';

export function Features() {
  const { state, dispatch } = useApp();
  const { schemas } = useFeatures();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await api.getFeatures();
        dispatch({ type: 'SET_FEATURES', payload: data });
      } catch (error) {
        console.error('Failed to fetch features:', error);
        toast.error('Failed to load features');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [dispatch]);

  // View State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [editingFeature, setEditingFeature] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [associations, setAssociations] = useState([{ eventSchemaId: '', attribute: '' }]);

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (feature) => {
    setEditingFeature(feature);
    setName(feature.name);
    setDescription(feature.description || '');

    // Parse associations if string/json
    let parsedAssociations = [];
    try {
      parsedAssociations = feature.associations ? (typeof feature.associations === 'string' ? JSON.parse(feature.associations) : feature.associations) : [];
    } catch (e) {
      parsedAssociations = [];
    }

    if (parsedAssociations.length === 0) {
      parsedAssociations = [{ eventSchemaId: '', attribute: '' }];
    }
    setAssociations(parsedAssociations);

    setIsCreating(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingFeature ? 'Updating feature...' : 'Creating feature...');

    try {
      if (editingFeature) {
        const updatedFeature = await api.updateFeature({
          id: editingFeature.id,
          name,
          description,
          associations,
        });

        if (updatedFeature.error) throw new Error(updatedFeature.error);

        // Update local state - assuming we might not have a reducer action for UPDATE_FEATURE yet or relying on refresh
        // But let's dispatch if we add it, or manually update list in context if possible. 
        // For now, let's assume we need to refresh or add UPDATE_FEATURE to reducer.
        // Checking store.jsx, there is NO UPDATE_FEATURE. I should add it.
        // For now, I'll dispatch ADD_FEATURE with replaced content or reload?
        // Wait, store.js has ADD_FEATURE. I should add UPDATE_FEATURE to store.js later.
        // For now, I will use a simple hack or assume user wants me to add it.
        // Actually, the previous step didn't add UPDATE_FEATURE to store.js.
        // I will dispatch 'UPDATE_FEATURE' and will add it to store.js in next step if missing.
        dispatch({ type: 'UPDATE_FEATURE', payload: updatedFeature });

        toast.success('Feature updated successfully!', {
          id: loadingToast,
          position: 'top-right',
          style: {
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          },
          iconTheme: {
            primary: '#059669',
            secondary: '#ecfdf5',
          }
        });
      } else {
        const newFeature = await api.createFeature({
          name,
          description,
          associations,
        });

        if (newFeature.error) throw new Error(newFeature.error);

        dispatch({ type: 'ADD_FEATURE', payload: newFeature });
        toast.success('Feature created successfully!', {
          id: loadingToast,
          position: 'top-right',
          style: {
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          },
          iconTheme: {
            primary: '#059669',
            secondary: '#ecfdf5',
          }
        });
      }

      setIsCreating(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.message || (editingFeature ? 'Failed to update feature' : 'Failed to create feature'), { id: loadingToast });
    }
  };

  const resetForm = () => {
    setEditingFeature(null);
    setName('');
    setDescription('');
    setAssociations([{ eventSchemaId: '', attribute: '' }]);
  };

  const addAssociation = () => {
    setAssociations([...associations, { eventSchemaId: '', attribute: '' }]);
  };

  const removeAssociation = (index) => {
    setAssociations(associations.filter((_, i) => i !== index));
  };

  const updateAssociation = (index, field, value) => {
    const newAssociations = [...associations];
    newAssociations[index][field] = value;
    setAssociations(newAssociations);
  };

  const filteredFeatures = state.features.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isCreating) {
    return (
      <>
        <Toaster position="top-right" />
        <FeatureForm
          name={name}
          description={description}
          associations={associations}
          schemas={schemas}
          onClose={() => setIsCreating(false)}
          onSubmit={handleSubmit}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onAddAssociation={addAssociation}
          onRemoveAssociation={removeAssociation}
          onUpdateAssociation={updateAssociation}
        />
      </>
    );
  }

  if (selectedFeature) {
    // Find the latest version of the selected feature from state to ensure updates are reflected
    const feature = state.features.find(f => f.id === selectedFeature.id) || selectedFeature;
    return (
      <>
        <Toaster position="top-right" />
        <FeatureDetail
          feature={feature}
          onBack={() => setSelectedFeature(null)}
          onEdit={handleEdit}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <FeaturesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreate={handleCreate}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      {filteredFeatures.length === 0 ? (
        <EmptyFeaturesState onCreate={handleCreate} />
      ) : (
        viewMode === 'grid' ? (
          <FeaturesGrid
            features={filteredFeatures}
            onEdit={handleEdit}
            onSelect={setSelectedFeature}
          />
        ) : (
          <FeaturesList
            features={filteredFeatures}
            onEdit={handleEdit}
            onSelect={setSelectedFeature}
          />
        )
      )}
    </div>
  );
}
