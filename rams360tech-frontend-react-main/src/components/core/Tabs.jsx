import React, { useState, useRef } from "react";
import "./Tabs.scss";

const TabsContext = React.createContext(null);

export const Tabs = ({ defaultActive, children, onChange }) => {
  const [active, setActive] = useState(defaultActive);
  const handleChange = (id) => {
    setActive(id);
    if (onChange) onChange(id);
  };
  return (
    <TabsContext.Provider value={{ active, setActive: handleChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList = ({ children }) => {
  const tabsRef = useRef([]);
  const handleKeyDown = (e) => {
    const tabs = tabsRef.current.filter(Boolean);
    const i = tabs.findIndex((el) => el === document.activeElement);
    if (i === -1) return;
    let next;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  };
  return (
    <div role="tablist" className="tab-list" onKeyDown={handleKeyDown}>
      {React.Children.map(children, (child, idx) =>
        React.cloneElement(child, { ref: (el) => (tabsRef.current[idx] = el) })
      )}
    </div>
  );
};

export const Tab = React.forwardRef(({ id, count, children }, ref) => {
  const { active, setActive } = React.useContext(TabsContext);
  const isActive = active === id;
  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      id={`tab-${id}`}
      tabIndex={isActive ? 0 : -1}
      className={`tab ${isActive ? "tab--active" : ""}`}
      onClick={() => setActive(id)}
    >
      {children}
      {count != null && <span className="tab__count">{count}</span>}
    </button>
  );
});

export const TabPanel = ({ id, children }) => {
  const { active } = React.useContext(TabsContext);
  if (active !== id) return null;
  return (
    <div role="tabpanel" id={`tabpanel-${id}`} aria-labelledby={`tab-${id}`} className="tab-panel">
      {children}
    </div>
  );
};
