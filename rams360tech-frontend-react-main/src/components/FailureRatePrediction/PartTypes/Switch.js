import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function Switch() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    typeofswitch: Yup.object().required("typeofswitch is required"),
    contactform: Yup.object().required(" contactform is required"),
    loadtype: Yup.object().required("loadtype is required"),
    activecontacts: Yup.string().required("activecontacts is required"),
    cycles: Yup.object().required("cycles is required"),
    ioper: Yup.string().required("ioper is required"),
    irated: Yup.string().required("irated is required"),
    csr: Yup.string().required("csr is required"),
    quality: Yup.object().required("quality is required"),
  });

  const getMTB = () => {
    setShowModal(false);
  };

  return (
    <div className="nprdmodal">
      <Formik
        enableReinitialize={true}
        initialValues={{
          typeofswitch: "",
          contactform: "",
          loadtype: "",
          activecontacts: "",
          cycles: "",
          ioper: "",
          irated: "",
          csr: "",
          quality: "",
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
                        <Label>Type Of Switch</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="typeofswitch"
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
                              setFieldValue("typeofswitch", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.typeofswitch}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="typeofswitch" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Contact Form</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="contactform"
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
                              setFieldValue("contactform", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.contactform}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="contactform" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label notify="true">Load Type</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="loadtype"
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
                              setFieldValue("loadtype", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.loadtype}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="loadtype" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label># Of Active Contacts</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="activecontacts"
                            placeholder="activecontacts"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.activecontacts}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="activecontacts" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Cycles/Hours</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="cycles"
                            placeholder="cycles/hours"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.cycles}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="cycles" />
                        </Form.Group>
                      </Col>
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
                            value={values.quality}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="quality" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>I oper</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="ioper"
                            placeholder="ioper"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.ioper}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="ioper" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>I Rated</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="irated"
                            placeholder="irated"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.irated}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="irated" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Col className="mt-3" xs={12} lg={6} md={6}>
                      <Label>CSR</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="csr"
                          placeholder="csr"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.csr}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="csr" />
                      </Form.Group>
                    </Col>
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
