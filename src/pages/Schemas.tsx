import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Plus, Code, Trash2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Attribute {
  name: string;
  unit: string;
}

export const Schemas = () => {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [dimensions, setDimensions] = useState<string[]>([]);

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      const data = await api.getSchemas();
      setSchemas(data);
    } catch (err) {
      console.error('Failed to load schemas', err);
    }
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: '', unit: '' }]);
  };

  const handleUpdateAttribute = (index: number, field: keyof Attribute, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAddDimension = () => {
    setDimensions([...dimensions, '']);
  };

  const handleUpdateDimension = (index: number, value: string) => {
    const newDimensions = [...dimensions];
    newDimensions[index] = value;
    setDimensions(newDimensions);
  };

  const handleRemoveDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Structure the dimensions/attributes JSON
      const schemaStructure = {
        attributes,
        dimensions
      };

      await api.createSchema({
        name,
        description,
        dimensions: schemaStructure, // Store both in the 'dimensions' field for now
      });

      setIsCreating(false);
      loadSchemas();
      resetForm();
    } catch (err) {
      alert('Failed to create schema. Check console for details.');
      console.error(err);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');

    setAttributes([]);
    setDimensions([]);
  };

  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsCreating(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Event Schema</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Define Event Schema</h2>

            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Schema Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Stripe Transaction Event"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                rows={3}
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Attributes</h2>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                + Add Attribute
              </button>
            </div>

            <div className="space-y-4">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Attribute Name</label>
                    <input
                      type="text"
                      value={attr.name}
                      onChange={e => handleUpdateAttribute(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="e.g. transaction_amount"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                    <input
                      type="text"
                      value={attr.unit}
                      onChange={e => handleUpdateAttribute(idx, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="e.g. USD"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(idx)}
                    className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {attributes.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No attributes defined. Add one to track values like amount, duration, etc.
                </p>
              )}
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Dimensions</h2>
              <button
                type="button"
                onClick={handleAddDimension}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                + Add Dimension
              </button>
            </div>

            <div className="space-y-4">
              {dimensions.map((dim, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dimension Name</label>
                    <input
                      type="text"
                      value={dim}
                      onChange={e => handleUpdateDimension(idx, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="e.g. payment_mode"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDimension(idx)}
                    className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {dimensions.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No dimensions defined. Add one to group events (e.g. by region, type).
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Create Schema
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Schemas</h1>
          <p className="text-gray-500 mt-1">Define the structure of events you want to track.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Schema
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemas.map((schema) => {
          const structure = typeof schema.dimensions === 'string'
            ? JSON.parse(schema.dimensions)
            : schema.dimensions;

          const attributes = structure.attributes || [];
          const dimensions = structure.dimensions || [];

          // Legacy support for old format where dimensions was just a key-value map
          const isLegacy = !Array.isArray(attributes) && !Array.isArray(dimensions);
          const legacyKeys = isLegacy ? Object.keys(structure) : [];

          return (
            <div key={schema.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Code className="w-5 h-5" />
                </div>

              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{schema.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{schema.description || 'No description provided.'}</p>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                {attributes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attributes</h4>
                    <div className="flex flex-wrap gap-2">
                      {attributes.map((attr: Attribute, i: number) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                          {attr.name} <span className="opacity-50">({attr.unit})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {dimensions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dimensions</h4>
                    <div className="flex flex-wrap gap-2">
                      {dimensions.map((dim: string, i: number) => (
                        <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                          {dim}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isLegacy && legacyKeys.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Properties</h4>
                    <div className="flex flex-wrap gap-2">
                      {legacyKeys.map((key) => (
                        <span key={key} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
