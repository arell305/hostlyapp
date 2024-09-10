"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

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
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
    if (!formData.company) errors.company = "company is required.";
    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setLoading(true);
    const errors = validateForm();
    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      try {
        await axios.post(
          "/api/form",
          {
            name: formData.name,
            company: formData.company,
            email: formData.email,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("Form submitted successfully!");
        setFormData({
          name: "",
          email: "",
          company: "",
        });
      } catch (error) {
        setMessage("Error submitting form. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-6 rounded-lg shadow-lg  border-2 border-gray-300 w-[700px]"
    >
      <div className="mb-4">
        <label htmlFor="name" className="block ">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className=" text-sm w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2  focus:border-none "
          placeholder="Enter your full name"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block ">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className=" text-sm w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2  focus:border-none "
          placeholder="Enter your best email"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="company" className="blocke">
          Company
        </label>
        <input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className=" text-sm w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2  focus:border-none "
          placeholder="Enter your company"
        ></input>
        {errors.company && (
          <p className="text-red-500 text-sm">{errors.company}</p>
        )}
      </div>

      <button
        type="submit"
        className="px-6 py-1 rounded font-medium border border-black bg-customLightBlue  transition duration-200 hover:bg-customDarkBlue hover:text-white "
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes("Error")
              ? "text-red-500"
              : "italic text-custom_black"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
