import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91',
    mobile: '',

    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    if (formData.password != formData.confirmPassword) {
      alert("password do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          agreeToTerms: formData.agreeToTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "SignUp failed");
        return;
      }

      alert("Signup successful! Please Login.");
      navigate("/signin");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

      {/* Signup Form Container */}
      <div className="relative w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-white/60 text-sm">
              Join the College Connect academic community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Mobile */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Mobile Number
              </label>

              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-28 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option className="bg-gray-900 text-white" value="+91">IN +91</option>
                  <option className="bg-gray-900 text-white" value="+1">US +1</option>
                  <option className="bg-gray-900 text-white" value="+44">UK +44</option>
                  <option className="bg-gray-900 text-white" value="+61">AUS +61</option>
                </select>

                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-400 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="col-span-2 flex items-start">
              <label className="flex items-start text-sm text-white/70 cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className="ml-2 group-hover:text-white transition-colors duration-300">
                  I agree to the{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 shadow-lg shadow-blue-600/30"
              >
                {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : "Create Account"}
              </button>
            </div>

            {/* Login Link */}
            <div className="col-span-2 text-center text-sm text-white/60">
              Already have an account?{' '}
              <a href="/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">
                Sign In
              </a>
            </div>

          </form>
        </div>

        {/* Bottom Note */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            By creating an account, you agree to our community guidelines
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
