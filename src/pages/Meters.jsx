import React, { useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/store';
import { useMetersData } from '../hooks';
import {
  MeterForm,
  MetersHeader,
  MetersGrid,
} from '../components/meters';

export const Meters = () => {
  const { dispatch } = useApp();
  const { meters, schemas, loadData } = useMetersData();
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventSchemaId, setEventSchemaId] = useState(schemas[0]?.id || '');
  const [aggregation, setAggregation] = useState('count');
  const [field, setField] = useState('');
  const [window, setWindow] = useState('tumbling');
  const [filters, setFilters] = useState([]);

  // Update eventSchemaId when schemas load
  React.useEffect(() => {
    if (schemas.length > 0 && !eventSchemaId) {
      setEventSchemaId(schemas[0].id);
    }
  }, [schemas, eventSchemaId]);

  const handleAddFilter = () => {
    setFilters([...filters, { key: '', operator: 'equals', value: '' }]);
  };

  const handleUpdateFilter = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMeter = await api.createMeter({
        name,
        description,
        eventSchemaId,
        aggregation,
        field,
        filter: filters,
        window,
      });

      dispatch({
        type: 'ADD_METRIC',
        payload: {
          id: newMeter.id,
          name: newMeter.name,
          description: newMeter.description,
          aggregationType: newMeter.aggregation,
          field: newMeter.field,
          status: 'active'
        }
      });

      setIsCreating(false);
      loadData();
      resetForm();
    } catch (err) {
      alert('Failed to create meter. Check console for details.');
      console.error(err);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEventSchemaId(schemas[0]?.id || '');
    setAggregation('count');
    setField('');
    setFilters([]);
    setWindow('tumbling');
  };

  if (isCreating) {
    return (
      <MeterForm
        name={name}
        description={description}
        eventSchemaId={eventSchemaId}
        aggregation={aggregation}
        field={field}
        window={window}
        filters={filters}
        schemas={schemas}
        onClose={() => setIsCreating(false)}
        onSubmit={handleSubmit}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onSchemaChange={setEventSchemaId}
        onAggregationChange={setAggregation}
        onFieldChange={setField}
        onWindowChange={setWindow}
        onAddFilter={handleAddFilter}
        onUpdateFilter={handleUpdateFilter}
        onRemoveFilter={handleRemoveFilter}
      />
    );
  }

  return (
    <div className="space-y-6">
      <MetersHeader onCreate={() => setIsCreating(true)} />
      <MetersGrid meters={meters} schemas={schemas} />
    </div>
  );
};
