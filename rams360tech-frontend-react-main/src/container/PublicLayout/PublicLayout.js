import React, { useState, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import SideBar from "../../components/SideBar";
import HeaderNavBar from "../../components/HeaderNavBar";
import RbdIndex from "../../components/HeaderNavBar/RbdIndex";
import ChatbotWidget from "../../components/Chatbot";
import "../../css/SideBar.scss";
import { useAuth } from "../../context/AuthContext";

export const USER_ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  ADMIN: "admin",
  EMPLOYEE: "Employee",
};

const getDefaultRoute = (role) =>
  role === USER_ROLES.SUPER_ADMIN ? "/dashboard" : "/project/list";

// ─── Protected Route ────────────────────────────────────────────────────────
// AuthProvider blocks rendering until auth resolves, so no loading check needed
export const ProtectedRoute = ({
  component: Component,
  roles = [],
  selectedComponent,
  name,
  ...rest
}) => {
  const { user } = useAuth();

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (!user) {
          return <Redirect to={{ pathname: "/login", state: { from: routeProps.location } }} />;
        }

        if (roles.length && !roles.includes(user.role)) {
          return <Redirect to={getDefaultRoute(user.role)} />;
        }

        return (
          <DefaultLayoutWrapper
            component={Component}
            selectedComponent={selectedComponent}
            name={name}
            {...routeProps}
          />
        );
      }}
    />
  );
};

// ─── Public Route ────────────────────────────────────────────────────────────
export const PublicRoute = ({ component: Component, restricted = false, ...rest }) => {
  const { user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        user && restricted ? (
          <Redirect to={getDefaultRoute(user.role)} />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

// ─── Layout Wrapper ──────────────────────────────────────────────────────────
const DefaultLayoutWrapper = ({ component: Component, selectedComponent, name, ...props }) => {
  const { user } = useAuth();
  const openSideBar = props?.location?.state?.state;
  const productId = props?.location?.state?.productId || props?.location?.props?.data?.id;
  const projectId = props?.location?.state?.projectId || props?.computedMatch?.params?.id;

  const [active, setActive] = useState(() => localStorage.getItem("sideBarValue") === "true");

  const toggleActive = () => {
    setActive((prev) => {
      const next = !prev;
      localStorage.setItem("sideBarValue", String(next));
      return next;
    });
  };
  return (
    <div className="app">
      <div className="app-body" style={{ minHeight: "calc(100vh - 123px)" }}>
        <div>
          <SideBar
            onClick={toggleActive}
            value={projectId}
            active={active}
            props={productId}
            openSideBar={openSideBar}
            selectedComponent={selectedComponent}
            userRole={user?.role}
          />

          <HeaderNavBar
            active={active}
            selectedComponent={selectedComponent === "FTA" ? "FTA" : null}
          />

          {name === "RBD" && <RbdIndex active={active} selectedComponent="RBD" />}

          <div className={`site-maincontent home-content${active ? "" : " active"}`}>
            <Suspense fallback={<div>Loading...</div>}>
              <Component {...props} />
            </Suspense>
          </div>

          {/* AI Chatbot — floating widget visible on all authenticated pages */}
          <ChatbotWidget />
        </div>
      </div>
    </div>
  );
};

// ─── Default export (backward compat) ────────────────────────────────────────
const DefaultLayout = (props) => {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <DefaultLayoutWrapper {...props} />;
};

export const LayoutRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => <DefaultLayoutWrapper component={Component} {...props} {...rest} />} />
);

export default DefaultLayout;