"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import SingleSubmitButton from "./buttonContainers/SingleSubmitButton";
import LabeledInputField from "./fields/LabeledInputField";
import { useSendContactForm } from "@/hooks/useSendContactForm";
interface FormData {
  name: string;
  email: string;
  company: string;
}

interface Errors {
  name?: string;
  email?: string;
  company?: string;
}

const ContactForm: React.FC = () => {
  const { sendContactForm, isLoading, error, setError } = useSendContactForm();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): Errors => {
    const errors: Errors = {};
    if (!formData.name) errors.name = "Contact person is required.";
    if (!formData.email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid.";
    if (!formData.company) errors.company = "Company is required.";
    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("formData", formData);
    const errors = validateForm();
    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      const success = await sendContactForm({
        fromEmail: formData.email,
        fromName: formData.name,
        fromCompany: formData.company,
      });
      if (success) {
        setMessage("Form submitted successfully!");
        setFormData({
          name: "",
          email: "",
          company: "",
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-lg shadow-lg border w-[700px] bg-cardBackground"
    >
      <LabeledInputField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your full name"
        error={errors.name}
      />

      <LabeledInputField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your best email"
        error={errors.email}
      />
      <LabeledInputField
        label="Company"
        name="company"
        value={formData.company}
        onChange={handleChange}
        placeholder="Enter your company"
        error={errors.company}
      />

      <SingleSubmitButton
        isLoading={isLoading}
        error={error}
        onClick={() => {}}
        disabled={isLoading}
      />
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </form>
  );
};

export default ContactForm;
