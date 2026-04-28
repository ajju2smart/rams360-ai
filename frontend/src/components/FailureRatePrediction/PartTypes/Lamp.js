import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function Lamp() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    application: Yup.object().required("application is required"),
    voltagerated: Yup.string().required("voltagerated is required"),
    utilization: Yup.string().required("utilization is required"),
  });

  const getMTB = () => {
    setShowModal(false);
  };

  return (
    <div className="nprdmodal">
      <Formik
        enableReinitialize={true}
        initialValues={{
          application: "",
          voltagerated: "",
          utilization: "",
        }}
        validationSchema={milSchema}
        onSubmit={(values, { resetForm }) => getMTB(values, { resetForm })}
      >
        {(formik) => {
          const { values, handleChange, handleSubmit, handleBlur, isValid, mainProductForm, setFieldValue } = formik;
          return (
            <form onSubmit={handleSubmit}>
              <div>
                <div>
                  <Row className="pl-3">
                    <Row className="mt-3">
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Voltage Rated</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="voltagerated"
                            placeholder="voltagerated"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.voltagerated}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="voltagerated" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Application</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="application"
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
                              setFieldValue("application", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.application}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="application" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Utilization</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="utilization"
                            placeholder="utilization"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.utilization}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="utilization" />
                        </Form.Group>
                      </Col>
                      <Col></Col>
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
