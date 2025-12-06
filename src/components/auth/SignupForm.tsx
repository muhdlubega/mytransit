import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-green-400 mb-2">
          ✓ Account created successfully!
        </div>
        <p className="text-dark-400 text-sm">
          Please check your email to verify your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <Input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
        Create Account
      </Button>
    </form>
  );
};

export default SignupForm;
