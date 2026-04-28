import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext"; 
export default function Rotating() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    type: Yup.object().required("type is required"),
    size: Yup.object().required(" size is required"),
    piofbrushes: Yup.object().required("piofbrushes is required"),
    time: Yup.object().required("time is required"),
    dt: Yup.string().required("dt is required"),
    operatingt: Yup.object().required("operatingt is required"),
    ratingt: Yup.string().required("ratingt is required"),
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
          size: "",
          piofbrushes: "",
          time: "",
          dt: "",
          operatingt: "",
          ratingt: "",
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
                        <Label>Dt</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="dt"
                            placeholder="Dt"
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
                        <Label>Size</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="size"
                            placeholder="size"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.size}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="size" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label># Of Brushes</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="piofbrushes"
                            placeholder="# Of Brushes"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.piofbrushes}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="piofbrushes" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Col className="mt-3" xs={12} lg={6} md={6}>
                      <Label>Time</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="time"
                          placeholder="Time"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.time}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="time" />
                      </Form.Group>
                    </Col>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Operating T</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="operatingt"
                            placeholder="operatingt"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.operatingt}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="operatingt" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Rating T</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="ratingt"
                            placeholder="Rating T"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.ratingt}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="ratingt" />
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
