import React, { useState } from 'react';
import { Plus, Search, LayoutGrid, List, Code } from 'lucide-react';
import { useSchemas } from '../../hooks/useSchemas';
import { SchemaCard } from './SchemaCard';
import { SchemaListTable } from './SchemaListTable';
import { SchemaDetailView } from './SchemaDetailView';
import { SchemaCreationForm } from './SchemaCreationForm';

export const EventSchemasTab = () => {
    const {
        filteredSchemas,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        createSchema,
        updateSchema,
    } = useSchemas();

    const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
    const [isCreating, setIsCreating] = useState(false);
    const [viewingSchema, setViewingSchema] = useState(null);
    const [editingSchema, setEditingSchema] = useState(null);

    const handleCreateSchema = async (schemaData) => {
        const result = await createSchema(schemaData);
        if (result.success) {
            setIsCreating(false);
        }
    };

    const handleUpdateSchema = async (schemaData) => {
        const result = await updateSchema(editingSchema.id, schemaData);
        if (result.success) {
            setEditingSchema(false);
            setViewingSchema(null); // Go back to list or stay on detail? Let's go to list.
        }
    };

    const handleToggleStatus = async (schema) => {
        let newStatus = 'active';
        if (schema.status === 'active') newStatus = 'archived';
        else if (schema.status === 'archived') newStatus = 'active';
        else if (schema.status === 'draft') newStatus = 'active';

        const successMessage = newStatus === 'active'
            ? 'Schema is now Active'
            : newStatus === 'archived'
                ? 'Schema has been Archived'
                : 'Schema status updated';

        const result = await updateSchema(schema.id, { status: newStatus }, { successMessage });
        if (result.success) {
            setViewingSchema({ ...schema, status: newStatus });
        }
    };

    // Show detail view if viewing a schema
    if (viewingSchema) {
        return <SchemaDetailView
            schema={viewingSchema}
            onBack={() => setViewingSchema(null)}
            onEdit={() => {
                setEditingSchema(viewingSchema);
                setViewingSchema(null);
            }}
            onToggleStatus={() => handleToggleStatus(viewingSchema)}
        />;
    }

    // Show creation form if creating
    if (isCreating) {
        return <SchemaCreationForm onSubmit={handleCreateSchema} onCancel={() => setIsCreating(false)} />;
    }

    // Show editing form if editing
    if (editingSchema) {
        return <SchemaCreationForm
            initialData={editingSchema}
            onSubmit={handleUpdateSchema}
            onCancel={() => setEditingSchema(null)}
        />;
    }

    // Main list view
    return (
        <div className="space-y-6">
            {/* Search and Actions Bar */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('card')}
                        className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Card View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        title="List View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Sort Dropdown */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                    <option value="updated_desc">Updated At Descending</option>
                    <option value="name_asc">Name Ascending</option>
                </select>

                {/* New Event Schema Button */}
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Event Schema
                </button>
            </div>

            {/* Schemas Display */}
            {filteredSchemas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No event schemas found</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first event schema to get started</p>
                </div>
            ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchemas.map((schema) => (
                        <SchemaCard
                            key={schema.id}
                            schema={schema}
                            onClick={() => setViewingSchema(schema)}
                        />
                    ))}
                </div>
            ) : (
                <SchemaListTable
                    schemas={filteredSchemas}
                    onSchemaClick={setViewingSchema}
                />
            )}
        </div>
    );
};
