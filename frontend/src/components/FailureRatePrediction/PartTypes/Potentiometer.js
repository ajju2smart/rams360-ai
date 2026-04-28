import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function Potentiometer() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    style: Yup.object().required("style is required"),
    resistance: Yup.string().required(" resistance is required"),
    woper: Yup.string().required("woper is required"),
    wratio: Yup.string().required("wratio is required"),
    vrated: Yup.object().required("vrated is required"),
    resistors: Yup.string().required("resistors is required"),
    t1: Yup.string().required("t1 is required"),
    t2: Yup.string().required("t2 is required"),
    s1: Yup.string().required("s1 is required"),
    s2: Yup.string().required("s2 is required"),
    dt: Yup.string().required("dt is required"),
    psr: Yup.string().required("psr is required"),
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
          resistance: "",
          woper: "",
          wratio: "",
          vrated: "",
          resistors: "",
          t1: "",
          t2: "",
          s1: "",
          s2: "",
          dt: "",
          psr: "",
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
                  <Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label notify="true">Style</Label>
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
                        <Label>Resistance</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="resistance"
                            placeholder="resistance"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.resistance}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="resistance" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>W oper</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="woper"
                            placeholder="woper"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.woper}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="woper" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>W Ratio</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="wratio"
                            placeholder="wratio"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.wratio}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="wratio" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>PSR</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="psr"
                            placeholder="psr"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.psr}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="psr" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Resistance</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="resistance"
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
                              setFieldValue("resistance", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.resistance}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="resistance" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>V Rated</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="vrated"
                            placeholder="vrated"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.vrated}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="vrated" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>T1</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="t1"
                            placeholder="t1"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.t1}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="t1" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>T2</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="t2"
                            placeholder="t2"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.t2}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="t2" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>S1</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="s1"
                            placeholder="s1"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.s1}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="s1" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>S2</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="s2"
                            placeholder="s2"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.s2}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="s2" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
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
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
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
