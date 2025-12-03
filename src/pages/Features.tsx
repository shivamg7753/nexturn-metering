import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, BarChart2, X, ChevronLeft, Info } from 'lucide-react';
import { useApp } from '../context/store';
import { api } from '../api/client';
import { EventSchema, FeatureAssociation } from '../types';

export function Features() {
  const { state, dispatch } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [schemas, setSchemas] = useState<EventSchema[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  // Associations State
  const [associations, setAssociations] = useState<FeatureAssociation[]>([{ eventSchemaId: '', attribute: '' }]);
  const [limit, setLimit] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fetchedSchemas = await api.getSchemas();
      setSchemas(fetchedSchemas);
    } catch (err) {
      console.error('Failed to load schemas:', err);
    }

    try {
      await api.getFeatures();
    } catch (err) {
      console.error('Failed to load features:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  const removeAssociation = (index: number) => {
    setAssociations(associations.filter((_, i) => i !== index));
  };

  const updateAssociation = (index: number, field: keyof FeatureAssociation, value: string) => {
    const newAssociations = [...associations];
    newAssociations[index][field] = value;
    setAssociations(newAssociations);
  };

  const filteredFeatures = state.features.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setIsCreating(false)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create a new Feature</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Panel - Info */}
              <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 mb-2">Define Feature</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A feature can be linked to multiple attributes/event schemas. You can associate a new attribute later as well.
                </p>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      Features define what your customers are entitled to. Link them to event attributes to track usage automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel - Form */}
              <div className="w-full md:w-2/3 p-8 space-y-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Feature Name
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. API Requests"
                    />
                  </div>


                </div>

                {/* Associations */}
                <div className="space-y-4">
                  {associations.map((assoc, index) => {
                    const selectedSchema = schemas.find(s => s.id === assoc.eventSchemaId);
                    return (
                      <div key={index} className="border-2 border-dashed border-gray-200 rounded-xl p-6 relative group hover:border-indigo-200 transition-colors">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          {associations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAssociation(index)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                          ASSOCIATE ATTRIBUTE {index + 1}
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <select
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border bg-white"
                              value={assoc.eventSchemaId}
                              onChange={(e) => updateAssociation(index, 'eventSchemaId', e.target.value)}
                              required
                            >
                              <option value="">Choose Event Schema</option>
                              {schemas.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <select
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border bg-white"
                              value={assoc.attribute}
                              onChange={(e) => updateAssociation(index, 'attribute', e.target.value)}
                              required
                              disabled={!assoc.eventSchemaId}
                            >
                              <option value="">Choose Attribute</option>
                              {selectedSchema && (() => {
                                const dims = typeof selectedSchema.dimensions === 'string'
                                  ? JSON.parse(selectedSchema.dimensions)
                                  : selectedSchema.dimensions || {};
                                let keys: string[] = [];
                                if (dims.attributes || dims.dimensions) {
                                  if (Array.isArray(dims.attributes)) keys = [...keys, ...dims.attributes.map((attr: any) => attr.name)];
                                  if (Array.isArray(dims.dimensions)) keys = [...keys, ...dims.dimensions];
                                } else {
                                  keys = Object.keys(dims);
                                }
                                return keys.map(key => (
                                  <option key={key} value={key}>{key}</option>
                                ));
                              })()}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addAssociation}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors px-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Associate Another Attribute
                  </button>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Publish Feature
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search features..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Feature
        </button>
      </div>

      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No features found</h3>
          <p className="mt-1 text-sm text-gray-500">Define what your customers can do.</p>
          <div className="mt-6">
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Feature
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => (
            <div key={feature.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                  {feature.description && (
                    <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                  )}
                  {feature.type === 'metered' && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500">
                        {feature.associations?.length || 0} associated attributes
                      </div>
                    </div>
                  )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feature.type === 'boolean' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                  {feature.type === 'boolean' ? 'Boolean' : 'Metered'}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {feature.type === 'metered' ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <BarChart2 className="h-4 w-4 mr-2 text-gray-400" />
                    Metered Feature
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                    Static Entitlement
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
