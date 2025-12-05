import React, { useState } from 'react';
import { useApp } from '../context/store';
import { api } from '../api/client';
import { useFeatures } from '../hooks';
import {
  FeaturesHeader,
  FeatureForm,
  EmptyFeaturesState,
  FeaturesGrid,
} from '../components/features';

export function Features() {
  const { state, dispatch } = useApp();
  const { schemas } = useFeatures();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [associations, setAssociations] = useState([{ eventSchemaId: '', attribute: '' }]);
  const [limit, setLimit] = useState(undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newFeature = await api.createFeature({
        name,
        description,
        type: 'metered',
        associations: associations,
        limit: limit,
      });

      dispatch({ type: 'ADD_FEATURE', payload: newFeature });
      setIsCreating(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to create Feature');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAssociations([{ eventSchemaId: '', attribute: '' }]);
    setLimit(undefined);
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
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  if (isCreating) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <FeaturesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreate={handleCreate}
      />

      {filteredFeatures.length === 0 ? (
        <EmptyFeaturesState onCreate={handleCreate} />
      ) : (
        <FeaturesGrid features={filteredFeatures} />
      )}
    </div>
  );
}

