import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, Loader2, ImageIcon } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useCreateListing } from '../hooks/useApi';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Clothing', 'Art', 'Services', 'Other'];

interface FormData {
  title: string;
  description: string;
  priceXLM: string;
  imageUrl: string;
  category: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  priceXLM?: string;
  imageUrl?: string;
  category?: string;
}

const PLACEHOLDER_IMAGE =
  'https://placehold.co/400x300/1e1b4b/a5b8fc?text=Preview';

export default function CreateListing() {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const createListingMutation = useCreateListing();

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    priceXLM: '',
    imageUrl: '',
    category: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim() || form.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    const price = parseFloat(form.priceXLM);
    if (!form.priceXLM || isNaN(price) || price <= 0) {
      newErrors.priceXLM = 'Price must be a positive number';
    }
    if (price > 1_000_000) {
      newErrors.priceXLM = 'Price cannot exceed 1,000,000 XLM';
    }
    if (!form.category) {
      newErrors.category = 'Please select a category';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!address) return;

    try {
      await createListingMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        priceXLM: parseFloat(form.priceXLM),
        imageUrl: form.imageUrl.trim(),
        category: form.category,
        seller: address,
      });
      toast.success('Listing created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create listing'
      );
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Wallet Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You need to connect your Freighter wallet to create a listing.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-stellar-600 hover:underline text-sm"
          >
            Go back to Home
          </button>
        </div>
      </div>
    );
  }

  const previewImage = form.imageUrl.trim() || PLACEHOLDER_IMAGE;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create a Listing
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            List your item on the Stellar decentralized marketplace
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Image preview */}
            <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 h-48 flex items-center justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Image URL{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stellar-500 focus:border-transparent transition"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Vintage Leather Jacket"
                maxLength={100}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stellar-500 focus:border-transparent transition ${
                  errors.title
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your item in detail…"
                rows={4}
                maxLength={1000}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stellar-500 focus:border-transparent transition resize-none ${
                  errors.description
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-red-500 text-xs">{errors.description}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">
                  {form.description.length}/1000
                </span>
              </div>
            </div>

            {/* Price + Category row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Price (XLM) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                    ⭐
                  </span>
                  <input
                    type="number"
                    name="priceXLM"
                    value={form.priceXLM}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stellar-500 focus:border-transparent transition ${
                      errors.priceXLM
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.priceXLM && (
                  <p className="text-red-500 text-xs mt-1">{errors.priceXLM}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stellar-500 focus:border-transparent transition ${
                    errors.category
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Seller info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Listing as
              </p>
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                {address}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createListingMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-stellar-600 hover:bg-stellar-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base"
            >
              {createListingMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Create Listing
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
