import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
export default function Tube() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = user?._id;

  const milSchema = Yup.object().shape({
    frequency: Yup.object().required("frequency is required"),
    avoutput: Yup.string().required("avoutput is required"),
    piofyears: Yup.string().required("piofyears is required"),
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
          frequency: "",
          avoutput: "",
          utilization: "",
          piofyears:"",
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
                  <Row className="milmodal">
                    <Row className="mt-3">
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
                      <Col xs={12} lg={6} md={6}>
                        <Label>Power</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="avoutput"
                            placeholder="Power"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.avoutput}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="avoutput" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label># Of Years</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="piofyears"
                            placeholder="piofyears"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.piofyears}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="piofyears" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} lg={6} md={6}>
                        <Label>Utilization</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="utilization"
                            placeholder="Utilization"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.utilization}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="utilization" />
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
