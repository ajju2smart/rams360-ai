import React, { useState } from "react";
import { Tabs, TabList, Tab, TabPanel } from "../core/Tabs";
import Button from "../core/Button";
import GeneralTab from "./tabs/GeneralTab";
import FailureTab from "./tabs/FailureTab";
import FMECATab from "./tabs/FMECATab";
import MRATab from "./tabs/MRATab";
import SparePartsTab from "./tabs/SparePartsTab";
import SafetyTab from "./tabs/SafetyTab";
import "./ComponentDetail.scss";

export default function ComponentDetail({ component, onSave, onCancel, projectId }) {
  const [formData, setFormData] = useState(component || {});
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="component-detail">
      <div className="component-detail__header">
        <div>
          <h1 className="component-detail__title">{formData.name || "New Component"}</h1>
          <p className="component-detail__subtitle">
            {formData.partNumber && <>Part: <strong>{formData.partNumber}</strong> · </>}
            {formData.category}
          </p>
        </div>
        <div className="component-detail__actions">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultActive="general">
        <TabList>
          <Tab id="general">General</Tab>
          <Tab id="failure">Failure Prediction</Tab>
          <Tab id="fmeca" count={formData.fmecaModes?.length}>FMECA</Tab>
          <Tab id="mra">MRA / RCM</Tab>
          <Tab id="spare">Spare Parts</Tab>
          <Tab id="safety" count={formData.hazards?.length}>Safety</Tab>
        </TabList>

        <TabPanel id="general"><GeneralTab data={formData} onChange={updateField} projectId={projectId} /></TabPanel>
        <TabPanel id="failure"><FailureTab data={formData} onChange={updateField} projectId={projectId} /></TabPanel>
        <TabPanel id="fmeca"><FMECATab data={formData} onChange={updateField} projectId={projectId} /></TabPanel>
        <TabPanel id="mra"><MRATab data={formData} onChange={updateField} projectId={projectId} /></TabPanel>
        <TabPanel id="spare"><SparePartsTab data={formData} onChange={updateField} projectId={projectId} /></TabPanel>
        <TabPanel id="safety"><SafetyTab data={formData} onChange={updateField} projectId={projectId} /></TabPanel>
      </Tabs>
    </div>
  );
}
