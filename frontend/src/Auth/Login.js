import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for redirection
import Logo from "../Assets/Logo/DarkLogo.png";

const Login = () => {
  const [loginError, setLoginError] = useState(null); // To store login error message
  const navigate = useNavigate(); // For redirection after login

  // Yup Validation Schema
  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // Form Submit Handler
  const handleSubmit = (values, { setSubmitting }) => {
    const { username, password } = values;
    const url = `${process.env.REACT_APP_BASE_URL}/getAuth?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.login === true) {
          setLoginError(null); // Clear any previous error
          // Redirect to home page on successful login
          navigate("/");
          localStorage.setItem("isAuth", "true");
        } else {
          // If login is false, show an error
          setLoginError("Credentials are wrong. Please try again.");
        }
        setSubmitting(false);
      })
      .catch((error) => {
        console.error("Error during login:", error);
        setLoginError("Something went wrong. Please try again.");
        setSubmitting(false);
      });
  };

  return (
    <div className="flex justify-center items-center h-screen py-12">
      <div className="fixed top-0 left-0 right-0 h-20 bg-gray-800 text-white flex items-center justify-between px-2 z-50 shadow-lg">
        <div>
          <img src={Logo} className="w-36 object-cover" alt="Logo-Opsight" />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <Formik
          initialValues={{
            username: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Username</label>
                <Field
                  type="text"
                  name="username"
                  className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your username"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Display login error if exists */}
              {loginError && (
                <div className="text-red-500 text-sm mb-4">{loginError}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 disabled:bg-gray-300 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;