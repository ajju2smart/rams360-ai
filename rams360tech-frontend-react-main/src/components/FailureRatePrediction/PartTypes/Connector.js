import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function Connector() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    configuration: Yup.object().required("configuration is required"),
    ampers: Yup.object().required("ampers is required"),
    contactsize: Yup.string().required("contactsize is required"),
    cycles: Yup.string().required("cycles is required"),
    insertmaterial: Yup.string().required("insertmaterial is required"),
    activecontacts: Yup.string().required("activecontacts is required"),
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
          configuration: "",
          ampers: "",
          contactsize: "",
          cycles: "",
          insertmaterial: "",
          activecontacts: "",
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
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Configuration</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="configuration"
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
                              setFieldValue("configuration", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.configuration}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="configuration" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Ampers/Contacts</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="ampers"
                            placeholder="ampers/contacts"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.ampers}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="ampers" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Contact Size</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="contactsize"
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
                              setFieldValue("contactsize", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.contactsize}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="contactsize" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Cycles/1000hrs</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="cycles"
                            placeholder="cycles/1000hrs"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.cycles}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="cycles" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Insert Material</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="insertmaterial"
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
                              setFieldValue("insertmaterial", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.insertmaterial}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="insertmaterial" />
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
                            placeholder="# Of Active Contacts"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.activecontacts}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="activecontacts" />
                        </Form.Group>
                      </Col>
                    </Row>
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
