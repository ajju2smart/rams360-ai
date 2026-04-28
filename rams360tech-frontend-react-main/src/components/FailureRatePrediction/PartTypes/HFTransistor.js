import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function HFTransistor() {  
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    style: Yup.object().required("style is required"),
    powerrating: Yup.string().required(" powerrating is required"),
    matching: Yup.object().required("matching is required"),
    application: Yup.string().required("application is required"),
    frequency: Yup.string().required("frequency is required"),
    avoutput: Yup.string().required("avoutput is required"),
    pulsewidth: Yup.string().required("pulsewidth is required"),
    dutyfactor: Yup.string().required("dutyfactor is required"),
    vce: Yup.string().required("vce is required"),
    vceo: Yup.string().required("vceo is required"),
    vsr: Yup.string().required("vsr is required"),
    dt: Yup.string().required("dt is required"),
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
          style: "",
          powerrating: "",
          application: "",
          frequency: "",
          avoutput:"",
          pulsewidth:"",
          dutyfactor:"",
          vce: "",
          vceo:"",
          vsr: "",
          matching: "",
          dt: "",
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
                <div>
                  <Row className="pl-3">
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Style</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="style"
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
                              setFieldValue("style", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.style}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="style" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Power Rating</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="powerrating"
                            placeholder="powerrating"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.powerrating}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="powerrating" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Application</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="application"
                            placeholder="application"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.application}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="application" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>DT</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="dt"
                            placeholder="dt"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.dt}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="dt" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Matching</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="matching"
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
                              setFieldValue("matching", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.matching}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="matching" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Frequency</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="frequency"
                            placeholder="frequency"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.frequency}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="frequency" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Average Output Power</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="avoutput"
                            placeholder="Average Output Power"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.avoutput}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="avoutput" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Pulse Width</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="pulsewidth"
                            placeholder="pulsewidth"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.pulsewidth}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="pulsewidth" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Duty Factor</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="dutyfactor"
                            placeholder="dutyfactor"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.dutyfactor}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="dutyfactor" />
                        </Form.Group>
                      </Col>
                      <Col>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Vce</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="vce"
                            placeholder="vce"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.vce}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="vce" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Vceo</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="vceo"
                            placeholder="vceo"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.vceo}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="vceo" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>VSR</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="vsr"
                            placeholder="vsr"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.vsr}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="vsr" />
                        </Form.Group>
                      </Col>
                      <Col></Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label notify="true">Quality</Label>
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
                            value={values.style}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="quality" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
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
                </div>
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
