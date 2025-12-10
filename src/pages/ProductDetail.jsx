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
                  <div>
                    <div className="mb-4 text-sm text-gray-600">
                      {product.linkedPlans.length} {product.linkedPlans.length === 1 ? 'plan' : 'plans'} associated with this product
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.linkedPlans.map(plan => (
                        <div
                          key={plan.id}
                          onClick={() => navigate(`/plans/${plan.id}`)}
                          className="bg-white rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                        >
                          {/* Card Header */}
                          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-base font-bold text-gray-900 mb-1.5 truncate" title={plan.name}>
                                  {plan.name}
                                </h4>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${plan.status === 'active'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${plan.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                      }`}></span>
                                    {plan.status === 'active' ? 'Active' : 'Draft'}
                                  </span>
                                  <span className="text-xs text-gray-500 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[120px]" title={plan.id}>
                                    {plan.id}
                                  </span>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0 ml-3" />
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="px-4 py-3">
                            <div className="space-y-1.5">
                              {/* Pricing */}
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-1.5 border border-blue-200">
                                <div className="text-xs font-semibold text-blue-700 mb-0.5 uppercase tracking-wide break-words">
                                  Pricing
                                </div>
                                <div className="text-sm font-bold text-gray-900 break-words overflow-hidden">
                                  {(() => {
                                    if (plan.amountCents) {
                                      return `$${(plan.amountCents / 100).toFixed(2)}`;
                                    }

                                    // Calculate total from charges
                                    let total = 0;
                                    let hasUsageBased = false;

                                    try {
                                      let charges = [];
                                      if (plan.charges) {
                                        if (typeof plan.charges === 'string') {
                                          charges = JSON.parse(plan.charges);
                                        } else if (Array.isArray(plan.charges)) {
                                          charges = plan.charges;
                                        } else if (typeof plan.charges === 'object') {
                                          charges = [plan.charges];
                                        }
                                      }

                                      charges.forEach(charge => {
                                        if (charge.amountCents) {
                                          if (charge.type === 'fixed') {
                                            total += charge.amountCents * 100; // Treat as dollars
                                          } else {
                                            total += charge.amountCents;
                                          }
                                        }
                                        if (charge.tiers && Array.isArray(charge.tiers)) {
                                          charge.tiers.forEach(tier => {
                                            if (tier.flatFeeCents) {
                                              total += tier.flatFeeCents;
                                            }
                                            if (tier.unitAmountCents && tier.unitAmountCents > 0) {
                                              hasUsageBased = true;
                                            }
                                          });
                                        }
                                      });

                                      if (total > 0) {
                                        return hasUsageBased
                                          ? `$${(total / 100).toFixed(2)} + usage`
                                          : `$${(total / 100).toFixed(2)}`;
                                      }

                                      if (hasUsageBased) {
                                        return 'Usage-based';
                                      }
                                    } catch (e) {
                                      console.error('Error calculating price:', e);
                                    }

                                    return 'Free';
                                  })()}
                                </div>
                                <div className="text-xs text-gray-600 break-words">
                                  {plan.currency || 'USD'}
                                </div>
                              </div>

                              {/* Billing Cycle */}
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-1.5 border border-green-200">
                                <div className="text-xs font-semibold text-green-700 mb-0.5 uppercase tracking-wide break-words">
                                  Billing Cycle
                                </div>
                                <div className="text-sm font-semibold text-gray-900 capitalize break-words overflow-hidden">
                                  {plan.type === 'one_time' ? 'One-time' : (plan.interval || 'Monthly')}
                                </div>
                                {plan.intervalCount && plan.intervalCount > 1 && (
                                  <div className="text-xs text-gray-600 break-words">
                                    Every {plan.intervalCount} {plan.interval}s
                                  </div>
                                )}
                              </div>

                              {/* Type */}
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-1.5 border border-purple-200">
                                <div className="text-xs font-semibold text-purple-700 mb-0.5 uppercase tracking-wide break-words">
                                  Plan Type
                                </div>
                                <div className="text-sm font-semibold text-gray-900 capitalize break-words overflow-hidden">
                                  {plan.type === 'one_time' ? 'One-time' : plan.type === 'recurring' ? 'Recurring' : (plan.type || 'Recurring')}
                                </div>
                                {plan.trialPeriod > 0 && (
                                  <div className="text-xs text-indigo-600 font-medium">
                                    {plan.trialPeriod} day trial
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Rate Cards / Charges */}
                            {(() => {
                              try {
                                // Handle both object and string formats
                                let charges = [];
                                if (plan.charges) {
                                  if (typeof plan.charges === 'string') {
                                    charges = JSON.parse(plan.charges);
                                  } else if (Array.isArray(plan.charges)) {
                                    charges = plan.charges;
                                  } else if (typeof plan.charges === 'object') {
                                    charges = [plan.charges];
                                  }
                                }
                                console.log('Plan charges:', plan.name, charges);

                                return (
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                      Rate Cards {charges.length > 0 ? `(${charges.length})` : ''}
                                    </div>

                                    {charges.length > 0 ? (
                                      <div className="space-y-1.5">
                                        {(() => {
                                          // Group charges by feature name or name
                                          const groupedCharges = {};

                                          charges.forEach(charge => {
                                            console.log('DEBUG CHARGE:', charge.name, charge.type, charge.amountCents, charge);
                                            const name = charge.properties?.featureName || charge.properties?.addonName || charge.name || 'Unknown';
                                            if (!groupedCharges[name]) {
                                              groupedCharges[name] = {
                                                name,
                                                entitlement: null,
                                                usage: null,
                                                license: null,
                                                fixed: null
                                              };
                                            }

                                            if (charge.type === 'entitlement') groupedCharges[name].entitlement = charge;
                                            else if (charge.type === 'usage') groupedCharges[name].usage = charge;
                                            else if (charge.type === 'license') groupedCharges[name].license = charge;
                                            else if (charge.type === 'fixed') groupedCharges[name].fixed = charge;
                                          });

                                          return Object.values(groupedCharges).map((group, idx) => {
                                            let displayDetails = [];

                                            // 1. Entitlement Limit (Green Badge)
                                            if (group.entitlement && group.entitlement.entitlementLimit) {
                                              displayDetails.push({
                                                text: `${group.entitlement.entitlementLimit.toLocaleString()}`,
                                                class: 'bg-green-100 text-green-700 border-green-200'
                                              });
                                            }

                                            // 2. License Quantity (Green Badge)
                                            if (group.license && group.license.properties?.maxLicenseQuantity) {
                                              displayDetails.push({
                                                text: `${group.license.properties.maxLicenseQuantity}`,
                                                class: 'bg-green-100 text-green-700 border-green-200'
                                              });
                                            }

                                            // 3. Fixed Price (Blue Badge)
                                            if (group.fixed && group.fixed.amountCents !== undefined) {
                                              displayDetails.push({
                                                text: `$${Number(group.fixed.amountCents).toFixed(2)}`,
                                                class: 'bg-blue-100 text-blue-700 border-blue-200'
                                              });
                                            }

                                            // 4. Usage Tiers (Blue Badge)
                                            if (group.usage && group.usage.tiers && group.usage.tiers.length > 0) {
                                              if (group.usage.tiers.length === 1 && group.usage.tiers[0].type === 'flat') {
                                                displayDetails.push({
                                                  text: `$${(group.usage.tiers[0].flatFeeCents / 100).toFixed(2)}`,
                                                  class: 'bg-blue-100 text-blue-700 border-blue-200'
                                                });
                                              } else {
                                                const tiersText = group.usage.tiers.map(t => {
                                                  const unitPrice = t.unitAmountCents ? `$${t.unitAmountCents / 100}/unit` : 'Free';
                                                  const range = t.lastUnit ? `${t.firstUnit}-${t.lastUnit}` : `> ${t.firstUnit}`;
                                                  return (t.unitAmountCents || group.usage.tiers.length === 1) ? `${range}: ${unitPrice}` : null;
                                                }).filter(Boolean).join(', ');

                                                if (tiersText) {
                                                  displayDetails.push({
                                                    text: tiersText,
                                                    class: 'bg-blue-100 text-blue-700 border-blue-200'
                                                  });
                                                }
                                              }
                                            } else if (group.usage) {
                                              displayDetails.push({
                                                text: 'Usage-based',
                                                class: 'bg-blue-100 text-blue-700 border-blue-200'
                                              });
                                            }

                                            return (
                                              <div key={idx} className="bg-indigo-50 rounded p-2 border border-indigo-100">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                                  <div className="text-sm font-semibold text-gray-900 shrink-0 capitalize">
                                                    {group.name}
                                                  </div>
                                                  <div className="text-right flex-1 min-w-0">
                                                    <div className="flex flex-wrap justify-end gap-x-2 gap-y-1">
                                                      {displayDetails.length > 0 ? (
                                                        displayDetails.map((detail, dIdx) => (
                                                          <div key={dIdx} className={`text-xs font-semibold px-2 py-0.5 rounded border break-words text-right ${detail.class}`}>
                                                            {detail.text}
                                                          </div>
                                                        ))
                                                      ) : (
                                                        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Included</div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        No rate cards configured for this plan
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch (e) {
                                console.error('Error parsing charges:', e);
                                return (
                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="text-xs text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
                                      Error loading rate cards
                                    </div>
                                  </div>
                                );
                              }
                            })()}

                            {/* Additional Info */}
                            {plan.description && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {plan.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
