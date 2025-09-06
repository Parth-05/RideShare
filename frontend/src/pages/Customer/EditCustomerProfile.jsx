import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useGetCustomerProfileQuery, useUpdateCustomerProfileMutation } from '../../redux/api/profileApi';

const EditProfile = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useGetCustomerProfileQuery();
  const [updateCustomer, { isLoading: updating, error }] = useUpdateCustomerProfileMutation();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Prefill form when user data is loaded
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
      });
    }
  }, [user]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = form; 
    const res = await updateCustomer(payload);
    // dispatch(fetchCustomerProfile());
    if (res) {
      navigate('/customer/profile');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#2563EB] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
          <div className="px-6 py-5 border-b border-[#E2E8F0]">
            <h1 className="text-xl font-semibold text-[#0F172A]">Edit Profile</h1>
            <p className="text-sm text-[#64748B]">Update your personal information</p>
          </div>

          <form onSubmit={onSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">First name</label>
              <input name="first_name" value={form.first_name} onChange={onChange}
                className="w-full rounded-xl border p-2.5" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Last name</label>
              <input name="last_name" value={form.last_name} onChange={onChange}
                className="w-full rounded-xl border p-2.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input name="email" value={form.email} disabled
                className="w-full rounded-xl border p-2.5 bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={onChange}
                className="w-full rounded-xl border p-2.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Address</label>
              <input name="address" value={form.address} onChange={onChange}
                className="w-full rounded-xl border p-2.5" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">City</label>
              <input name="city" value={form.city} onChange={onChange}
                className="w-full rounded-xl border p-2.5" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">State</label>
              <input name="state" value={form.state} onChange={onChange}
                className="w-full rounded-xl border p-2.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Zip Code</label>
              <input name="zip_code" value={form.zip_code} onChange={onChange}
                className="w-full rounded-xl border p-2.5" />
            </div>

            {error && (
              <div className="sm:col-span-2 text-sm text-red-600">
                {typeof error?.data === 'string' ? error.data : 'Failed to update profile.'}
              </div>
            )}

            <div className="sm:col-span-2 mt-2 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {updating ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
