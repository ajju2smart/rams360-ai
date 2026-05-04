import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import Label from "../../LabelComponent";
import { Electronic, Mechanical } from "../../core/partTypeCategory";
import { customStyles } from "../../core/select";

const CATEGORY_OPTIONS = Object.freeze([
  { value: "Assembly", label: "Assembly" },
  { value: "Electronic", label: "Electronic" },
  { value: "Mechanical", label: "Mechanical" },
]);

const ENV_OPTIONS = Object.freeze([
  { value: null, label: "None" },
  { value: "GB", label: "Ground Benign (GB)" },
  { value: "GF", label: "Ground Fixed (GF)" },
  { value: "GM", label: "Ground Mobile (GM)" },
  { value: "NS", label: "Naval Sheltered (NS)" },
  { value: "NU", label: "Naval Unsheltered (NU)" },
  { value: "AIC", label: "Airborne Inhabited Cargo (AIC)" },
  { value: "AIF", label: "Airborne Inhabited Fighter (AIF)" },
  { value: "AUC", label: "Airborne Uninhabited Cargo (AUC)" },
  { value: "AUF", label: "Airborne Uninhabited Fighter (AUF)" },
  { value: "ARW", label: "Airborne Rotary Winged (ARW)" },
  { value: "SF", label: "Space Flight (SF)" },
  { value: "MF", label: "Missile Flight (MF)" },
  { value: "ML", label: "Missile Launch (ML)" },
  { value: "CL", label: "Cannon Launch (CL)" },
]);

export default function GeneralTab({ data, onChange }) {
  const [category, setCategory] = useState(
    data.category
      ? { value: data.category, label: data.category }
      : { value: "Assembly", label: "Assembly" }
  );

  const handleCategoryChange = (e) => {
    setCategory(e);
    onChange("category", e.value);
    onChange("partType", "");
  };

  const partTypeOptions = category?.value === "Electronic" ? Electronic : Mechanical;

  return (
    <div className="form-section">
      <div className="form-section__header">General Information</div>
      <div className="form-section__body">
        <Row className="g-3 mb-4">
          <Col md={6}>
            <Form.Group>
              <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Name</Label>
              <Form.Control
                type="text"
                name="productName"
                placeholder="Product name"
                value={data.productName || ""}
                onChange={(e) => onChange("productName", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Part Number</Label>
              <Form.Control
                type="text"
                name="partNumber"
                placeholder="Part number"
                value={data.partNumber || ""}
                onChange={(e) => onChange("partNumber", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Quantity</Label>
              <Form.Control
                type="number"
                min="0"
                step="any"
                name="quantity"
                placeholder="Qty"
                value={data.quantity || ""}
                onChange={(e) => onChange("quantity", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Label className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Reference / Position</Label>
              <Form.Control
                type="text"
                name="referenceOrPosition"
                placeholder="Ref or position"
                value={data.referenceOrPosition || ""}
                onChange={(e) => onChange("referenceOrPosition", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Category</Label>
              <Select
                value={category}
                name="category"
                placeholder="Select category"
                onChange={handleCategoryChange}
                options={CATEGORY_OPTIONS}
                styles={customStyles}
              />
            </Form.Group>
          </Col>
          {category?.value !== "Assembly" && (
            <Col md={6}>
              <Form.Group>
                <Label notify style={{ fontSize: 12, fontWeight: 600 }}>Part Type</Label>
                <Select
                  value={data.partType ? { value: data.partType, label: data.partType } : null}
                  placeholder="Select part type"
                  name="partType"
                  className="mt-1"
                  onChange={(e) => onChange("partType", e.value)}
                  options={[{
                    options: partTypeOptions
                      .map(l => ({ value: l.value, label: l.label }))
                      .sort((a, b) => a.label.localeCompare(b.label)),
                  }]}
                  styles={customStyles}
                />
              </Form.Group>
            </Col>
          )}
        </Row>

        <div className="form-section__header" style={{ margin: "0 calc(var(--space-5) * -1) var(--space-4)", padding: "var(--space-4) var(--space-5)" }}>
          Environment &amp; Temperature
        </div>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Environment</Label>
              <Select
                value={data.environment
                  ? (typeof data.environment === "object" ? data.environment : { value: data.environment, label: data.environment })
                  : null}
                name="environment"
                placeholder="Select environment"
                onChange={(e) => onChange("environment", e)}
                options={ENV_OPTIONS}
                styles={customStyles}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Temperature (°C)</Label>
              <Form.Control
                type="number"
                min="0"
                step="any"
                name="temperature"
                value={data.temperature || ""}
                onChange={(e) => onChange("temperature", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
}
