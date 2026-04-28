import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function Connection() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    tooltype: Yup.object().required("tooltype is required"),
    handsolder: Yup.string().required(" handsolder is required"),
    crimp: Yup.string().required("crimp is required"),
    weld: Yup.string().required("weld is required"),
    solderlesswrap: Yup.string().required("solderlesswrap is required"),
    wrapsolt: Yup.string().required("wrapsolt is required"),
    cliptemination: Yup.string().required("cliptemination is required"),
    reflowsolder: Yup.string().required("reflowsolder is required"),
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
          tooltype: "",
          handsolder: "",
          weld: "",
          solderlesswrap: "",
          wrapsolt: "",
          cliptemination: "",
          crimp: "",
          reflowsolder: "",
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
                        <Label>Tool Type</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="tooltype"
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
                              setFieldValue("tooltype", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.tooltype}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="tooltype" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Hand Solder</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="handsolder"
                            placeholder="Hand Solder Qty"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.handsolder}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="handsolder" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Crimp</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="crimp"
                            placeholder="Crimp Qty"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.crimp}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="crimp" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Weld</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="weld"
                            placeholder="Weld Qty"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.weld}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="weld" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Solderless Wrap</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="solderlesswrap"
                            placeholder="Solderless Wrap Qty"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.solderlesswrap}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="solderlesswrap" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Wrapped And Soldered</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="wrapsolt"
                            placeholder="Wrapped And Soldered Qty"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.wrapsolt}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="wrapsolt" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Clip Termination</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="cliptemination"
                            placeholder="Clip Termination Qty"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.cliptemination}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="cliptemination" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Reflow Solder</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="reflowsolder"
                            placeholder="reflowsolder"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.reflowsolder}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="reflowsolder" />
                        </Form.Group>
                      </Col>
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
                            value={values.quality}
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
