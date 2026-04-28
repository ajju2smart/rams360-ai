import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function IcMemory() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    type: Yup.object().required("type is required"),
    tech: Yup.object().required("tech is required"),
    piofbits: Yup.string().required("piofbits is required"),
    range: Yup.string().required("range is required"),
    package: Yup.object().required("package is required"),
    piofpins: Yup.string().required("piofpins is required"),
    deltadjc: Yup.string().required("deltadjc is required"),
    vdd: Yup.string().required("vdd is required"),
    vcc: Yup.string().required("vcc is required"),
    learningfactor: Yup.string().required("learningfactor is required"),
    quality: Yup.object().required("quality is required"),
    piq: Yup.string().required("piq is required"),
  });

  const getMTB = () => {
    setShowModal(false);
  };

  return (
    <div className="nprdmodal">
      <Formik
        enableReinitialize={true}
        initialValues={{
          type: "",
          tech: "",
          piofbits: "",
          range: "",
          package: "",
          piofpins: "",
          deltadjc: "",
          vdd: "",
          vcc: "",
          learningfactor: "",
          quality: "",
          piq: "",
        }}
        validationSchema={milSchema}
        onSubmit={(values, { resetForm }) => getMTB(values, { resetForm })}
      >
        {(formik) => {
          const { values, handleChange, handleSubmit, handleBlur, isValid, mainProductForm, setFieldValue } = formik;
          return (
            <form onSubmit={handleSubmit} className="d-flex justify-content-center align-items-center">
              <div>
                <Row className="pl-3">
                  <Row className="mt-3">
                    <Col xs={12} lg={6} md={6}>
                      <Label>Type</Label>
                      <Form.Group>
                        <Select
                          className="mt-1"
                          type="select"
                          name="type"
                          styles={customStyles}
                          isDisabled={
                            writePermission === true ||
                            writePermission === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId)
                              ? null
                              : "disabled"
                          }
                          placeholder="Select"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            setFieldValue("type", e);
                          }}
                          options={[
                            {
                              value: "to map",
                              label: "to map",
                            },
                          ]}
                          value={values.type}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="type" />
                      </Form.Group>
                    </Col>
                    <Col xs={12} lg={6} md={6}>
                      <Label>Tech</Label>
                      <Form.Group>
                        <Select
                          className="mt-1"
                          type="select"
                          name="tech"
                          styles={customStyles}
                          isDisabled={
                            writePermission === true ||
                            writePermission === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId)
                              ? null
                              : "disabled"
                          }
                          placeholder="Select"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            setFieldValue("tech", e);
                          }}
                          options={[
                            {
                              value: "to map",
                              label: "to map",
                            },
                          ]}
                          value={values.tech}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="tech" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col xs={12} lg={6} md={6}>
                      <Label notify="true"># of bits</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="piofbits"
                          placeholder="piofbits"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.piofbits}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="piofbits" />
                      </Form.Group>
                    </Col>
                    <Col xs={12} lg={6} md={6}>
                      <Label>Range</Label>
                      <Form.Group>
                        <Select
                          className="mt-1"
                          type="select"
                          name="range"
                          styles={customStyles}
                          isDisabled={
                            writePermission === true ||
                            writePermission === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId)
                              ? null
                              : "disabled"
                          }
                          placeholder="Select"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            setFieldValue("range", e);
                          }}
                          options={[
                            {
                              value: "to map",
                              label: "to map",
                            },
                          ]}
                          value={values.range}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="range" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col xs={12} lg={6} md={6}>
                      <Label notify="true">Package</Label>
                      <Form.Group>
                        <Select
                          className="mt-1"
                          type="select"
                          name="package"
                          styles={customStyles}
                          isDisabled={
                            writePermission === true ||
                            writePermission === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId)
                              ? null
                              : "disabled"
                          }
                          placeholder="Select"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            setFieldValue("package", e);
                          }}
                          options={[
                            {
                              value: "to map",
                              label: "to map",
                            },
                          ]}
                          value={values.package}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="package" />
                      </Form.Group>
                    </Col>
                    <Col xs={12} lg={6} md={6}>
                      <Label># of pins</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="piofpins"
                          placeholder="piofpins"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.piofpins}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="piofpins" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col xs={12} lg={6} md={6}>
                      <Label>Delta djc</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="deltadjc"
                          placeholder="deltadjc"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.deltadjc}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="deltadjc" />
                      </Form.Group>
                    </Col>
                    <Col xs={12} lg={6} md={6}>
                      <Label>Vdd</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="vdd"
                          placeholder="vdd"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.vdd}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="vdd" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col xs={12} lg={6} md={6}>
                      <Label>Vcc</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="vcc"
                          placeholder="vcc"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.vcc}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="vcc" />
                      </Form.Group>
                    </Col>
                    <Col xs={12} lg={6} md={6}>
                      <Label>Learning Factor</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="learningfactor"
                          placeholder="Learning Factor"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.learningfactor}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="learningfactor" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col xs={12} lg={6} md={6}>
                      <Label>Quality</Label>
                      <Form.Group>
                        <Select
                          className="mt-1"
                          type="select"
                          name="quality"
                          styles={customStyles}
                          isDisabled={
                            writePermission === true ||
                            writePermission === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId)
                              ? null
                              : "disabled"
                          }
                          placeholder="Select"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            setFieldValue("quality", e);
                          }}
                          options={[
                            {
                              value: "to map",
                              label: "to map",
                            },
                          ]}
                          value={values.quality}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="quality" />
                      </Form.Group>
                    </Col>
                    <Col xs={12} lg={6} md={6}>
                      <Label>PI q</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="piq"
                          placeholder="piq"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.piq}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="piq" />
                      </Form.Group>
                    </Col>
                  </Row>
                </Row>
                <div className="d-flex w-100 justify-content-center align-items-center ">
                  <Button className="buttoncal" xs={12} md={6} onClick={handleSubmit}>
                    Calculate
                  </Button>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
