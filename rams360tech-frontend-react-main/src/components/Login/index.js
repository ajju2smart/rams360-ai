import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Api from "../../Api.js";
import { useAuth } from "../../context/AuthContext";
import "../../css/Login.scss";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Must be a valid email").required("Email is required"),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)."
    )
    .required("Password is required"),
});

function Login() {
  const { user, setUser } = useAuth();
  const history = useHistory();
  const [passwordShown, setPasswordShown] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      history.replace(user.role === "SuperAdmin" ? "/company" : "/project/list");
    }
  }, [user, history]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setErrorMessage(null);
    try {
      const res = await Api.post(
        "/api/v1/user/login",
        { email: values.email.toLowerCase(), password: values.password },
        { withCredentials: true }
      );
      setUser(res.data.user);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`login-page ${mounted ? "login-page--mounted" : ""}`}>
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__grid" />
      </div>

      <div className="login-layout">
        {/* Left brand panel */}
        {/* <div className="login-brand">
          <div className="login-brand__inner">
            <div className="login-brand__logo">
              <span className="login-brand__logo-mark">P</span>
            </div>
            <h1 className="login-brand__name">ProjectHub</h1>
            <p className="login-brand__tagline">
              Manage projects with clarity and confidence.
            </p>
            <div className="login-brand__feature-list">
              <div className="login-brand__feature">
                <span className="login-brand__feature-dot" />
                Real-time collaboration
              </div>
              <div className="login-brand__feature">
                <span className="login-brand__feature-dot" />
                Advanced analytics
              </div>
              <div className="login-brand__feature">
                <span className="login-brand__feature-dot" />
                Secure & compliant
              </div>
            </div>
          </div>
        </div> */}

        {/* Right form panel */}
        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-card__header">
              <h2 className="login-card__title">RAMS 360</h2>
              <p className="login-card__subtitle">Sign in to your account to continue</p>
            </div>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              validateOnBlur
              validateOnChange={false}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleSubmit: formikSubmit, handleBlur, isSubmitting, errors, touched }) => (
                <form onSubmit={formikSubmit} className="login-form" noValidate>

                  {/* Email field */}
                  <div className={`login-field ${touched.email && errors.email ? "login-field--error" : ""} ${touched.email && !errors.email ? "login-field--valid" : ""}`}>
                    <label className="login-field__label" htmlFor="login-email">
                      Email address
                    </label>
                    <div className="login-field__input-wrap">
                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="login-field__input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span className="login-field__border" />
                    </div>
                    <ErrorMessage name="email">
                      {(msg) => (
                        <span className="login-field__error">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                            <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeLinecap="round" />
                          </svg>
                          {msg}
                        </span>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Password field */}
                  <div className={`login-field ${touched.password && errors.password ? "login-field--error" : ""} ${touched.password && !errors.password ? "login-field--valid" : ""}`}>
                    <label className="login-field__label" htmlFor="login-password">
                      Password
                    </label>
                    <div className="login-field__input-wrap">
                      <input
                        id="login-password"
                        type={passwordShown ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••••"
                        className="login-field__input login-field__input--password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        className="login-field__toggle"
                        onClick={() => setPasswordShown((p) => !p)}
                        aria-label={passwordShown ? "Hide password" : "Show password"}
                        tabIndex={0}
                      >
                        <FontAwesomeIcon icon={passwordShown ? faEyeSlash : faEye} />
                      </button>
                      <span className="login-field__border" />
                    </div>
                    <ErrorMessage name="password">
                      {(msg) => (
                        <span className="login-field__error">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                            <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeLinecap="round" />
                          </svg>
                          {msg}
                        </span>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Server error */}
                  {errorMessage && (
                    <div className="login-error-banner" role="alert">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
                        <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>{errorMessage}</span>
                      <button type="button" className="login-error-banner__close" onClick={() => setErrorMessage(null)} aria-label="Dismiss error">×</button>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`login-submit ${isSubmitting ? "login-submit--loading" : ""}`}
                    disabled={isSubmitting}
                  >
                    <span className="login-submit__text">
                      {isSubmitting ? "Signing in…" : "Sign in"}
                    </span>
                    {!isSubmitting && (
                      <svg className="login-submit__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {isSubmitting && (
                      <span className="login-submit__spinner" />
                    )}
                  </button>

                </form>
              )}
            </Formik>

            {/* <p className="login-card__footer">
              Having trouble signing in?{" "}
              <a href="/support" className="login-card__link">Contact support</a>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;