import React from "react";
import { FaEllipsisV } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import "./ProjectCard.scss";

export default function ProjectCard({ project, onClick, onEdit, onDelete, onOpenProject, onPermissions, canEdit, canDelete }) {
  const status = project.status || "active";
  const statusLabels = { active: "Active", archived: "Archived", review: "In Review" };

  return (
    <div className="project-card" onClick={() => onClick(project)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(project); }}>
      <div className="project-card__header">
        <div className="project-card__title-block">
          <div className="project-card__title">{project.projectName}</div>
          <div className="project-card__id">{project.projectNumber}</div>
        </div>
        <div className="project-card__actions" onClick={(e) => e.stopPropagation()}>
          <span className={`project-card__badge project-card__badge--${status}`}>
            {statusLabels[status]}
          </span>
          <Dropdown>
            <Dropdown.Toggle as="button" className="project-card__menu-btn" bsPrefix="x">
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {canEdit && (
                <Dropdown.Item style={{ textAlign: "center" }} onClick={() => onEdit(project)}>
                  Project Details
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item style={{ textAlign: "center" }} onClick={() => onOpenProject(project)}>
                Open Project
              </Dropdown.Item>
              {canDelete && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item style={{ textAlign: "center" }} className="text-danger" onClick={() => onDelete(project)}>
                    Delete Project
                  </Dropdown.Item>
                </>
              )}
              {canEdit && onPermissions && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item style={{ textAlign: "center" }} onClick={() => onPermissions(project)}>
                    Edit Permission
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div className="project-card__meta">
        <span><strong>Company:</strong> {project.companyId?.companyName || "—"}</span>
        <span><strong>Owner:</strong> {project.projectOwner?.name || "—"}</span>
      </div>
    </div>
  );
}
