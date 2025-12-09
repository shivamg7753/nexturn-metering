import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Package, Calendar, Tag, FileText, Copy, ExternalLink, DollarSign } from 'lucide-react';
import { api } from '../api/client';

const API_URL = 'http://localhost:3000/api/products';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data = await response.json();
        setProduct(data);

        // Fetch linked plans
        const allPlans = await api.getPlans();
        const linkedPlans = allPlans.filter(p => p.productId === data.id);
        setProduct(prev => ({ ...prev, linkedPlans }));
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(product.id);
    toast.success('Product ID copied to clipboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6 max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/products')}
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Package className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                  {product.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Description</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description provided for this product.'}
                </p>
              </div>
            </div>

            {/* Linked Price Plans */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Linked Price Plans</h3>
              </div>
              <div className="p-6">
                {product.linkedPlans && product.linkedPlans.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {product.linkedPlans.map(plan => (
                      <div
                        key={plan.id}
                        onClick={() => navigate(`/plans/${plan.id}`)}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {plan.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {plan.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500 font-mono">
                              {plan.id}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No price plans linked to this product.</p>
                )}
              </div>
            </div>

            {/* Additional details like linked plans can go here */}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Metadata</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Product ID
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="font-mono text-sm text-gray-900 break-all">
                      {product.id}
                    </div>
                    <button
                      onClick={handleCopyId}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                      title="Copy ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created At
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(product.createdAt)}
                  </div>
                </div>
                {product.updatedAt && (
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last Updated
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(product.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
