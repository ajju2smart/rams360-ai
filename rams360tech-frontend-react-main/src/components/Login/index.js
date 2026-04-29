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
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function Login() {
  const { user, setUser } = useAuth();
  const history = useHistory();
  const [passwordShown, setPasswordShown] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

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
    <div className="rl-page">

      {/* ── LEFT HERO PANEL ── */}
      <div className="rl-hero">
        <div className="rl-hero__inner">

          {/* Brand */}
          <div className="rl-hero__brand">
            <span className="rl-hero__brand-text">RAMS 360</span>
          </div>

          {/* Headline */}
          <h1 className="rl-hero__headline">
            Engineering<br />
            <span className="rl-hero__headline--accent">Reliability</span><br />
            Reimagined
          </h1>

          <p className="rl-hero__sub">
            Unify FMECA, MTTR, Risk Intelligence, and Product Analytics in one
            intelligent platform to drive reliability, reduce downtime, and
            accelerate engineering excellence.
          </p>

          {/* Stats row */}
          <div className="rl-hero__stats">
            <div className="rl-hero__stat">
              <span className="rl-hero__stat-value">99.9%</span>
              <span className="rl-hero__stat-label">PLATFORM UPTIME</span>
            </div>
            <div className="rl-hero__stat">
              <span className="rl-hero__stat-value">Enterprise</span>
              <span className="rl-hero__stat-label">GRADE SECURITY</span>
            </div>
            <div className="rl-hero__stat">
              <span className="rl-hero__stat-value">Global</span>
              <span className="rl-hero__stat-label">ENGINEERING READY</span>
            </div>
          </div>

          {/* Feature pills */}
          <div className="rl-hero__pills">
            <span className="rl-hero__pill">✔ Actionable Insights</span>
            <span className="rl-hero__pill">✔ Predictive Intelligence</span>
            <span className="rl-hero__pill">✔ Scalable &amp; Secure</span>
            <span className="rl-hero__pill">✔ Built for Engineers</span>
          </div>

          {/* Feature cards */}
          <div className="rl-hero__cards">
            <div className="rl-hero__card">
              <span className="rl-hero__card-icon">🛡</span>
              <div>
                <div className="rl-hero__card-title">Enterprise Secure</div>
                <div className="rl-hero__card-desc">Protected with enterprise-grade security and governance.</div>
              </div>
            </div>
            <div className="rl-hero__card">
              <span className="rl-hero__card-icon">⚙</span>
              <div>
                <div className="rl-hero__card-title">AI Powered</div>
                <div className="rl-hero__card-desc">Machine learning that turns data into engineering impact.</div>
              </div>
            </div>
            <div className="rl-hero__card">
              <span className="rl-hero__card-icon">🌐</span>
              <div>
                <div className="rl-hero__card-title">Global Ready</div>
                <div className="rl-hero__card-desc">Built for scale across teams and locations worldwide.</div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="rl-hero__tagline">
            <span className="rl-hero__tagline--accent">Reliable systems. Smarter decisions. Stronger outcomes.</span>{" "}
            Rams360 empowers engineering teams to build a more reliable tomorrow.
          </p>

        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="rl-form-panel">
        <div className="rl-card">

          {/* Logo */}
          <div className="rl-card__logo">
            <span className="rl-card__logo-text">RAMS <span>360</span></span>
          </div>

          <h2 className="rl-card__title">Welcome back!</h2>
          <p className="rl-card__subtitle">Sign in to access your Rams360 dashboard</p>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            validateOnBlur
            validateOnChange={false}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleSubmit: formikSubmit, handleBlur, isSubmitting, errors, touched }) => (
              <form onSubmit={formikSubmit} className="rl-form" noValidate>

                {/* Email */}
                <div className={`rl-field ${touched.email && errors.email ? "rl-field--error" : ""}`}>
                  <label className="rl-field__label" htmlFor="rl-email">Email address</label>
                  <div className="rl-field__wrap">
                    <span className="rl-field__icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12v8H2V4zm0 0l6 5 6-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <input
                      id="rl-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="demo@rams.com"
                      className="rl-field__input"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  <ErrorMessage name="email">
                    {(msg) => <span className="rl-field__error">{msg}</span>}
                  </ErrorMessage>
                </div>

                {/* Password */}
                <div className={`rl-field ${touched.password && errors.password ? "rl-field--error" : ""}`}>
                  <div className="rl-field__label-row">
                    <label className="rl-field__label" htmlFor="rl-password">Password</label>
                    <button type="button" className="rl-field__forgot">Forgot password?</button>
                  </div>
                  <div className="rl-field__wrap">
                    <span className="rl-field__icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input
                      id="rl-password"
                      type={passwordShown ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••••"
                      className="rl-field__input rl-field__input--password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="rl-field__toggle"
                      onClick={() => setPasswordShown((p) => !p)}
                      aria-label={passwordShown ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={passwordShown ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <ErrorMessage name="password">
                    {(msg) => <span className="rl-field__error">{msg}</span>}
                  </ErrorMessage>
                </div>

                {/* Remember me */}
                <label className="rl-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rl-remember__check"
                  />
                  <span className="rl-remember__label">Remember me</span>
                </label>

                {/* Server error */}
                {errorMessage && (
                  <div className="rl-error-banner" role="alert">
                    <span>{errorMessage}</span>
                    <button type="button" onClick={() => setErrorMessage(null)} aria-label="Dismiss">×</button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className={`rl-submit ${isSubmitting ? "rl-submit--loading" : ""}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign in →"}
                </button>

                {/* Divider */}
                <div className="rl-divider"><span>OR</span></div>

                {/* SSO buttons */}
                <button type="button" className="rl-sso rl-sso--microsoft">
                  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                  Continue with Microsoft
                </button>

                <button type="button" className="rl-sso rl-sso--google">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

              </form>
            )}
          </Formik>

          <p className="rl-card__footer">© 2026 Rams360 Engineering Intelligence. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
}

export default Login;
