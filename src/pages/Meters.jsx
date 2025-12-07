import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../api/client';
import { useApp } from '../context/store';
import { useMetersData } from '../hooks';
import {
  MeterForm,
  MetersHeader,
  MetersGrid,
  MetersList,
  MeterDetail,
} from '../components/meters';

export const Meters = () => {
  const { dispatch } = useApp();
  const { meters, schemas, loadData } = useMetersData();
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Detail State
  const [selectedMeter, setSelectedMeter] = useState(null);

  // Form State
  const [editingMeter, setEditingMeter] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventSchemaId, setEventSchemaId] = useState(schemas[0]?.id || '');
  const [aggregation, setAggregation] = useState('count');
  const [field, setField] = useState('');
  const [window, setWindow] = useState('tumbling');
  const [eventLevelCalculation, setEventLevelCalculation] = useState('');
  const [filters, setFilters] = useState([]);

  // Update eventSchemaId when schemas load
  React.useEffect(() => {
    if (schemas.length > 0 && !eventSchemaId && !editingMeter) {
      setEventSchemaId(schemas[0].id);
    }
  }, [schemas, eventSchemaId, editingMeter]);

  const handleEdit = (meter) => {
    setEditingMeter(meter);
    setName(meter.name);
    setDescription(meter.description || '');
    setEventSchemaId(meter.eventSchemaId);
    setAggregation(meter.aggregation);
    setField(meter.field || '');
    setWindow(meter.window || 'tumbling');
    setEventLevelCalculation(meter.eventLevelCalculation || '');

    // Parse filters
    const parsedFilters = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
    setFilters(Array.isArray(parsedFilters) ? parsedFilters : []);

    setIsCreating(true);
    setSelectedMeter(null); // Close detail view if open
  };

  const handleToggleStatus = async (meter) => {
    try {
      let newStatus = '';
      let successMessage = '';

      if (meter.status === 'draft' || !meter.status) {
        newStatus = 'active';
        successMessage = 'Usage Meter published successfully!';
      } else if (meter.status === 'active') {
        newStatus = 'archived';
        successMessage = 'Usage Meter archived successfully!';
      } else {
        return;
      }

      await api.updateMeter({ ...meter, status: newStatus });

      // Update local state if viewing detail
      if (selectedMeter && selectedMeter.id === meter.id) {
        setSelectedMeter({ ...selectedMeter, status: newStatus });
      }

      loadData();
      toast.success(successMessage, {
        position: 'bottom-right',
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
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update status');
    }
  };

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

  const handleSubmit = async (e, status) => {
    e && e.preventDefault();
    try {
      if (editingMeter) {
        await api.updateMeter({
          id: editingMeter.id,
          name,
          description,
          eventSchemaId,
          aggregation,
          field,
          filter: filters,
          window,
          eventLevelCalculation,
          status: editingMeter.status
        });
        toast.success('Usage Meter updated successfully!');
      } else {
        await api.createMeter({
          name,
          description,
          eventSchemaId,
          aggregation,
          field,
          filter: filters,
          window,
          eventLevelCalculation,
          status: status || 'draft'
        });
        toast.success(status === 'active' ? 'Usage Meter created and published successfully' : 'Usage Meter created successfully!', {
          position: 'bottom-right',
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
      setEditingMeter(null);
      loadData();
      resetForm();
    } catch (err) {
      toast.error('Failed to save meter.');
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingMeter(null);
    setName('');
    setDescription('');
    setEventSchemaId(schemas[0]?.id || '');
    setAggregation('count');
    setField('');
    setFilters([]);
    setWindow('tumbling');
    setEventLevelCalculation('');
  };

  if (isCreating) {
    return (
      <>
        <Toaster />
        <MeterForm
          isEditing={!!editingMeter}
          name={name}
          description={description}
          eventSchemaId={eventSchemaId}
          aggregation={aggregation}
          field={field}
          window={window}
          filters={filters}
          eventLevelCalculation={eventLevelCalculation}
          schemas={schemas}
          onClose={() => { setIsCreating(false); resetForm(); }}
          onSubmit={handleSubmit}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onSchemaChange={setEventSchemaId}
          onAggregationChange={setAggregation}
          onFieldChange={setField}
          onWindowChange={setWindow}
          onEventLevelCalculationChange={setEventLevelCalculation}
          onAddFilter={handleAddFilter}
          onUpdateFilter={handleUpdateFilter}
          onRemoveFilter={handleRemoveFilter}
        />
      </>
    );
  }

  if (selectedMeter) {
    return (
      <>
        <Toaster />
        <MeterDetail
          meter={selectedMeter}
          schema={schemas.find(s => s.id === selectedMeter.eventSchemaId)}
          onBack={() => setSelectedMeter(null)}
          onEdit={handleEdit}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <MetersHeader
        onCreate={() => setIsCreating(true)}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />
      {viewMode === 'grid' ? (
        <MetersGrid
          meters={meters}
          schemas={schemas}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onSelect={setSelectedMeter}
        />
      ) : (
        <MetersList
          meters={meters}
          schemas={schemas}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onSelect={setSelectedMeter}
        />
      )}
    </div>
  );
};
