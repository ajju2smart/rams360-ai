import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function Resistor() {
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
    poper: Yup.string().required("poper is required"),
    pratio: Yup.string().required("pratio is required"),
    characteristic: Yup.object().required("characteristic is required"),
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
          poper: "",
          pratio: "",
          characteristic: "",
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
                <Row className="pl-3">
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
                              value: "RC",
                              label: "RC",
                            },
                            {
                              value: "RCR",
                              label: "RCR",
                            },
                            {
                              value: "RL",
                              label: "RL",
                            },
                            {
                              value: "RLR",
                              label: "RLR",
                            },
                            {
                              value: "RN",
                              label: "RN",
                            },
                            {
                              value: "RN ( R,C or N)",
                              label: "RN ( R,C or N)",
                            },
                            {
                              value: "RD",
                              label: "RD",
                            },
                            {
                              value: "RBR",
                              label: "RBR",
                            },
                            {
                              value: "RB",
                              label: "RB",
                            },
                            {
                              value: "RW",
                              label: "RW",
                            },
                            {
                              value: "RW10",
                              label: "RW10",
                            },
                            {
                              value: "RW11",
                              label: "RW11",
                            },
                            {
                              value: "RW12",
                              label: "RW12",
                            },
                            {
                              value: "RW13",
                              label: "RW13",
                            },
                            {
                              value: "RW14",
                              label: "RW14",
                            },
                            {
                              value: "RW15",
                              label: "RW15",
                            },
                            {
                              value: "RW16",
                              label: "RW16",
                            },
                            {
                              value: "RW20",
                              label: "RW20",
                            },
                            {
                              value: "RW21",
                              label: "RW21",
                            },
                            {
                              value: "RW22",
                              label: "RW22",
                            },
                            {
                              value: "RW23",
                              label: "RW23",
                            },
                            {
                              value: "RW24",
                              label: "RW24",
                            },
                            {
                              value: "RW29",
                              label: "RW29",
                            },
                            {
                              value: "RW30",
                              label: "RW30",
                            },
                            {
                              value: "RW31",
                              label: "RW31",
                            },
                            {
                              value: "RW32",
                              label: "RW32",
                            },
                            {
                              value: "RW33",
                              label: "RW33",
                            },
                            {
                              value: "RW34",
                              label: "RW34",
                            },
                            {
                              value: "RW35",
                              label: "RW35",
                            },
                            {
                              value: "RW36",
                              label: "RW36",
                            },
                            {
                              value: "RW37",
                              label: "RW37",
                            },
                            {
                              value: "RW38",
                              label: "RW38",
                            },
                            {
                              value: "RW39",
                              label: "RW39",
                            },
                            {
                              value: "RW47",
                              label: "RW47",
                            },
                            {
                              value: "RW55",
                              label: "RW55",
                            },
                            {
                              value: "RW56",
                              label: "RW56",
                            },
                            {
                              value: "RW67",
                              label: "RW67",
                            },
                            {
                              value: "RW68",
                              label: "RW68",
                            },
                            {
                              value: "RW69",
                              label: "RW69",
                            },
                            {
                              value: "RW70",
                              label: "RW70",
                            },
                            {
                              value: "RW74",
                              label: "RW74",
                            },
                            {
                              value: "RW78",
                              label: "RW78",
                            },
                            {
                              value: "RW79",
                              label: "RW79",
                            },
                            {
                              value: "RW80",
                              label: "RW80",
                            },
                            {
                              value: "RW81",
                              label: "RW81",
                            },
                            {
                              value: "RWR71",
                              label: "RWR71",
                            },
                            {
                              value: "RWR74",
                              label: "RWR74",
                            },
                            {
                              value: "RWR78",
                              label: "RWR78",
                            },
                            {
                              value: "RWR80",
                              label: "RWR80",
                            },
                            {
                              value: "RWR81",
                              label: "RWR81",
                            },
                            {
                              value: "RWR82",
                              label: "RWR82",
                            },
                            {
                              value: "RWR84",
                              label: "RWR84",
                            },
                            {
                              value: "RWR89",
                              label: "RWR89",
                            },

                            {
                              value: "RE",
                              label: "RE",
                            },
                            {
                              value: "RER",
                              label: "RER",
                            },
                            {
                              value: "RT",
                              label: "RT",
                            },
                            {
                              value: "RTR",
                              label: "RTR",
                            },
                            {
                              value: "RR",
                              label: "RR",
                            },
                            {
                              value: "RA",
                              label: "RA",
                            },
                            {
                              value: "RK",
                              label: "RK",
                            },
                            {
                              value: "RP",
                              label: "RP",
                            },
                            {
                              value: "RJ",
                              label: "RJ",
                            },
                            {
                              value: "RJR",
                              label: "RJR",
                            },
                            {
                              value: "RV",
                              label: "RV",
                            },
                            {
                              value: "RQ",
                              label: "RQ",
                            },
                            {
                              value: "RVC",
                              label: "RVC",
                            },
                            {
                              value: "RER",
                              label: "RER",
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
                      <Label>P oper</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="poper"
                          placeholder="poper"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.poper}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="poper" />
                      </Form.Group>
                    </Col>
                    <Col xs={12} lg={6} md={6}>
                      <Label>P Ratio</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="pratio"
                          placeholder="pratio"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.pratio}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="pratio" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="mt-3" xs={12} lg={6} md={6}>
                      <Label>Characteristic</Label>
                      <Form.Group>
                        <Select
                          className="mt-1"
                          type="select"
                          name="characteristic"
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
                            setFieldValue("characteristic", e);
                          }}
                          options={[
                            {
                              value: "to map",
                              label: "to map",
                            },
                          ]}
                          value={values.characteristic}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="characteristic" />
                      </Form.Group>
                    </Col>
                    <Col className="mt-3" xs={12} lg={6} md={6}>
                      <Label># of Resistors</Label>
                      <Form.Group>
                        <Form.Control
                          className="mt-1"
                          type="number"
                          min="0"
                          step="any"
                          name="resistors"
                          placeholder="resistors"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.resistors}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="resistors" />
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
                              value: "S",
                              label: "S",
                            },
                            {
                              value: "R",
                              label: "R",
                            },
                            {
                              value: "P",
                              label: "P",
                            },
                            {
                              value: "M",
                              label: "M",
                            },
                            {
                              value: "MIL",
                              label: "MIL",
                            },
                            {
                              value: "LOWER",
                              label: "LOWER",
                            },
                            {
                              value: "User definable",
                              label: "User definable",
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
