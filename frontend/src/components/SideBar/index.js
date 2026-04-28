// SideBar.js (FULL REDESIGN - works with the new SideBar.scss I shared)

import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useHistory, useLocation, useParams } from "react-router-dom";
import classNames from "classnames";
import { Modal, Button, Accordion } from "react-bootstrap";

import Api from "../../Api";
import "../../css/SideBar.scss";

import Relisafe from "../core/Images/Relisafe.png";
import Logo from "../core/Images/logomain.png";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GiBookshelf } from "react-icons/gi";
import {
  faBars,
  faFile,
  faBuildingUser,
  faUser,
  faSuitcase,
  faCircleChevronLeft,
  faChartLine,
  faTableList,
  faBook,
  faFilter,
  faLock,
  faLink,
  faObjectUngroup,
  faFileInvoice,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

const SideBar = ({ onClick, active, value, props, openSideBar, userRole }) => {
  const { user } = useAuth();

  /**
   * IMPORTANT:
   * Your existing layout uses:
   *   active === true  -> collapsed
   *   active === false -> expanded
   * So: isExpanded = !active
   */
  const isExpanded = !active;

  const location = useLocation();

  const history = useHistory();

  const { id } = useParams();
  const projectId = value || id;
  const productId = props;

  const role = user?.role
  const userId = user?._id;

  const state = "open";

  const selectPbsModule = openSideBar?.[1];
  const [selectedModule, setSelectedModule] = useState(
    selectPbsModule ? "pbs" : null
  );

  const [readPermission, setReadPermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();

  // // Theme hue (keeping your existing behavior)
  // // const storedHue = localStorage.getItem("themeHue");
  // // const initialHue = storedHue ? parseInt(storedHue, 10) : 183;
  // const [hue, setHue] = useState(initialHue);
  const [hue, setHue] = useState(194);

  // Modal confirm for Admin / Owner when going to project list
  const [showConfirmation, setShowConfirmation] = useState(false);

  const logout = () => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  };

  const getProjectPermission = () => {
    if (!projectId) return;
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setReadPermission(data?.modules);
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };

  const projectSidebar = () => {
    if (!projectId) return;
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: { userId },
    }).then((res) => {
      setIsOwner(!!res?.data?.data?.isOwner);
      setCreatedBy(res?.data?.data?.createdBy);
    });
  };

  // Keep your selectedModule sync on URL
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes("/pbs/")) setSelectedModule("pbs");
    else if (pathname.includes("/failure-rate-prediction/"))
      setSelectedModule("failureRatePrediction");
    else if (pathname.includes("/mttr/prediction/")) setSelectedModule("mttr");
    else if (pathname.includes("/fmeca/")) setSelectedModule("fmeca");
    else if (pathname.includes("/pmmra/")) setSelectedModule("pmmra");
    else if (pathname.includes("/spare-parts-analysis/"))
      setSelectedModule("sparePartsAnalysis");
    else if (pathname.includes("/safety/")) setSelectedModule("safety");
    else if (pathname.includes("/separate/library/"))
      setSelectedModule("separateLibrary");
    else if (pathname.includes("/connected/library/"))
      setSelectedModule("connectedLibrary");
    else if (pathname.includes("/reports/")) setSelectedModule("reports");
    else if (pathname.includes("/user")) setSelectedModule("user");
    else if (pathname.includes("/project/list")) setSelectedModule("project");
    else if (pathname.includes("/company/admin")) setSelectedModule("user");
    else if (pathname.includes("/company/enquiries")) setSelectedModule("enquiries");
    else if (pathname.includes("/company")) setSelectedModule("company");
    else if (pathname.includes("/theme")) setSelectedModule("theme");
  }, [location.pathname]);

  useEffect(() => {
    if (selectPbsModule === "pbs") setSelectedModule("pbs");
  }, [selectPbsModule]);

  useEffect(() => {
    if (selectedModule) localStorage.setItem("selectedModule", selectedModule);
  }, [selectedModule]);

  // Your project + theme init
  useEffect(() => {
    getProjectPermission();
    projectSidebar();

    const root = document.querySelector(":root");
    root.style.setProperty("--primary-color", `oklch(45.12% 0.267 ${hue})`);
    root.style.setProperty("--secondary-color", `oklch(94.45% 0.03 ${hue})`);
    root.style.setProperty(
      "--Default-color",
      `oklch(70% 0.099 197.36 ${hue})`
    );
    localStorage.setItem("themeHue", hue.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, selectedModule]);

  // Small helper to render consistent items
  const NavItem = ({
    to,
    icon,
    label,
    moduleKey,
    onClick: onItemClick,
    navState,
    exact,
  }) => {
    const linkTo =
      typeof to === "string"
        ? { pathname: to, state: navState }
        : { ...to, state: navState };

    return (
      <div className="sidebar__item">
        <NavLink
          to={linkTo}
          exact={!!exact}
          className="sidebar__link"
          activeClassName="is-active"
          onClick={() => {
            setSelectedModule(moduleKey);
            onItemClick?.();
          }}
        >
          <div className="sidebar__icon">
            <FontAwesomeIcon icon={icon} size="1x" title={label} />
          </div>

          <span className="sidebar__label">{label}</span>

          {/* Tooltip for collapsed mode (only shows when sidebar is collapsed via CSS) */}
          <span className="sidebar__tooltip">{label}</span>
        </NavLink>
      </div>
    );
  };

  // Admin/Owner: Projects click should open confirmation modal
  const handleProjectClickWithConfirm = (e) => {
    // Stop NavLink navigation
    e?.preventDefault?.();
    setShowConfirmation(true);
  };

  const navigateToProject = () => {
    setShowConfirmation(false);
    history.push("/project/list");
    setSelectedModule("project");
  };

  const isAdminLike = role === "admin" || (isOwner === true && createdBy === userId);
  const isEmployee = role === "Employee";
  const isSuperAdmin = role === "SuperAdmin";

  // Memo for permission indices (kept compatible with your existing indexing)
  const permissionMap = useMemo(() => {
    return (readPermission || []).reduce((acc, module) => {
      acc[module.name] = module;
      return acc;
    }, {});
  }, [readPermission]);
  const hasRead = (name) => permissionMap[name]?.read === true;
  const hasWrite = (name) => permissionMap[name]?.write ?? false;

  return (
    <div className={classNames("sidebar", { "is-expanded": isExpanded })}>
      {/* Header */}
      <div className="sidebar__header">
        {
          !active && (
            <div className="sidebar__brand">
              <img src={Logo} alt="Relisafe" className="sidebar__logo" />
              {/* <div className="sidebar__title">RAMS 360</div> */}
            </div>
          )
        }

        <div
          className="sidebar__toggle"
          onClick={() => onClick(!active)}
          role="button"
          tabIndex={0}
        >
          <FontAwesomeIcon icon={active ? faBars : faCircleChevronLeft} />
        </div>
      </div>

      {/* Scroll area */}
      <div className="sidebar__content">
        {/* SUPER ADMIN */}
        {isSuperAdmin ? (
          <>
            <NavItem
              to="/company"
              icon={faBuildingUser}
              label="Company"
              moduleKey="company"
            />
            <NavItem
              to="/company/admin"
              icon={faUser}
              label="Users"
              moduleKey="user"
            />

            <NavItem
              to="/company/enquiries"
              icon={faUser}
              label="Enquiries"
              moduleKey="enquiries"
            />
            <hr className="sidebar__divider" />
          </>
        ) : null}

        {/* ADMIN / OWNER */}
        {isAdminLike ? (
          <>
            {!projectId && (
              <NavItem to="/user" icon={faUser} label="Users" moduleKey="user" />
            )}

            {/* Projects with confirmation */}
            <div className="sidebar__item">
              <NavLink
                to="/project/list"
                className="sidebar__link"
                activeClassName="is-active"
                onClick={(e) => {
                  setSelectedModule("project");
                  handleProjectClickWithConfirm(e);
                }}
              >
                <div className="sidebar__icon">
                  <FontAwesomeIcon icon={faFile} size="1x" title="Projects" />
                </div>
                <span className="sidebar__label">Projects</span>
                <span className="sidebar__tooltip">Projects</span>
              </NavLink>
            </div>

            <NavItem
              to="/theme"
              icon={faChartSimple}
              label="Theme"
              moduleKey="theme"
            />

            <hr className="sidebar__divider" />

            {/* Project Modules */}
            {projectId ? (
              <>
                <NavItem
                  to={`/pbs/${projectId}`}
                  icon={faSuitcase}
                  label="PBS"
                  moduleKey="pbs"
                  navState={{ projectId, state }}
                />

                <NavItem
                  to={`/failure-rate-prediction/${projectId}`}
                  icon={faChartLine}
                  label="Failure Rate Prediction"
                  moduleKey="failureRatePrediction"
                  navState={{ projectId, state }}
                />

                <NavItem
                  to={`/mttr/prediction/${projectId}`}
                  icon={faSuitcase}
                  label="MTTR Prediction"
                  moduleKey="mttr"
                  navState={{ projectId, productId, state }}
                />

                <NavItem
                  to={`/fmeca/${projectId}`}
                  icon={faTableList}
                  label="FMECA"
                  moduleKey="fmeca"
                  navState={{ projectId, productId, state }}
                />

                <NavItem
                  to={`/pmmra/${projectId}`}
                  icon={faBook}
                  label="PM MRA"
                  moduleKey="pmmra"
                  navState={{ projectId, productId, state }}
                />

                <NavItem
                  to={`/spare-parts-analysis/${projectId}`}
                  icon={faFilter}
                  label="Spare Parts Analysis"
                  moduleKey="sparePartsAnalysis"
                  navState={{ projectId, productId, state }}
                />

                <NavItem
                  to={`/safety/${projectId}`}
                  icon={faLock}
                  label="Safety"
                  moduleKey="safety"
                  navState={{ projectId, productId, state }}
                />

                {/* Libraries accordion */}
                <Accordion className="accordion-style" defaultActiveKey={null}>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <GiBookshelf size={26} style={{ marginRight: 10 }} />
                      <span className="sidebar__label">Libraries</span>
                      <span className="sidebar__tooltip">Libraries</span>
                    </Accordion.Header>

                    <Accordion.Body>
                      <NavItem
                        to={`/separate/library/${projectId}`}
                        icon={faObjectUngroup}
                        label="Separated Library"
                        moduleKey="separateLibrary"
                        navState={{ projectId, productId, state }}
                      />

                      <NavItem
                        to={`/connected/library/${projectId}`}
                        icon={faLink}
                        label="Connected Library"
                        moduleKey="connectedLibrary"
                        navState={{ projectId, state }}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                <NavItem
                  to={`/reports/${projectId}`}
                  icon={faFileInvoice}
                  label="Reports"
                  moduleKey="reports"
                  navState={{ projectId, productId, state }}
                />
              </>
            ) : null}
          </>
        ) : null}

        {/* EMPLOYEE */}
        {isEmployee ? (
          <>
            {!projectId && (
              <NavItem to="/user" icon={faUser} label="Users" moduleKey="user" />
            )}

            <NavItem
              to={{
                pathname: "/project/list",
                state: {
                  projectread: permissionMap["Projects"]?.read ?? false,
                  projectWrite: permissionMap["Projects"]?.write ?? false,
                },
              }}
              icon={faFile}
              label="Projects"
              moduleKey="project"
            />

            <hr className="sidebar__divider" />

            {projectId ? (
              <>
                {hasRead("PBS") && (
                  <NavItem
                    to={`/pbs/${projectId}`}
                    icon={faSuitcase}
                    label="PBS"
                    moduleKey="pbs"
                    navState={{
                      projectId,
                      pbsRead: hasRead("PBS"),
                      pbsWrite: hasWrite("PBS"),
                      state,
                    }}
                  />
                )}

                {hasRead("Failure Rate Prediction") && (
                  <NavItem
                    to={`/failure-rate-prediction/${projectId}`}
                    icon={faChartLine}
                    label="Failure Rate Prediction"
                    moduleKey="failureRatePrediction"
                    navState={{
                      projectId,
                      frpWrite: hasWrite("Failure Rate Prediction"),
                      state,
                    }}
                  />
                )}

                {hasRead("MTTR Prediction") && (
                  <NavItem
                    to={`/mttr/prediction/${projectId}`}
                    icon={faSuitcase}
                    label="MTTR Prediction"
                    moduleKey="mttr"
                    navState={{
                      projectId,
                      productId,
                      mttrWrite: hasWrite("MTTR Prediction"),
                      state,
                    }}
                  />
                )}

                {hasRead("FMECA") && (
                  <NavItem
                    to={`/fmeca/${projectId}`}
                    icon={faTableList}
                    label="FMECA"
                    moduleKey="fmeca"
                    navState={{
                      projectId,
                      productId,
                      fmecaWrite: hasWrite("FMECA"),
                      state,
                    }}
                  />
                )}

                {hasRead("PM MRA") && (
                  <NavItem
                    to={`/pmmra/${projectId}`}
                    icon={faBook}
                    label="PM MRA"
                    moduleKey="pmmra"
                    navState={{
                      projectId,
                      productId,
                      pmmraWrite: hasWrite("PM MRA"),
                      state,
                    }}
                  />
                )}

                {hasRead("Spare Part Analysis") && (
                  <NavItem
                    to={`/spare-parts-analysis/${projectId}`}
                    icon={faFilter}
                    label="Spare Parts Analysis"
                    moduleKey="sparePartsAnalysis"
                    navState={{
                      projectId,
                      productId,
                      spaWrite: hasWrite("Spare Part Analysis"),
                      state,
                    }}
                  />
                )}

                {hasRead("Safety") && (
                  <NavItem
                    to={`/safety/${projectId}`}
                    icon={faLock}
                    label="Safety"
                    moduleKey="safety"
                    navState={{
                      projectId,
                      productId,
                      safetyWrite: hasWrite("Safety"),
                      state,
                    }}
                  />
                )}

                {/* Libraries (permission combos) */}
                {(hasRead("Seprate Library") || hasRead("Connected Library")) && (
                  <Accordion className="accordion-style" defaultActiveKey={null}>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <GiBookshelf size={26} style={{ marginRight: 10 }} />
                        <span className="sidebar__label">Libraries</span>
                        <span className="sidebar__tooltip">Libraries</span>
                      </Accordion.Header>

                      <Accordion.Body>
                        {hasRead("Seprate Library") && (
                          <NavItem
                            to={`/separate/library/${projectId}`}
                            icon={faObjectUngroup}
                            label="Separated Library"
                            moduleKey="separateLibrary"
                            navState={{
                              projectId,
                              productId,
                              safetyWrite: hasWrite("Seprate Library"),
                              state,
                            }}
                          />
                        )}

                        {hasRead("Connected Library") && (
                          <NavItem
                            to={`/connected/library/${projectId}`}
                            icon={faLink}
                            label="Connected Library"
                            moduleKey="connectedLibrary"
                            navState={{
                              projectId,
                              productId,
                              safetyWrite: hasWrite("Connected Library"),
                              state,
                            }}
                          />
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )}

                {hasRead("Reports") && (
                  <NavItem
                    to={`/reports/${projectId}`}
                    icon={faFileInvoice}
                    label="Reports"
                    moduleKey="reports"
                    navState={{
                      projectId,
                      productId,
                      reportsWrite: hasWrite("Reports"),
                      reportsRead: hasRead("Reports"),
                      state,
                    }}
                  />
                )}
              </>
            ) : null}
          </>
        ) : null}

        {/* Confirmation Modal */}
        <Modal
          show={showConfirmation}
          onHide={() => setShowConfirmation(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to navigate to the project list?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={navigateToProject}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default SideBar;
